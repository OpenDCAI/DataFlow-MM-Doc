---
title: Video OCR Filter (VideoOCRFilter)
createTime: 2025/01/20 10:00:00
permalink: /en/mm_operators/video_understanding/filter/video_ocr_filter/
---

## 📘 Overview

`VideoOCRFilter` is a video filtering operator based on **OCR text area ratio**. It directly detects and filters entire videos without pre-splitting clips:
1. Samples several frames from the video
2. Detects text regions using PaddleOCR
3. Computes text area ratio (OCR score)
4. Determines pass/fail based on thresholds (`ocr_min`, `ocr_max`)
5. Outputs results containing `ocr_score` and `filtered` fields

Suitable for filtering videos with excessive text (e.g., subtitles, watermarks) or requiring text content.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    input_video_key: str = "video",
    load_num: int = 3,
    batch_size: int = 8,
    num_workers: int = 4,
    gpu_num: int = 0,
    output_key: str = "video_ocr",
    det_model_dir: str = None,
    rec_model_dir: str = None,
    ocr_min: Optional[float] = None,
    ocr_max: Optional[float] = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter          | Type              | Default         | Description                                                      |
| :----------------- | :---------------- | :-------------- | :--------------------------------------------------------------- |
| `input_video_key`  | `str`             | `"video"`       | Field name for video paths in input data                         |
| `load_num`         | `int`             | `3`             | Number of frames to sample from video                            |
| `batch_size`       | `int`             | `8`             | Batch size for processing                                        |
| `num_workers`      | `int`             | `4`             | Number of worker processes for data loading                      |
| `gpu_num`          | `int`             | `0`             | GPU ID (0+ for GPU, -1 for CPU)                                  |
| `output_key`       | `str`             | `"video_ocr"`   | Output field name                                                |
| `det_model_dir`    | `str`             | `None`          | Path to PaddleOCR detection model directory                      |
| `rec_model_dir`    | `str`             | `None`          | Path to PaddleOCR recognition model directory                    |
| `ocr_min`          | `Optional[float]` | `None`          | Minimum OCR score threshold (0-1), videos below this will be marked as `filtered=False` |
| `ocr_max`          | `Optional[float]` | `None`          | Maximum OCR score threshold (0-1), videos above this will be marked as `filtered=False` |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    video_clips_key: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    ocr_min: Optional[float] = None,
    ocr_max: Optional[float] = None
) -> None:
    ...
```

Executes the main logic: reads data from storage, samples frames from each video and performs OCR detection, filters based on thresholds, and writes back to storage.

## 🧾 `run` Parameters

| Parameter          | Type                | Default | Description                                      |
| :----------------- | :------------------ | :------ | :----------------------------------------------- |
| `storage`          | `DataFlowStorage`   | -       | DataFlow storage object                          |
| `input_video_key`  | `Optional[str]`     | `None`  | Video path field name (overrides init param)     |
| `video_clips_key`  | `Optional[str]`     | `None`  | Video clips field name (should be `None` for whole-video mode)|
| `load_num`         | `Optional[int]`     | `None`  | Number of frames to sample (overrides init param)|
| `batch_size`       | `Optional[int]`     | `None`  | Batch size (overrides init param)                |
| `num_workers`      | `Optional[int]`     | `None`  | Number of workers (overrides init param)         |
| `output_key`       | `Optional[str]`     | `None`  | Output field name (overrides init param)         |
| `ocr_min`          | `Optional[float]`   | `None`  | Minimum OCR score threshold (overrides init param)|
| `ocr_max`          | `Optional[float]`   | `None`  | Maximum OCR score threshold (overrides init param)|

---

## 🧠 Example Usage

::: tip Complete Example Code
The complete pipeline example code is located at: `playground/video_ocr_filter_pipeline.py`

After initializing with `dataflowmm init`, you can find the complete runnable example at this path.
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoOCRFilter

# Step 1: Prepare FileStorage (at least contains video column)
storage = FileStorage(
    first_entry_file_name="data/video_ocr_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_ocr_filter",
    cache_type="jsonl"
)

# Step 2: Initialize operator
filter_op = VideoOCRFilter(
    output_key="video_ocr",
    load_num=3,  # Sample 3 frames from video
    batch_size=8,
    num_workers=2,
    det_model_dir="/path/to/PP-OCRv5_server_det",
    rec_model_dir="/path/to/PP-OCRv5_server_rec",
    ocr_min=None,  # No minimum threshold
    ocr_max=0.3    # Maximum OCR score threshold, filter videos with too much text
)

# Step 3: Execute filtering
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    video_clips_key=None,  # None for whole-video mode
    output_key="video_ocr"
)
```

---

## 🧾 Output Format

**Added Field:**
- `video_ocr` (dict): OCR detection information dictionary

**Dictionary Fields:**

| Field        | Type     | Description                                    |
| :----------- | :------- | :--------------------------------------------- |
| `ocr_score`  | `float`  | OCR text area ratio (0-1)                      |
| `filtered`   | `bool`   | Whether passed the filter (only appears when `ocr_min` or `ocr_max` is set) |

Example Input:

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

Example Output (with `ocr_max=0.3`):

```jsonl
{"video": "./test/video1.mp4", "video_ocr": {"ocr_score": 0.15, "filtered": true}}
{"video": "./test/video2.mp4", "video_ocr": {"ocr_score": 0.45, "filtered": false}}
```

---

## 💡 Usage Tips

1. **Filter subtitle videos**: Set `ocr_max=0.3` to filter videos with excessive subtitles
2. **Filter watermark videos**: Set a small `ocr_max` value to filter videos with text watermarks
3. **Retain text content**: Set `ocr_min` value to retain videos with certain text content (e.g., tutorial videos)
4. **Sampling frames**: `load_num=3` is usually sufficient, adjust based on video length
5. **Model selection**: Recommended to use PP-OCRv5 server models for better detection results

---

## 🔗 Related Links

- **Code:** [VideoOCRFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_ocr_filter.py)
- **Related Operator:** [VideoOCREvaluator](/en/mm_operators/video_understanding/eval/video_ocr_evaluator/)
- **PaddleOCR:** [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)

