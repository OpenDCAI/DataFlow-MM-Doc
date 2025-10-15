---
title: clip_filter
createTime: 2025/10/15 15:48:32
permalink: /zh/mm_operators/ufpi46br/
---
## 📘 概述
`ClipFilter` 是一个基于 **CLIP 相似度** 的图文一致性过滤算子。对每条样本计算图片与文本的归一化嵌入余弦相似度（映射到 `[0,1]` 范围内），当相似度 **≥ 阈值**（`threshold`）时保留该样本，否则过滤掉。


## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "../ckpt/clip-vit-base-patch32",
    device: str = None
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"../ckpt/clip-vit-base-patch32"` | CLIP 模型本地路径或 Hugging Face Model ID。内部以 `CLIPProcessor` / `CLIPModel` 加载（`use_safetensors=True`, `weights_only=False`）。 |
| `device` | `str \| None` | `None` | 推理设备；`None` 时自动选择可用的 `"cuda"`，否则回退到 `"cpu"`。 |





## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str = "image",
    caption_key: str = "caption",
    threshold: float = 0.25
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