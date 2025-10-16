---
title: clip_filter
createTime: 2025/10/15 19:56:41
icon: material-symbols-light:image
permalink: /en/mm_operators/clip_filter/
---
## 📘 Overview
`ClipFilter` is a **consistency filtering operator** based on **CLIP similarity**.  
For each sample, it computes the cosine similarity between the normalized image and text embeddings (mapped to the `[0,1]` range).  
Samples with similarity **≥ `threshold`** are retained, while others are filtered out.



## ```__init__```
```python
def __init__(
    self,
    model_name: str = "../ckpt/clip-vit-base-patch32",
    device: str = None
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"../ckpt/clip-vit-base-patch32"` | The local path or Hugging Face Model ID for the CLIP model. Internally loaded using `CLIPProcessor` and `CLIPModel` (`use_safetensors=True`, `weights_only=False`). |
| `device` | `str \| None` | `None` | The inference device; if `None`, automatically selects `"cuda"` when available, otherwise falls back to `"cpu"`. |




## `run`
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

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `image_key` | `str` | `"image"` | The column name containing the image path. |
| `caption_key` | `str` | `"caption"` | The column name containing the text description. |
| `threshold` | `float` | `0.25` | The minimum CLIP similarity required to retain a sample; samples below this value will be filtered out. |




## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ClipFilter

# 1) Prepare FileStorage (must contain "image" and "caption" columns)
storage = FileStorage(
    first_entry_file_name="data/clip_filter_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="clip_filter",
    cache_type="jsonl"
)

# 2) Initialize the operator (can use local or Hugging Face model)
flt = ClipFilter(
    model_name="../ckpt/clip-vit-base-patch32",  # or "openai/clip-vit-base-patch32"
    device=None                                 # auto-select cuda/cpu
)

# 3) Execute filtering (retains only samples with similarity ≥ 0.25)
cols = flt.run(
    storage=storage.step(),
    image_key="image",
    caption_key="caption",
    threshold=0.25
)
print(cols)  # ["image", "caption"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image` | `string` | The retained image path after filtering. |
| `caption` | `string` | The retained caption text whose image-text similarity is **≥ `threshold`**. |

Example Input:
```jsonl
{
  "image": "1.png",
  "caption": "A bride and groom smiling in a car."
}
{
  "image": "2.jpg",
  "caption": "A red bus driving across a snowy mountain road at night."
}
```

Example Output:
```jsonl
{
  "image": "1.png",
  "caption": "A bride and groom smiling in a car."
}
```