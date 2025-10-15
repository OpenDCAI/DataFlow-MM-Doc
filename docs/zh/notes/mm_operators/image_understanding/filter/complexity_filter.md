---
title: complexity_filter
createTime: 2025/10/15 16:10:28
permalink: /zh/mm_operators/chryvffp/
---
## 📘 概述
`ComplexityFilter` 是一个基于 **NLI（自然语言推理）** 的文本过滤算子，用于评估 caption 是否同时覆盖多种视觉能力要素（如颜色、形状、动作识别、计数、空间关系等），从而判定其**能力丰富度**。算子会为每条 caption 构造假设句（模板：`"The following text describes {}."`），使用 MNLI 模型计算 **entailment** 概率；当命中要素的数量达到阈值（`min_k`）时保留该样本，否则过滤掉。

## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "../ckpt/bart-large-mnli",
    threshold: float = 0.4,
    min_k: int = 2,
    device: str = None
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"../ckpt/bart-large-mnli"` | NLI 模型本地路径或 Hugging Face Model ID；内部以 `AutoTokenizer`/`AutoModelForSequenceClassification` 加载（`local_files_only=True`, `use_safetensors=True`, `weights_only=False`）。 |
| `threshold` | `float` | `0.4` | 将某一能力要素判定为“命中（entailment）”的最低概率阈值；越高越严格。 |
| `min_k` | `int` | `2` | 至少需要命中的能力要素个数；低于该值的样本将被过滤。 |
| `device` | `str \| None` | `None` | 推理设备；`None` 时自动选择可用的 `"cuda"` 否则回退到 `"cpu"`。 |



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    caption_key: str
):
    ...
```
执行算子主逻辑：从 `storage` 读取数据表，对`caption_key`指定的列逐条做 NLI 评估，仅保留命中要素数量`≥ min_k`的样本行，并写回存储。

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `caption_key` | `str` | 无 | 待评估文本列名（如 `"caption"`）。 |



## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ComplexityFilter

# 1) 准备 FileStorage（至少包含 caption 列）
storage = FileStorage(
    first_entry_file_name="data/complexity_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="complexity_filter",
    cache_type="jsonl"
)

# 2) 初始化算子（可用本地或HF模型）
filt = ComplexityFilter(
    model_name="../ckpt/bart-large-mnli",   # 或 "facebook/bart-large-mnli"
    threshold=0.4,                          # entailment 概率阈值
    min_k=2,                                # 至少命中2个能力要素
    device=None                             # 自动选择cuda/cpu
)

# 3) 执行过滤
cols = filt.run(
    storage=storage.step(),
    caption_key="caption"
)
print(cols)  # ["caption"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `caption` | `string` | 无 | 过滤后保留的 caption 文本；仅保留命中要素数 `≥ min_k` 的样本行。 |


示例输入：
```jsonl
{
  "caption": "A red double-decker bus turns left at a city intersection while pedestrians wait at the crosswalk."
}
{
  "caption": "SALE SALE SALE 50% OFF"
}
{
  "caption": "Two kids count seashells on a sandy beach while their mother reads under a blue umbrella."
}
```

示例输出：
```jsonl
{
  "caption": "A red double-decker bus turns left at a city intersection while pedestrians wait at the crosswalk."
}
{
  "caption": "Two kids count seashells on a sandy beach while their mother reads under a blue umbrella."
}
```