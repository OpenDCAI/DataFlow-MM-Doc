---
title: text_image_diversity_filter
createTime: 2025/10/15 19:57:00
icon: material-symbols-light:image
permalink: /en/mm_operators/text_image_diversity_filter/
---
## 📘 Overview
`TextImageDiversityFilter` is a **joint text-image deduplication operator** that ensures both textual and visual diversity in a dataset.  

- **Text side:** Uses **TF-IDF + cosine similarity** to compute the maximum similarity between the current text and the historical corpus. A sample is considered *textually unique* if the similarity is below `text_thresh`.  
- **Image side:** Uses **perceptual hash (pHash)** and computes the Hamming distance. A sample is considered *visually unique* if the distance is greater than `img_dist_thresh`.  

A sample is retained only if **both the text and image are unique**; otherwise, it is filtered out.



## ```__init__```
```python
def __init__(
    self,
    text_thresh: float = 0.8,
    hash_size: int = 8,
    img_dist_thresh: int = 5
):
    ...
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text_thresh` | `float` | `0.8` | Text uniqueness threshold. The maximum cosine similarity with the most recent corpus (managed by the internal `TextDuplicateFilter`) must be **< this value** to be considered unique. |
| `hash_size` | `int` | `8` | Hash size used for perceptual hashing (pHash). Larger values capture finer visual details but require more computation and memory (used by `ImageDuplicateFilter`). |
| `img_dist_thresh` | `int` | `5` | Image uniqueness threshold. The minimum Hamming distance with the most recent image hashes must be **> this value** to be considered unique. |


## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    te
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `image_key` | `str` | — | The column name containing the image path (e.g., `"image_path"`). |
| `text_key` | `str` | — | The column name containing the text content (e.g., `"text"` or `"caption"`). |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import TextImageDiversityFilter

# 1) Prepare FileStorage (must contain image_path and text columns)
storage = FileStorage(
    first_entry_file_name="data/ti_diversity_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="ti_diversity",
    cache_type="jsonl"
)

# 2) Initialize the operator
filt = TextImageDiversityFilter(
    text_thresh=0.8,   # Text uniqueness threshold (lower = looser)
    hash_size=8,       # pHash size
    img_dist_thresh=5  # Image uniqueness threshold (higher = stricter)
)

# 3) Execute filtering
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text"
)
print(cols)  # ["image_path", "text"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` / specified `image_key` | `string` | The retained image path after deduplication. |
| `text` / specified `text_key` | `string` | The retained text content after deduplication. |

Example Input:
```jsonl
{
  "image_path": "a.jpg",
  "text": "A cat sitting on a wooden chair."
}
{
  "image_path": "a_dup.jpg",
  "text": "A cat sits on a wooden chair."
}
{
  "image_path": "b.jpg",
  "text": "A bus driving through a snowy mountain pass at night."
}
```

Example Output:
```jsonl
{
  "image_path": "a.jpg",
  "text": "A cat sitting on a wooden chair."
}
{
  "image_path": "b.jpg",
  "text": "A bus driving through a snowy mountain pass at night."
}
```