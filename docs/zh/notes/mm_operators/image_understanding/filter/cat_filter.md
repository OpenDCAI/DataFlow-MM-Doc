---
title: cat_filter
createTime: 2025/10/15 16:01:27
permalink: /zh/mm_operators/pvcvj9b0/
---
## 📘 概述
`CatFilter`（Caption-as-Teacher）是一个**文本复杂度 + OCR 重叠度**联合过滤算子。它对每条 `caption`：
1) 使用 **Stanza** 做依存句法，抽取主语-谓语-宾语等三元组衡量**语义复杂度**；  
2) 要求句子**包含动词**（动作性）；  
3) 对图片做 **OCR**，计算 OCR 文本与 `caption` 的 **Jaccard 重叠率**，若过高则视为“抄写图片文字”而过滤。  
当三者均满足条件时，样本被保留，否则被剔除

## ```__init__```函数
```python
def __init__(
    self,
    min_triples: int = 2,
    ocr_overlap_threshold: float = 0.2
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `min_triples` | `int` | `2` | 依存句法三元组（主语-谓语-宾语/论元）最小数量阈值，用于判定 caption 的语义复杂度。 |
| `ocr_overlap_threshold` | `float` | `0.2` | OCR 文本与 caption 的 Jaccard 重叠上限；重叠 **≥** 该阈值视为 OCR 抄写，样本将被过滤。 |




## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    caption_key: str
):
    ...
```
执行算子主逻辑：从 `storage` 读取数据表，逐行判断是否满足“复杂度达标 + 含动词 + 非 OCR 纯抄写”。不满足任一条件的样本将被过滤，最终仅写回保留下来的高质量样本行。
参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | 无 | 图片路径列名（如 `"image_path"`）。 |
| `caption_key` | `str` | 无 | 文本标题列名（如 `"caption"`）。 |




## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import CatFilter

# 1) 准备 FileStorage（至少包含 image_path 与 caption）
storage = FileStorage(
    first_entry_file_name="data/cat_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="cat_filter",
    cache_type="jsonl"
)

# 2) 初始化算子
filt = CatFilter(
    min_triples=2,            # 复杂度下限
    ocr_overlap_threshold=0.2 # OCR 与 caption 的最大允许重叠
)

# 3) 执行过滤
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    caption_key="caption"
)
print(cols)  # ["image_path", "caption"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path` | `string` | 无 | 过滤后保留样本的图片路径。 |
| `caption` | `string` | 无 | 过滤后保留样本的标题文本（满足：复杂度 ≥ `min_triples`，且包含动词，并且 OCR 重叠 < `ocr_overlap_threshold`）。 |



示例输入：
```jsonl
{
  "image_path": "1.png",
  "caption": "A bride smiles while the groom points ahead inside a car, their hands resting together on the seat."
}
{
  "image_path": "2.jpg",
  "caption": "SALE SALE SALE 50% OFF"
}
```

示例输出：
```jsonl
{
  "image_path": "1.png",
  "caption": "A bride smiles while the groom points ahead inside a car, their hands resting together on the seat."
}
```