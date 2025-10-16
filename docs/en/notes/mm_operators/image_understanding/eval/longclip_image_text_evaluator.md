---
title: longclip_image_text_evaluator
createTime: 2025/10/15 19:56:29
permalink: /en/mm_operators/srndhrv8/
---
## 📘 Overview
`LongCLIPEvaluator` computes **image–long-text alignment scores** using **LongCLIP**, producing scores in the range `[0,1]`.  
Compared to the standard CLIP model, LongCLIP supports longer text contexts (default `context_length=248`),  
making it ideal for paragraph-level description evaluation and alignment tasks.



## ```__init__```
```python
def __init__(
    self,
    ckpt_path: str = "/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/LongCLIP-L-336px/longclip-L@336px.pt",
    device: str = None,
):
    ...
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
from dataflow.operators.core_vision import LongCLIPEvaluator

# 1) Prepare FileStorage (must include image_path and text columns)
storage = FileStorage(
    first_entry_file_name="data/longclip_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="longclip_eval",
    cache_type="jsonl"
)

# 2) Initialize LongCLIP evaluator (replace ckpt_path with your checkpoint)
evaluator = LongCLIPEvaluator(
    ckpt_path="/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/LongCLIP-L-336px/longclip-L@336px.pt",
    device=None  # auto-selects cuda/cpu
)

# 3) Run evaluation — adds a new column 'longclip_score' ∈ [0,1]
cols = evaluator.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text",
    output_key="longclip_score"
)
print(cols)  # ["longclip_score"]
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