---
title: Video Luminance Evaluator (VideoLuminanceEvaluator)
createTime: 2025/01/20 11:00:00
permalink: /en/mm_operators/video_understanding/eval/video_luminance_evaluator/
---

## 📘 Overview

`VideoLuminanceEvaluator` is a **video luminance evaluation operator** that analyzes luminance statistics of video clips. It reads upstream extracted video frames, calculates mean, min, and max luminance for each clip, and writes the statistics back into the `video_clips` field.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    figure_root: str = "extract_frames",
    input_video_key: str = "video",
    video_clips_key: str = "video_clips",
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    init_distributed: bool = False,
    output_key: str = "video_clips"
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter          | Type   | Default            | Description                           |
| :----------------- | :----- | :----------------- | :------------------------------------ |
| `figure_root`      | `str`  | `"extract_frames"` | Root directory for extracted frames   |
| `input_video_key`  | `str`  | `"video"`          | Field name for video path             |
| `video_clips_key`  | `str`  | `"video_clips"`    | Field name for video clips            |
| `load_num`         | `int`  | `3`                | Number of frames per clip to load     |
| `batch_size`       | `int`  | `64`               | Batch size for processing             |
| `num_workers`      | `int`  | `4`                | Number of data loading workers        |
| `init_distributed` | `bool` | `False`            | Whether to initialize distributed training |
| `output_key`       | `str`  | `"video_clips"`    | Output field name (updated clips)     |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    figure_root: Optional[str] = None,
    input_video_key: Optional[str] = None,
    video_clips_key: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    init_distributed: Optional[bool] = None,
    output_key: Optional[str] = None
):
    ...
```

Executes the main logic: reads dataframe and extracted video frames from storage, computes luminance statistics for each clip (using ITU-R BT.709 standard), and writes back to storage.

## 🧾 `run` Parameters

All parameters are optional and override initialization parameters. Parameter descriptions are the same as in `__init__`.

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoLuminanceEvaluator

# Step 1: Prepare FileStorage (needs video, video_clips columns)
# Note: VideoFrameFilter must be run first to extract frames
storage = FileStorage(
    first_entry_file_name="data/video_luminance_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_luminance",
    cache_type="jsonl"
)

# Step 2: Initialize operator
evaluator = VideoLuminanceEvaluator(
    figure_root="./cache/extract_frames",
    input_video_key="video",
    video_clips_key="video_clips",
    load_num=3,
    batch_size=64,
    num_workers=4,
    init_distributed=False
)

# Step 3: Execute evaluation
evaluator.run(
    storage=storage.step()
)
```

---

### 🧾 Default Output Format

**Modified Field:**
- `video_clips` (dict): Updated video clips dictionary, adds luminance statistics to each clip

**New Fields in Each Clip:**

| Field             | Type    | Description                             |
| :---------------- | :------ | :-------------------------------------- |
| `luminance_mean`  | `float` | Mean luminance (0-255, ITU-R BT.709)    |
| `luminance_min`   | `float` | Minimum luminance (frame average min)   |
| `luminance_max`   | `float` | Maximum luminance (frame average max)   |

Example Input:

```jsonl
{
  "video": ["./test/video1.mp4"],
  "video_clips": {
    "clips": [
      {
        "id": "video1_0",
        "frame_start": 0,
        "frame_end": 150,
        "num_frames": 150
      }
    ]
  }
}
```

Example Output:

```jsonl
{
  "video": ["./test/video1.mp4"],
  "video_clips": {
    "clips": [
      {
        "id": "video1_0",
        "frame_start": 0,
        "frame_end": 150,
        "num_frames": 150,
        "luminance_mean": 120.5,
        "luminance_min": 85.2,
        "luminance_max": 180.3
      }
    ]
  }
}
```

---

## 🔗 Related Links

- **Code:** [VideoLuminanceEvaluator](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/eval/video_luminance_evaluator.py)
