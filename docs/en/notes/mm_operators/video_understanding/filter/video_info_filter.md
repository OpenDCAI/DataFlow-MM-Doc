---
title: Video Info Filter (VideoInfoFilter)
createTime: 2025/01/20 10:00:00
icon: material-symbols-light:info-outline
permalink: /en/mm_operators/video_understanding/filter/video_info_filter/
---

## 📘 Overview

`VideoInfoFilter` is an operator for **extracting video metadata information**. It can extract basic information from video files, including number of frames, resolution, aspect ratio, frame rate, duration, etc. Supports multiple backends (OpenCV, TorchVision, PyAV) and parallel processing for improved efficiency.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    backend: str = "opencv",
    input_video_key: str = "video",
    output_key: str = "video_info",
    ext: bool = False,
    disable_parallel: bool = False,
    num_workers: Optional[int] = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter         | Type              | Default            | Description                                    |
| :---------------- | :---------------- | :----------------- | :--------------------------------------------- |
| `backend`        | `str`             | `"opencv"`         | Backend selection: `"opencv"`, `"torchvision"`, or `"av"` |
| `input_video_key` | `str`             | `"video"`          | Field name for video paths in input data       |
| `output_key`     | `str`             | `"video_info"`     | Field name for output video information        |
| `ext`            | `bool`            | `False`            | Whether to filter out non-existent video file paths |
| `disable_parallel` | `bool`            | `False`            | Whether to disable parallel processing          |
| `num_workers`    | `Optional[int]`   | `None`             | Number of workers for parallel processing, defaults to CPU count |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    output_key: Optional[str] = None
):
    ...
```

Executes the main logic: reads data from storage, extracts metadata information for each video, and writes back to storage.

## 🧾 `run` Parameters

| Parameter         | Type                | Default    | Description                                    |
| :---------------- | :------------------ | :--------- | :--------------------------------------------- |
| `storage`         | `DataFlowStorage`   | -          | DataFlow storage object                        |
| `input_video_key` | `Optional[str]`     | `None`     | Field name for video paths (overrides init param) |
| `output_key`      | `Optional[str]`     | `None`     | Field name for output (overrides init param)   |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoInfoFilter

# Step 1: Prepare FileStorage (at least contains video column)
storage = FileStorage(
    first_entry_file_name="data/video_info_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_info_filter",
    cache_type="jsonl"
)

# Step 2: Initialize operator
filter_op = VideoInfoFilter(
    backend="opencv",
    input_video_key="video",
    output_key="video_info",
    ext=False,
    disable_parallel=False,
    num_workers=None
)

# Step 3: Execute information extraction
filter_op.run(
    storage=storage.step()
)
```

---

### 🧾 Default Output Format

**Added Field:**
- `video_info` (dict): Video information dictionary

**Dictionary Fields:**

| Field          | Type              | Description                      |
| :------------- | :---------------- | :------------------------------- |
| `success`      | `bool`            | Whether successfully extracted information |
| `num_frames`   | `Optional[int]`   | Total number of frames           |
| `height`       | `Optional[int]`   | Height (pixels)                  |
| `width`        | `Optional[int]`   | Width (pixels)                   |
| `aspect_ratio` | `Optional[float]` | Aspect ratio (width/height)      |
| `resolution`   | `Optional[int]`   | Resolution (width * height)      |
| `fps`          | `Optional[float]` | Frame rate (frames/sec)          |
| `duration_sec` | `Optional[float]` | Duration (seconds)               |

Example Input:

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

Example Output:

```jsonl
{
  "video": "./test/video1.mp4",
  "video_info": {
    "success": true,
    "num_frames": 3000,
    "height": 1080,
    "width": 1920,
    "aspect_ratio": 1.7777777777777777,
    "resolution": 2073600,
    "fps": 30.0,
    "duration_sec": 100.0
  }
}
{
  "video": "./test/video2.mp4",
  "video_info": {
    "success": false,
    "num_frames": null,
    "height": null,
    "width": null,
    "aspect_ratio": null,
    "resolution": null,
    "fps": null,
    "duration_sec": null
  }
}
```

---

## 🔗 Related Links

- **Code:** [VideoInfoFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_info_filter.py)
