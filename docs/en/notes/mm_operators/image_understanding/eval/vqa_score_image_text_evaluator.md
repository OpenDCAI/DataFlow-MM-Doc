---
title: vqa_score_image_text_evaluator
createTime: 2025/10/15 19:56:31
icon: material-symbols-light:image
permalink: /en/mm_operators/eval/vqa_score_image_text_evaluator/
---
## 📘 Overview
`VQAScoreEvaluator` uses **BLIP VQA** to transform the question *“Does this image match the description?”* into a **Yes/No probability score** ranging from `[0,1]`.  
- Constructed question: `Does this image match the description: {text}? Answer yes or no.`  
- Forward pass twice with labels `"yes"` and `"no"` to obtain respective losses `L_yes` and `L_no`.  
- Compute normalized probabilities.

## ```__init__```
```python
def __init__(
    self,
    model_name: str = "/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base",
    device: str = None,
    local_only: bool = True,
):
    ...
```


## `__init__` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base"` | Path or Hugging Face Model ID of the BLIP VQA model. Loaded via `BlipProcessor` and `BlipForQuestionAnswering`. |
| `device` | `str \| None` | `None` | Inference device. Automatically selects `"cuda"` if available, otherwise falls back to `"cpu"`. |
| `local_only` | `bool` | `True` | If `True`, load model weights only from local files (`local_files_only=True`). |




## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str = "image_path",
    text_key: str = "text",
    output_key: str = "clip_score"
):
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object for reading and writing data. |
| `image_key` | `str` | `"image_path"` | Column name containing the input image path. |
| `text_key` | `str` | `"text"` | Column name containing the text description. |
| `output_key` | `str` | `"vqa_score"` | Column name where the computed Yes-probability score (range `[0,1]`) is stored. |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VQAScoreEvaluator

# 1) Prepare FileStorage (must include image_path and text columns)
storage = FileStorage(
    first_entry_file_name="data/vqa_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="vqa_score",
    cache_type="jsonl"
)

# 2) Initialize the evaluator (you can replace with your own model path or HF model ID)
evaluator = VQAScoreEvaluator(
    model_name="/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/blip-vqa-base",
    device=None,       # auto-select cuda/cpu
    local_only=True    # load from local weights only
)

# 3) Run evaluation (adds a column 'vqa_score')
cols = evaluator.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text",
    output_key="vqa_score"
)
print(cols)  # ["vqa_score"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` / specified `image_key` | `string` | The input image path. |
| `text` / specified `text_key` | `string` | The input text description. |
| `vqa_score` / specified `output_key` | `float` | The BLIP-predicted probability that the image matches the text (Yes probability, range `[0,1]`). |




Example Input:
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car."
}
```

Example Output:
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car.",
  "vqa_score": 0.774
}
```