---
title: cat_filter
createTime: 2025/10/15 19:56:39
icon: material-symbols-light:image
permalink: /en/mm_operators/cat_filter/
---
## 📘 Overview
`CatFilter` (Caption-as-Teacher) is a **joint filtering operator** based on **textual complexity** and **OCR overlap rate**.  
For each `caption`, it performs the following operations:
1. Uses **Stanza** for dependency parsing to extract subject-verb-object triples and assess **semantic complexity**.  
2. Requires the sentence to **contain at least one verb** (actional requirement).  
3. Applies **OCR** on the associated image and computes the **Jaccard overlap** between OCR text and `caption`; captions with excessive overlap are considered direct OCR copies and are filtered out.  

A sample is retained only if it meets **all three conditions**.


## ```__init__```
```python
def __init__(
    self,
    min_triples: int = 2,
    ocr_overlap_threshold: float = 0.2
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `min_triples` | `int` | `2` | The minimum number of dependency triples (subject-verb-object or argument structures) required to determine sufficient caption complexity. |
| `ocr_overlap_threshold` | `float` | `0.2` | The maximum allowed Jaccard overlap between OCR text and caption. If overlap **≥** this threshold, the sample is considered an OCR copy and is filtered out. |



## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    caption_key: str
):
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object for reading and writing. |
| `image_key` | `str` | — | The column name for image paths (e.g., `"image_path"`). |
| `caption_key` | `str` | — | The column name for caption text (e.g., `"caption"`). |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import CatFilter

# 1) Prepare FileStorage (must contain image_path and caption columns)
storage = FileStorage(
    first_entry_file_name="data/cat_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="cat_filter",
    cache_type="jsonl"
)

# 2) Initialize the operator
filt = CatFilter(
    min_triples=2,            # minimum complexity threshold
    ocr_overlap_threshold=0.2 # maximum allowed OCR overlap
)

# 3) Execute filtering
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    caption_key="caption"
)
print(cols)  # ["image_path", "caption"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` | `string` | The retained image path after filtering. |
| `caption` | `string` | The retained caption text that meets all three conditions: complexity ≥ `min_triples`, contains verbs, and OCR overlap < `ocr_overlap_threshold`. |


Example Input:
```jsonl
  "caption": "SALE SALE SALE 50% OFF"

{
  "caption": "Two kids count seashells on a sandy beach while their mother reads under a blue umbrella."
}
```

Example Output:
```jsonl
{
  "image_path": "1.png",
  "caption": "A bride smiles while the groom points ahead inside a car, their hands resting together on the seat."
}
```