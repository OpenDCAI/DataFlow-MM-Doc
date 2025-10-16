---
title: deduplication_filter
createTime: 2025/10/15 19:56:47
icon: material-symbols-light:image
permalink: /en/mm_operators/deduplication_filter/
---
## 📘 Overview
`DeduplicateFilter` is a **duplicate removal operator** based on **CLIP image embedding similarity**.  
It extracts CLIP feature vectors for all images in a dataset and computes pairwise cosine similarity.  
For any image pair with similarity **≥ `threshold`**, the operator keeps the **first** image and removes the **later duplicates**.  
Additionally, it records the **maximum similarity score** for each retained image (stored in the column `output_score_key`, default: `max_similarity`) for auditing purposes.


## ```__init__```
```python
def __init__(
    self,
    model_name: str = "openai/clip-vit-base-patch32",
    threshold: float = 0.90,
    batch_size: int = 32,
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"openai/clip-vit-base-patch32"` | The CLIP model used to extract image embeddings (Hugging Face Model ID or local path). |
| `threshold` | `float` | `0.90` | The deduplication threshold; if cosine similarity between two images **≥** this value, the later image is considered a duplicate and removed. |
| `batch_size` | `int` | `32` | The batch size for CLIP inference; higher values increase throughput but also memory usage. |
| `device` | `str` | `"cuda"` if available, otherwise `"cpu"` | The device used for model inference. |



## `run`
```python
def run(
    self, 
    storage: DataFlowStorage,
    input_image_key: str = "image",
    output_score_key: str = "max_similarity"
) -> None:
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `input_image_key` | `str` | `"image"` | The column name containing image paths or objects that can be parsed by `_load_image`. |
| `output_score_key` | `str` | `"max_similarity"` | The name of the column storing each image’s maximum similarity with all others. |


## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import DeduplicateFilter

# 1) Prepare FileStorage (must contain an "image" column)
storage = FileStorage(
    first_entry_file_name="data/dedup_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="image_dedup",
    cache_type="jsonl"
)

# 2) Initialize the operator
dedup = DeduplicateFilter(
    model_name="openai/clip-vit-base-patch32",
    threshold=0.90,
    batch_size=32,
    device="cuda"  # or "cpu"
)

# 3) Execute deduplication
dedup.run(
    storage=storage.step(),
    input_image_key="image",           # image column
    output_score_key="max_similarity"  # column to record max similarity
)
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image` (or the column specified by `input_image_key`) | `string/any` | The retained image entries after deduplication. |
| `max_similarity` (or the column specified by `output_score_key`) | `float` | The maximum similarity score of this image compared to all others (for audit; duplicate rows are excluded from output). |

Example Input:
```jsonl
{
  "image": "a.jpg"
}
{
  "image": "b.jpg"
}
{
  "image": "a_copy.jpg"
}
```

Example Output:
```jsonl
{
  "image": "a.jpg",
  "max_similarity": 0.96
}
{
  "image": "b.jpg",
  "max_similarity": 0.12
}
```