---
title: 敏感内容过滤（SensitiveFilter）
createTime: 2025/10/15 15:31:35
icon: material-symbols-light:image
permalink: /zh/mm_operators/filter/image_sensitive_filter/
---
## 📘 概述
`ImageSensitiveFilter` 基于 **BART Large MNLI** 零样本自然语言推理模型，对与图像相关的多列文本进行**多标签安全检测**，自动识别以下高风险内容并过滤样本：

- 性相关内容（色情、裸体等）
- 暴力或伤害
- 自杀 / 自残
- 仇恨言论
- 骚扰 / 侮辱
- 威胁 / 恐吓

与传统关键词黑名单不同，本算子通过“文本 + 风险描述”的 NLI 蕴含关系来判断是否存在敏感内容，更加**灵活、可扩展**，适用于多模态数据的安全合规清洗。

## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "facebook/bart-large-mnli",
    threshold: float = 0.5,
    device: str | None = None,
):
    ...
```



## `init`参数说明
| 参数名       | 类型              | 默认值                        | 说明 |
| :---------- | :---------------- | :---------------------------- | :--- |
| `model_name` | `str`            | `"facebook/bart-large-mnli"` | NLI 模型本地路径或 Hugging Face Model ID；内部通过 `AutoTokenizer` / `AutoModelForSequenceClassification` 加载（`local_files_only=True`, `use_safetensors=True`, `weights_only=False`）。 |
| `threshold` | `float`           | `0.5`                        | 风险类别的**蕴含概率阈值**；当任一风险标签的蕴含概率 `≥ threshold` 时，即判定该文本为“不安全”。阈值越高，过滤越严格。 |
| `device`    | `str \| None`     | `None`                       | 推理设备；`None` 时自动选择可用的 `"cuda"`，否则使用 `"cpu"`。 |



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    input_image_key: str,
    input_text_keys: list
):
    ...
```
执行算子主逻辑：

1. 从 `storage` 读取 DataFrame，逐行遍历样本；对每一行读取：
   - 图像路径：`row[input_image_key]`
   - 多个文本字段：`[row[k] for k in input_text_keys]`  

2. **图像路径检查**（轻量级）：
   - 若 `image_path` 为空或对应文件在磁盘上不存在，直接视为“不安全”，该行被过滤并记录 warning 日志。  
   - 本版本不做图像内容识别，仅做路径存在性检查（图像内容安全建议由其他算子处理）。  

3. **文本敏感性检测（NLI 多标签风险评分）**：  
   对于当前行的每一个文本字段 `text`：
   1. 若文本为空或全是空白，返回所有风险标签得分 `0.0`。  
   2. 否则，对每个风险标签 `label`（如 `"violence"`, `"hate"` 等），构造对应的**风险描述句** `desc`，例如：  
      - `"The text describes physical violence, injury, or killing."`  
      - `"The text attacks or insults a group based on race, religion, gender or similar traits."`  
   3. 调用 `AutoTokenizer` 对 `(premise=text, hypothesis=desc)` 编码，并送入 MNLI 模型：  
      - 取输出 logits 对应的 `entailment` 概率（索引 2）作为该 label 的风险分数 `score[label]`。  
   4. 汇总得到当前文本的风险得分字典：`{label_name: entail_prob}`。  

4. **样本级安全判定**：
   - 对一行中所有文本字段和所有风险标签的分数取最大值：`max_risk = max(all_scores)`。  
   - 若 `max_risk ≥ threshold`，则判定该样本在某一风险类别上高度敏感：  
     - 标记为“不安全”，该行被过滤，并在调试日志中打印：行号、图像路径以及截断后的文本内容。  
   - 若 `max_risk < threshold`，则该图文样本判定为“安全”，予以保留。  

5. 将所有“安全”样本对应的布尔掩码 `refined_mask` 应用于原 DataFrame，得到过滤后的新 DataFrame：  
   - 调用 `reset_index(drop=True)` 重排索引。  
   - 使用 `storage.write(filtered_df)` 将结果写回。  

6. 返回列名列表：
   - 返回 `[input_image_key] + input_text_keys`，用于下游算子作为输入列名约定。  


参数
| 参数名           | 类型              | 默认值 | 说明 |
| :-------------- | :---------------- | :----- | :--- |
| `storage`       | `DataFlowStorage` | 无     | Dataflow 的读写存储对象。 |
| `input_image_key` | `str`           | 无     | 图像路径所在列的列名（如 `"image"`）。仅用于检查路径是否存在，不做图像内容推理。 |
| `input_text_keys` | `list[str]`     | 无     | 需要进行敏感性检测的文本列名列表（如 `["caption", "question", "answer"]`）。算子会对列表中的每一列文本逐条进行风险评估。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ImageSensitiveFilter

# 1) 准备 FileStorage（至少包含 image、caption 等列）
storage = FileStorage(
    first_entry_file_name="./dataflow/example/test_image_filter/test_image_filter.jsonl",
    cache_path="./cache_local",
    file_name_prefix="imgtext_sensitive_filter",
    cache_type="jsonl"
)

# 2) 初始化算子（可使用本地或 HF 模型ID）
filt = ImageSensitiveFilter(
    model_name="facebook/bart-large-mnli",  # 或本地 ckpt 路径
    threshold=0.5,                          # 风险判定阈值
    device=None                             # 自动选择 cuda/cpu
)

# 3) 执行过滤：对 image + 多列文本做敏感内容检测
cols = filt.run(
    storage=storage.step(),
    input_image_key="image",
    input_text_keys=["caption", "question", "answer"]
)
print(cols)  # ["image", "caption", "question", "answer"]
```

### 🧾 默认输出格式（Output Format）


| 字段                      | 类型     | 默认值 | 说明 |
| :------------------------ | :------- | :----- | :--- |
| `input_image_key` 对应列  | `string` | 无     | 原始图像路径列，过滤后仅保留通过安全检测的样本行。 |
| `input_text_keys` 对应各列 | `string` | 无    | 原始文本列（caption / question / answer 等），过滤后仅保留文本均通过安全检测的样本行。 |



示例输入：
```jsonl
{{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
{
  "image_path": "2.jpg",
  "text": "Some abusive or hateful phrase here."
}
```

示例输出：
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
```