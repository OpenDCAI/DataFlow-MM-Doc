---
title: Video Aesthetic Filter (VideoAestheticFilter)
createTime: 2025/01/20 10:00:00
permalink: /en/mm_operators/video_understanding/filter/video_aesthetic_filter/
---

## 📘 Overview

`VideoAestheticFilter` is a video filtering operator based on **aesthetic scores**. It directly scores and filters entire videos without pre-splitting clips:
1. Samples several frames from the video
2. Computes aesthetic scores using CLIP model and MLP model
3. Determines pass/fail based on minimum aesthetic score threshold (`aes_min`)
4. Outputs results containing `aesthetic_score` and `filtered` fields

Suitable for initial video quality screening to quickly filter out low-quality videos.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    input_video_key: str = "video",
    clip_model: str = "ViT-L/14",
    mlp_checkpoint: Optional[str] = None,
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    output_key: str = "video_aesthetic",
    aes_min: Optional[float] = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter          | Type              | Default             | Description                                                      |
| :----------------- | :---------------- | :------------------ | :--------------------------------------------------------------- |
| `input_video_key`  | `str`             | `"video"`           | Field name for video paths in input data                         |
| `clip_model`       | `str`             | `"ViT-L/14"`        | CLIP model name or path                                          |
| `mlp_checkpoint`   | `Optional[str]`   | `None`              | MLP checkpoint path for aesthetic prediction                     |
| `load_num`         | `int`             | `3`                 | Number of frames to sample from video                            |
| `batch_size`       | `int`             | `64`                | Batch size for processing                                        |
| `num_workers`      | `int`             | `4`                 | Number of worker processes for data loading                      |
| `output_key`       | `str`             | `"video_aesthetic"` | Output field name                                                |
| `aes_min`          | `Optional[float]` | `None`              | Minimum aesthetic score threshold, videos below this will be marked as `filtered=False` |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    clip_model: Optional[str] = None,
    mlp_checkpoint: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    aes_min: Optional[float] = None
) -> None:
    ...
```

Executes the main logic: reads data from storage, samples frames from each video and computes aesthetic scores, filters based on threshold, and writes back to storage.

## 🧾 `run` Parameters

| Parameter          | Type                | Default | Description                                      |
| :----------------- | :------------------ | :------ | :----------------------------------------------- |
| `storage`          | `DataFlowStorage`   | -       | DataFlow storage object                          |
| `input_video_key`  | `Optional[str]`     | `None`  | Video path field name (overrides init param)     |
| `clip_model`       | `Optional[str]`     | `None`  | CLIP model path (overrides init param)           |
| `mlp_checkpoint`   | `Optional[str]`     | `None`  | MLP checkpoint path (overrides init param)       |
| `load_num`         | `Optional[int]`     | `None`  | Number of frames to sample (overrides init param) |
| `batch_size`       | `Optional[int]`     | `None`  | Batch size (overrides init param)                |
| `num_workers`      | `Optional[int]`     | `None`  | Number of workers (overrides init param)         |
| `output_key`       | `Optional[str]`     | `None`  | Output field name (overrides init param)         |
| `aes_min`          | `Optional[float]`   | `None`  | Minimum aesthetic score threshold (overrides init param) |

---

## 🧠 Example Usage

::: tip Complete Example Code
The complete pipeline example code is located at: `playground/video_aesthetic_filter_pipeline.py`

After initializing with `dataflowmm init`, you can find the complete runnable example at this path.
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoAestheticFilter

# Step 1: Prepare FileStorage (at least contains video column)
storage = FileStorage(
    first_entry_file_name="data/video_aesthetic_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_aesthetic_filter",
    cache_type="jsonl"
)

# Step 2: Initialize operator
filter_op = VideoAestheticFilter(
    output_key="video_aesthetic",
    load_num=3,  # Sample 3 frames from video
    batch_size=16,
    num_workers=2,
    clip_model="ViT-L/14",
    mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",
    aes_min=4.0  # Minimum aesthetic score threshold
)

# Step 3: Execute filtering
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    output_key="video_aesthetic"
)
```

---

## 🧾 Output Format

**Added Field:**
- `video_aesthetic` (dict): Aesthetic scoring information dictionary

**Dictionary Fields:**

| Field              | Type     | Description                                    |
| :----------------- | :------- | :--------------------------------------------- |
| `aesthetic_score`  | `float`  | Video aesthetic score                          |
| `filtered`         | `bool`   | Whether passed the filter (only appears when `aes_min` is set) |

Example Input:

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

Example Output (with `aes_min=4.0`):

```jsonl
{"video": "./test/video1.mp4", "video_aesthetic": {"aesthetic_score": 5.2, "filtered": true}}
{"video": "./test/video2.mp4", "video_aesthetic": {"aesthetic_score": 3.5, "filtered": false}}
```

---

## 🔗 Related Links

- **Code:** [VideoAestheticFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_aesthetic_filter.py)
- **Related Operator:** [VideoAestheticEvaluator](/en/mm_operators/video_understanding/eval/video_aesthetic_evaluator/)

