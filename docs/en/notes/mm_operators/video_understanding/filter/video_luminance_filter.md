---
title: Video Luminance Filter (VideoLuminanceFilter)
createTime: 2025/01/20 10:00:00
permalink: /en/mm_operators/video_understanding/filter/video_luminance_filter/
---

## 📘 Overview

`VideoLuminanceFilter` is a video filtering operator based on **luminance statistics**. It directly analyzes and filters entire videos without pre-splitting clips:
1. Samples several frames from the video
2. Computes luminance statistics (mean, min, max)
3. Determines pass/fail based on luminance thresholds (`lum_min`, `lum_max`)
4. Outputs results containing `luminance_mean`, `luminance_min`, `luminance_max`, and `filtered` fields

Suitable for filtering videos that are too dark or too bright, ensuring videos have appropriate luminance ranges.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    input_video_key: str = "video",
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    output_key: str = "video_luminance",
    lum_min: Optional[float] = None,
    lum_max: Optional[float] = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter          | Type              | Default              | Description                                                      |
| :----------------- | :---------------- | :------------------- | :--------------------------------------------------------------- |
| `input_video_key`  | `str`             | `"video"`            | Field name for video paths in input data                         |
| `load_num`         | `int`             | `3`                  | Number of frames to sample from video                            |
| `batch_size`       | `int`             | `64`                 | Batch size for processing                                        |
| `num_workers`      | `int`             | `4`                  | Number of worker processes for data loading                      |
| `output_key`       | `str`             | `"video_luminance"`  | Output field name                                                |
| `lum_min`          | `Optional[float]` | `None`               | Minimum luminance threshold (0-255), videos below this will be marked as `filtered=False` |
| `lum_max`          | `Optional[float]` | `None`               | Maximum luminance threshold (0-255), videos above this will be marked as `filtered=False` |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    lum_min: Optional[float] = None,
    lum_max: Optional[float] = None
) -> None:
    ...
```

Executes the main logic: reads data from storage, samples frames from each video and computes luminance statistics, filters based on thresholds, and writes back to storage.

## 🧾 `run` Parameters

| Parameter          | Type                | Default | Description                                      |
| :----------------- | :------------------ | :------ | :----------------------------------------------- |
| `storage`          | `DataFlowStorage`   | -       | DataFlow storage object                          |
| `input_video_key`  | `Optional[str]`     | `None`  | Video path field name (overrides init param)     |
| `load_num`         | `Optional[int]`     | `None`  | Number of frames to sample (overrides init param)|
| `batch_size`       | `Optional[int]`     | `None`  | Batch size (overrides init param)                |
| `num_workers`      | `Optional[int]`     | `None`  | Number of workers (overrides init param)         |
| `output_key`       | `Optional[str]`     | `None`  | Output field name (overrides init param)         |
| `lum_min`          | `Optional[float]`   | `None`  | Minimum luminance threshold (overrides init param)|
| `lum_max`          | `Optional[float]`   | `None`  | Maximum luminance threshold (overrides init param)|

---

## 🧠 Example Usage

::: tip Complete Example Code
The complete pipeline example code is located at: `playground/video_luminance_filter_pipeline.py`

After initializing with `dataflowmm init`, you can find the complete runnable example at this path.
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoLuminanceFilter

# Step 1: Prepare FileStorage (at least contains video column)
storage = FileStorage(
    first_entry_file_name="data/video_luminance_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_luminance_filter",
    cache_type="jsonl"
)

# Step 2: Initialize operator
filter_op = VideoLuminanceFilter(
    output_key="video_luminance",
    load_num=3,  # Sample 3 frames from video
    batch_size=16,
    num_workers=2,
    lum_min=20,  # Minimum luminance threshold
    lum_max=140  # Maximum luminance threshold
)

# Step 3: Execute filtering
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    output_key="video_luminance"
)
```

---

## 🧾 Output Format

**Added Field:**
- `video_luminance` (dict): Luminance statistics information dictionary

**Dictionary Fields:**

| Field              | Type     | Description                                    |
| :----------------- | :------- | :--------------------------------------------- |
| `luminance_mean`   | `float`  | Mean luminance (0-255)                         |
| `luminance_min`    | `float`  | Minimum luminance (0-255)                      |
| `luminance_max`    | `float`  | Maximum luminance (0-255)                      |
| `filtered`         | `bool`   | Whether passed the filter (only appears when `lum_min` or `lum_max` is set) |

Example Input:

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

Example Output (with `lum_min=20`, `lum_max=140`):

```jsonl
{"video": "./test/video1.mp4", "video_luminance": {"luminance_mean": 80.5, "luminance_min": 15.2, "luminance_max": 180.3, "filtered": true}}
{"video": "./test/video2.mp4", "video_luminance": {"luminance_mean": 10.2, "luminance_min": 5.1, "luminance_max": 25.8, "filtered": false}}
```

---

## 🔗 Related Links

- **Code:** [VideoLuminanceFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_luminance_filter.py)
- **Related Operator:** [VideoLuminanceEvaluator](/en/mm_operators/video_understanding/eval/video_luminance_evaluator/)
