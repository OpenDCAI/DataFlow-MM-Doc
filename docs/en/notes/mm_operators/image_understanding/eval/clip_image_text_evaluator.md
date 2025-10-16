---
title: clip_image_text_evaluator
createTime: 2025/10/15 19:56:33
icon: material-symbols-light:image
permalink: /en/mm_operators/eval/clip_image_text_evaluator/
---
## 📘 Overview
`CLIPEvaluator` computes the **image-text alignment score** using **CLIP**, with scores ranging from `[0,1]`.  
Internally, it encodes both the image and text using the CLIP model, performs L2 normalization,  
then calculates cosine similarity and linearly maps it to `[0,1]` via `(cos + 1) / 2`.


## ```__init__```
```python
def __init__(
    self,
    model_name: str = "/data0/happykeyan/workspace/ckpt/clip-vit-base-patch32",
    device: str = None
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"/data0/happykeyan/workspace/ckpt/clip-vit-base-patch32"` | Local path or Hugging Face Model ID for the CLIP model. Loaded via `CLIPProcessor` / `CLIPModel` (`use_safetensors=True`). |
| `device` | `str \| None` | `None` | The inference device. Automatically selects `"cuda"` if available, otherwise falls back to `"cpu"`. |



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
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `image_key` | `str` | `"image_path"` | The column name containing the image path. |
| `text_key` | `str` | `"text"` | The column name containing the text input. |
| `output_key` | `str` | `"clip_score"` | The column name for storing the output alignment score (range `[0,1]`). |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import CLIPEvaluator

# 1) Prepare FileStorage (must contain image_path and text columns)
storage = FileStorage(
    first_entry_file_name="data/clip_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="clip_eval",
    cache_type="jsonl"
)

# 2) Initialize the operator (can also use HF model ID, e.g. "openai/clip-vit-base-patch32")
evaluator = CLIPEvaluator(
    model_name="/data0/happykeyan/workspace/ckpt/clip-vit-base-patch32",
    device=None  # automatically chooses cuda/cpu
)

# 3) Execute evaluation
cols = evaluator.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text",
    output_key="clip_score"
)
print(cols)  # ["clip_score"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` / specified `image_key` | `string` | The input image path. |
| `text` / specified `text_key` | `string` | The input text. |
| `clip_score` / specified `output_key` | `float` | The image-text alignment score (range `[0,1]`). |



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
  "clip_score": 0.642
}
```