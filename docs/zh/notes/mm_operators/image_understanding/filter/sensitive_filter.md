---
title: 敏感内容过滤（SensitiveFilter）
createTime: 2025/10/15 15:31:35
icon: material-symbols-light:image
permalink: /zh/mm_operators/filter/sensitive_filter/
---
## 📘 概述
`SensitiveFilter` 是一个**敏感内容过滤**算子，联合**图像敏感分类（NSFW）**与**文本毒性/仇恨检测**对样本进行筛除。  
- 图像侧：使用图像分类模型判断是否命中 `{porn, hentai, sexy, nsfw}` 等标签，且分数 ≥ `img_thresh`；  
- 文本侧：使用文本分类模型判断是否命中 `{toxic, offensive, hate, obscene, threat, sexual_explicit, identity_attack}`，且分数 ≥ `txt_thresh`；  
只要图像或任一文本判定为“不安全”，该样本即被过滤。

## ```__init__```函数
```python
def __init__(
    self,
    img_model_name="../ckpt/nsfw_image_detection",
    txt_model_name="../ckpt/toxic-bert",
    img_thresh=0.5,
    txt_thresh=0.5,
):
    ...
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `img_model_name` | `str` | `"../ckpt/nsfw_image_detection"` | 图像敏感检测模型本地路径或 HF Model ID；内部以 `AutoImageProcessor` / `AutoModelForImageClassification` 加载（`use_safetensors=True`, `weights_only=False`）。 |
| `txt_model_name` | `str` | `"../ckpt/toxic-bert"` | 文本毒性检测模型本地路径或 HF Model ID；内部以 `AutoTokenizer` / `AutoModelForSequenceClassification` 加载（`use_safetensors=True`, `weights_only=False`）。 |
| `img_thresh` | `float` | `0.5` | 图像敏感分数阈值；若命中 `{porn,hentai,sexy,nsfw}` 且分数 **≥** 阈值则判为不安全。 |
| `txt_thresh` | `float` | `0.5` | 文本敏感分数阈值；若命中 `{toxic,offensive,hate,obscene,threat,sexual_explicit,identity_attack}` 且分数 **≥** 阈值则判为不安全。 |



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    text_keys: list
):
    ...
```
执行算子主逻辑：
1. 从 `storage` 读取 DataFrame（至少包含 `image_key` 与 `text_keys` 指定列）。
2. 对于每一行样本：
   - **图像侧**：使用 `img_model_name` 对图片做分类，若命中 `{porn,hentai,sexy,nsfw}` 且分数 **≥ `img_thresh`** → 判为不安全。
   - **文本侧**：对 `text_keys` 中的每个文本使用 `txt_model_name` 做分类，若命中 `{toxic,offensive,hate,obscene,threat,sexual_explicit,identity_attack}` 且分数 **≥ `txt_thresh`** → 判为不安全。
   - 只要图像或任一文本为不安全，则该样本标记为 **过滤**；否则标记为 **保留**。
3. 仅保留“安全”的样本行（图像安全 **且** 所有文本均安全），重置索引并写回 `storage`。
4. 返回参与处理的列名列表：`[image_key] + text_keys`。

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | 无 | 图片路径列名（如 `"image_path"`）。 |
| `text_keys` | `list[str]` | 无 | 需要检测的文本列名列表（如 `["caption","question","answer"]`）。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import SensitiveFilter

# 1) 准备 FileStorage（至少包含 image_path 与若干文本列）
storage = FileStorage(
    first_entry_file_name="data/sensitive_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="sensitive_filter",
    cache_type="jsonl"
)

# 2) 初始化算子（可换为 HF 模型ID，例如：
#     img_model_name="Falconsai/nsfw_image_detection",
#     txt_model_name="unitary/toxic-bert"）
filt = SensitiveFilter(
    img_model_name="../ckpt/nsfw_image_detection",
    txt_model_name="../ckpt/toxic-bert",
    img_thresh=0.5,
    txt_thresh=0.5,
)

# 3) 执行过滤
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    text_keys=["text"]  # 或 ["caption","question","answer"]
)
print(cols)  # ["image_path", "text"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path` / `image_key` 指定列 | `string` | 无 | 过滤后保留样本的图片路径。 |
| 各 `text_keys` 指定列 | `string` | 无 | 过滤后保留样本的文本字段；仅包含图像与所有文本均判定为安全的行。 |


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