---
title: image_aesthetic_filter
createTime: 2025/10/15 19:56:51
icon: material-symbols-light:image
permalink: /en/mm_operators/image_aesthetic_filter/
---
## 📘 Overview
`ImageAestheticFilter` is a **basic image aesthetic filtering operator** designed to quickly remove low-quality images.  
It evaluates four grayscale-based metrics for each image: **sharpness** (Laplacian variance), **brightness** (mean), **contrast** (standard deviation), and **extreme pixel ratio** (proportion of near-black or near-white pixels).  
A sample is retained only if all four metrics meet the defined thresholds.



## ```__init__```
```python
def __init__(
    self,
    blur_thresh: float = 150.0,
    brightness_range: tuple[float, float] = (30, 230),
    contrast_thresh: float = 40.0,
    max_black_ratio: float = 0.90,
    max_white_ratio: float = 0.90
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `blur_thresh` | `float` | `150.0` | Threshold for image sharpness (Laplacian variance); higher values indicate stricter sharpness requirements. |
| `brightness_range` | `tuple[float, float]` | `(30, 230)` | Allowed average brightness range (grayscale values 0–255). |
| `contrast_thresh` | `float` | `40.0` | Minimum required contrast level (grayscale standard deviation); higher means more contrast required. |
| `max_black_ratio` | `float` | `0.90` | Upper limit for near-black pixel ratio (<10); exceeding this suggests extreme darkness or large occluded areas. |
| `max_white_ratio` | `float` | `0.90` | Upper limit for near-white pixel ratio (>245); exceeding this indicates overexposure or excessive white areas. |


## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str
):
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `image_key` | `str` | — | The column name containing the image path (e.g., `"image_path"`). |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ImageAestheticFilter

# 1) Prepare FileStorage (must contain an image_path column)
storage = FileStorage(
    first_entry_file_name="data/aesthetic_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="img_aesthetic",
    cache_type="jsonl"
)

# 2) Initialize the operator (thresholds can be adjusted as needed)
flt = ImageAestheticFilter(
    blur_thresh=150.0,
    brightness_range=(30, 230),
    contrast_thresh=40.0,
    max_black_ratio=0.90,
    max_white_ratio=0.90
)

# 3) Execute filtering
cols = flt.run(
    storage=storage.step(),
    image_key="image_path"
)
print(cols)  # ["image_path"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` | `string` | The retained image path after filtering. |
| `quality` | `bool` | The image quality flag; only samples with `quality=True` are kept in the output. |


Example Input:
```jsonl
{
  "image_path": "1.png"
}
{
  "image_path": "2.jpg"
}
```

Example Output:
```jsonl
{
  "image_path": "1.png",
  "quality": true
}
```