---
title: Video Aesthetic Evaluator (VideoAestheticEvaluator)
createTime: 2025/01/20 11:00:00
permalink: /en/mm_operators/video_understanding/eval/video_aesthetic_evaluator/
---

## 📘 Overview

`VideoAestheticEvaluator` is a **video aesthetic evaluation operator** that uses CLIP encoder + MLP regression head to score video clips. It reads upstream extracted video frames, calculates aesthetic scores for each clip, and writes the scores back into the `video_clips` field.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    figure_root: str = "extract_frames",
    input_video_key: str = "video",
    video_clips_key: str = "video_clips",
    clip_model: str = "ViT-L/14",
    mlp_checkpoint: Optional[str] = None,
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    init_distributed: bool = False,
    output_key: str = "video_clips"
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter          | Type            | Default              | Description                           |
| :----------------- | :-------------- | :------------------- | :------------------------------------ |
| `figure_root`      | `str`           | `"extract_frames"`   | Root directory for extracted frames   |
| `input_video_key`  | `str`           | `"video"`            | Field name for video path             |
| `video_clips_key`  | `str`           | `"video_clips"`      | Field name for video clips            |
| `clip_model`       | `str`           | `"ViT-L/14"`         | CLIP model name or path               |
| `mlp_checkpoint`   | `Optional[str]` | `None`               | MLP regression head weights path      |
| `load_num`         | `int`           | `3`                  | Number of frames per clip to load     |
| `batch_size`       | `int`           | `64`                 | Batch size for processing             |
| `num_workers`      | `int`           | `4`                  | Number of data loading workers        |
| `init_distributed` | `bool`          | `False`              | Whether to initialize distributed training |
| `output_key`       | `str`           | `"video_clips"`      | Output field name (updated clips)     |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    figure_root: Optional[str] = None,
    input_video_key: Optional[str] = None,
    video_clips_key: Optional[str] = None,
    clip_model: Optional[str] = None,
    mlp_checkpoint: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    init_distributed: Optional[bool] = None,
    output_key: Optional[str] = None
):
    ...
```

Executes the main logic: reads dataframe and extracted video frames from storage, computes aesthetic scores for each clip using CLIP + MLP, and writes back to storage.

## 🧾 `run` Parameters

All parameters are optional and override initialization parameters. Parameter descriptions are the same as in `__init__`.

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoAestheticEvaluator

# Step 1: Prepare FileStorage (needs video, video_clips columns)
# Note: VideoFrameFilter must be run first to extract frames
storage = FileStorage(
    first_entry_file_name="data/video_aesthetic_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_aesthetic",
    cache_type="jsonl"
)

# Step 2: Initialize operator
evaluator = VideoAestheticEvaluator(
    figure_root="./cache/extract_frames",
    input_video_key="video",
    video_clips_key="video_clips",
    clip_model="/path/to/ViT-L-14.pt",
    mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",
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
- `video_clips` (dict): Updated video clips dictionary, adds `aesthetic_score` to each clip

**New Field in Each Clip:**

| Field              | Type    | Description                             |
| :----------------- | :------ | :-------------------------------------- |
| `aesthetic_score`  | `float` | Aesthetic score (higher means better quality) |

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
        "aesthetic_score": 5.8
      }
    ]
  }
}
```

---

## 🔗 Related Links

- **Code:** [VideoAestheticEvaluator](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/eval/video_aesthetic_evaluator.py)
