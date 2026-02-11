---
title: Video OCR Evaluator (VideoOCREvaluator)
createTime: 2025/01/20 11:00:00
permalink: /en/mm_operators/video_understanding/eval/video_ocr_evaluator/
---

## 📘 Overview

`VideoOCREvaluator` is a **video OCR evaluation operator** that uses PaddleOCR to detect and recognize text in video clips. It reads upstream extracted video frames, calculates the ratio of text area to frame area for each clip, and writes the OCR scores back into the `video_clips` field.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    figure_root: str = "extract_frames",
    input_video_key: str = "video",
    video_clips_key: str = "video_clips",
    load_num: int = 3,
    batch_size: int = 8,
    num_workers: int = 4,
    gpu_num: int = 0,
    init_distributed: bool = False,
    output_key: str = "video_clips",
    det_model_dir: str = None,
    rec_model_dir: str = None
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
| `batch_size`       | `int`  | `8`                | Batch size for processing             |
| `num_workers`      | `int`  | `4`                | Number of data loading workers        |
| `gpu_num`          | `int`  | `0`                | GPU ID (0+ for GPU, -1 for CPU)       |
| `init_distributed` | `bool` | `False`            | Whether to initialize distributed training |
| `output_key`       | `str`  | `"video_clips"`    | Output field name (updated clips)     |
| `det_model_dir`    | `str`  | `None`             | PaddleOCR detection model directory path (optional) |
| `rec_model_dir`    | `str`  | `None`             | PaddleOCR recognition model directory path (optional) |

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
    gpu_num: Optional[int] = None,
    init_distributed: Optional[bool] = None,
    output_key: Optional[str] = None,
    det_model_dir: Optional[str] = None,
    rec_model_dir: Optional[str] = None
):
    ...
```

Executes the main logic: reads dataframe and extracted video frames from storage, uses PaddleOCR to detect text regions, calculates text area ratio, and writes back to storage.

## 🧾 `run` Parameters

All parameters are optional and override initialization parameters. Parameter descriptions are the same as in `__init__`.

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoOCREvaluator

# Step 1: Prepare FileStorage (needs video, video_clips columns)
# Note: VideoFrameFilter must be run first to extract frames
storage = FileStorage(
    first_entry_file_name="data/video_ocr_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_ocr",
    cache_type="jsonl"
)

# Step 2: Initialize operator
evaluator = VideoOCREvaluator(
    figure_root="./cache/extract_frames",
    input_video_key="video",
    video_clips_key="video_clips",
    load_num=3,
    batch_size=8,
    num_workers=4,
    gpu_num=0,  # Use GPU 0
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
- `video_clips` (dict): Updated video clips dictionary, adds `ocr_score` to each clip

**New Field in Each Clip:**

| Field       | Type    | Description                             |
| :---------- | :------ | :-------------------------------------- |
| `ocr_score` | `float` | OCR score (text area ratio, 0-1, higher means more text) |

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
        "num_frames": 150,
        "height": 720,
        "width": 1280
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
        "height": 720,
        "width": 1280,
        "ocr_score": 0.15
      }
    ]
  }
}
```

---

## 🔗 Related Links

- **Code:** [VideoOCREvaluator](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/eval/video_ocr_evaluator.py)
- **PaddleOCR:** [https://github.com/PaddlePaddle/PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
