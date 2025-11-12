---
title: Blip分数评估
createTime: 2025/10/15 14:52:29
icon: material-symbols-light:image
permalink: /zh/mm_operators/eval/vqa_score_image_text_evaluator/
---
## 📘 概述
`VQAScoreEvaluator` 使用 **BLIP VQA** 将“图像是否与描述匹配”转化为一个**是/否（Yes/No）概率分数**，范围 `[0,1]`：  
- 构造问题：`Does this image match the description: {text}? Answer yes or no.`  
- 分别以 `labels="yes"` 与 `labels="no"` 前向得到损失 `L_yes`、`L_no`；  
- 通过 `p_yes ∝ exp(-L_yes)`、`p_no ∝ exp(-L_no)` 归一化，得到 `vqa_score = p_yes / (p_yes + p_no)`。




## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base",
    device: str = None,
    local_only: bool = True,
):
  ...
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base"` | BLIP VQA 模型路径或 HF Model ID；通过 `BlipProcessor` / `BlipForQuestionAnswering` 加载。 |
| `device` | `str \| None` | `None` | 推理设备；`None` 时自动选择可用的 `"cuda"`，否则使用 `"cpu"`。 |
| `local_only` | `bool` | `True` | 是否只从本地加载权重（传入 `from_pretrained(local_files_only=True)`）。 |



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str = "image_path",
    text_key: str = "text",
    output_key: str = "vqa_score"
):
    ...
```
执行算子主逻辑
1. 从 `storage` 读取 DataFrame，逐行读取 `image_key` 与 `text_key`。  
2. 若图片无法读取或文本为空，当前行分数置为 `0.0`。  
3. 组装问题：`Does this image match the description: {text}? Answer yes or no.`。  
4. 使用 `BlipProcessor` 打包输入，分别以前向带 `labels="yes"` 与 `labels="no"` 的方式得到损失 `L_yes`、`L_no`。  
5. 计算 `p_yes = exp(-L_yes)`、`p_no = exp(-L_no)`，归一化得到 `score = p_yes / (p_yes + p_no + 1e-8)`，裁剪到 `[0,1]`。  
6. 将分数写入列 `output_key`，回写 `storage` 并返回 `[output_key]`。

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | `"image_path"` | 输入图片列名。 |
| `text_key` | `str` | `"text"` | 输入文本列名。 |
| `output_key` | `str` | `"vqa_score"` | 输出分数字段名（Yes 概率，范围 `[0,1]`）。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VQAScoreEvaluator

# 1) 准备 FileStorage（至少包含 image_path 与 text 两列）
storage = FileStorage(
    first_entry_file_name="data/vqa_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="vqa_score",
    cache_type="jsonl"
)

# 2) 初始化算子（可替换为你的权重路径或HF模型ID）
evaluator = VQAScoreEvaluator(
    model_name="/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base",
    device=None,       # 自动选择 cuda/cpu
    local_only=True    # 仅使用本地权重
)

# 3) 执行评估（新增 vqa_score 列）
cols = evaluator.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text",
    output_key="vqa_score"
)
print(cols)  # ["vqa_score"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path`（或 `image_key` 指定列） | `string` | 无 | 输入图片路径。 |
| `text`（或 `text_key` 指定列） | `string` | 无 | 输入文本描述。 |
| `vqa_score`（或 `output_key`） | `float` | 无 | BLIP 预测“匹配”为 **Yes** 的概率，范围 `[0,1]`。 |


示例输入：
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
```

示例输出：
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car.",
  "vqa_score": 0.774
}
```