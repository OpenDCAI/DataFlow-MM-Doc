---
title: EMScore Evaluator (EMScoreEval)
createTime: 2025/01/20 11:00:00
permalink: /en/mm_operators/video_understanding/eval/emscore_evaluator/
---

## 📘 Overview

`EMScoreEval` is a **video frame-level EMScore evaluation operator**. It extracts frames from videos using specified strategies, uses CLIP model to compute semantic similarity between candidate text and reference text/video frames, providing fine-grained and coarse-grained evaluation metrics.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    every_n_seconds: Optional[float] = None,
    every_n_frames: Optional[int] = None,
    return_all_frames: bool = False,
    clip_model_path: Optional[str] = None,
    score_types: Optional[List[str]] = None,
    metrics: Optional[List[str]] = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter           | Type              | Default | Description                           |
| :------------------ | :---------------- | :------ | :------------------------------------ |
| `every_n_seconds`   | `Optional[float]` | `None`  | Extract frame every N seconds         |
| `every_n_frames`    | `Optional[int]`   | `None`  | Extract frame every N frames          |
| `return_all_frames` | `bool`            | `False` | Return per-frame detailed scores      |
| `clip_model_path`   | `Optional[str]`   | `None`  | CLIP model path                       |
| `score_types`       | `Optional[List]`  | `None`  | Score types to compute (default: all) |
| `metrics`           | `Optional[List]`  | `None`  | Metrics to output (default: all)      |

### Available Score Types

| Score Type            | Description                     |
| :-------------------- | :------------------------------ |
| `EMScore(X,X*)`       | Candidate text vs reference text |
| `EMScore(X,V)`        | Candidate text vs video frames   |
| `EMScore(X,V,X*)`     | Combined score (text + video)    |

### Available Metrics

| Metric   | Description                      |
| :------- | :------------------------------- |
| `figr_P` | Fine-grained Precision           |
| `figr_R` | Fine-grained Recall              |
| `figr_F` | Fine-grained F1                  |
| `cogr`   | Coarse-grained (global) consistency |
| `full_P` | Full Precision (fine + coarse)   |
| `full_R` | Full Recall (fine + coarse)      |
| `full_F` | Full F1 (fine + coarse)          |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    video_key: str = 'video_path',
    candidate_key: str = 'candidate',
    reference_key: str = 'reference'
) -> list[str]:
    ...
```

Execute main logic: reads video paths, candidate text, and reference text from storage, extracts video frame features, computes EMScore, and writes back to storage.

**Returns:** `list[str]` - List of output field names, including all computed score fields (e.g., `EMScore(X,X*)_figr_F`) and optional `frame_details` field

## 🧾 `run` Parameters

| Parameter       | Type              | Default         | Description                       |
| :-------------- | :---------------- | :-------------- | :-------------------------------- |
| `storage`       | `DataFlowStorage` | -               | DataFlow storage object            |
| `video_key`     | `str`             | `"video_path"`  | Field name for video paths         |
| `candidate_key` | `str`             | `"candidate"`   | Field name for candidate text      |
| `reference_key` | `str`             | `"reference"`   | Field name for reference text (optional) |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import EMScoreEval

storage = FileStorage(
    first_entry_file_name="data/emscore_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="emscore",
    cache_type="jsonl"
)

evaluator = EMScoreEval(
    every_n_seconds=2.0,
    return_all_frames=True,
    score_types=['EMScore(X,X*)', 'EMScore(X,V)', 'EMScore(X,V,X*)'],
    metrics=['figr_F', 'cogr', 'full_F']
)

evaluator.run(
    storage=storage.step(),
    video_key="video_path",
    candidate_key="candidate",
    reference_key="reference"
)
```

---

### 🧾 Default Output Format

**Added Fields:**

Each combination of score type and metric generates a field, e.g.:

| Field                        | Type    | Description                     |
| :--------------------------- | :------ | :------------------------------ |
| `EMScore(X,X*)_figr_F`       | `float` | Fine-grained F1 (text vs text)  |
| `EMScore(X,V)_cogr`          | `float` | Coarse-grained (text vs video)  |
| `EMScore(X,V,X*)_full_F`     | `float` | Full F1 (combined)              |
| `frame_details`              | `str`   | Per-frame scores (JSON, when `return_all_frames=True`) |

---

## 🔗 Related Links

- **Code:** [EMScoreEval](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/eval/emscore_evaluator.py)
- **Paper:** [EMScore: Evaluating Video Captioning via Coarse-Grained and Fine-Grained Embedding Matching](https://arxiv.org/abs/2111.08919)
