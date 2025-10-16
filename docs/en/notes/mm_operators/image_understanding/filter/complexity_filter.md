---
title: complexity_filter
createTime: 2025/10/15 19:56:44
icon: material-symbols-light:image
permalink: /en/mm_operators/filter/complexity_filter/
---
## 📘 Overview
`ComplexityFilter` is a **text filtering operator** based on **Natural Language Inference (NLI)**. It evaluates whether a caption covers multiple visual capability elements (such as color, shape, action recognition, counting, and spatial relationships), thereby determining its **capability richness**.  
For each caption, the operator constructs hypothesis sentences (template: `"The following text describes {}."`) and uses an MNLI model to calculate the **entailment** probability. A sample is retained if the number of matched capability elements reaches the threshold (`min_k`); otherwise, it is filtered out.

## ```__init__```
```python
def __init__(
    self,
    model_name: str = "../ckpt/bart-large-mnli",
    threshold: float = 0.4,
    min_k: int = 2,
    device: str = None
)
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"../ckpt/bart-large-mnli"` | The local path or Hugging Face Model ID for the NLI model. Internally loaded using `AutoTokenizer` and `AutoModelForSequenceClassification` (`local_files_only=True`, `use_safetensors=True`, `weights_only=False`). |
| `threshold` | `float` | `0.4` | The minimum entailment probability threshold for a capability element to be considered “hit.” Higher values imply stricter filtering. |
| `min_k` | `int` | `2` | The minimum number of capability elements that must be hit; samples below this threshold are filtered out. |
| `device` | `str \| None` | `None` | The inference device; if `None`, automatically selects `"cuda"` when available, otherwise falls back to `"cpu"`. |

## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    caption_key: str
):
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object for reading and writing. |
| `caption_key` | `str` | — | The name of the column containing the captions to be evaluated (e.g., `"caption"`). |



## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ComplexityFilter

# 1) Prepare FileStorage (must contain a caption column)
storage = FileStorage(
    first_entry_file_name="data/complexity_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="complexity_filter",
    cache_type="jsonl"
)

# 2) Initialize the operator (can use local or HF model)
filt = ComplexityFilter(
    model_name="../ckpt/bart-large-mnli",   # or "facebook/bart-large-mnli"
    threshold=0.4,                          # entailment probability threshold
    min_k=2,                                # minimum number of matched elements
    device=None                             # auto-select cuda/cpu
)

# 3) Execute filtering
cols = filt.run(
    storage=storage.step(),
    caption_key="caption"
)
print(cols)  # ["caption"]
```

#### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `caption` | `string` | The filtered caption text; only samples with the number of matched capability elements `≥ min_k` are retained. |

Example Input:
```jsonl
{
  "caption": "A red double-decker bus turns left at a city intersection while pedestrians wait at the crosswalk."
}
{
  "caption": "SALE SALE SALE 50% OFF"
}
{
  "caption": "Two kids count seashells on a sandy beach while their mother reads under a blue umbrella."
}

```

Example Output:
```jsonl
{
  "caption": "A red double-decker bus turns left at a city intersection while pedestrians wait at the crosswalk."
}
{
  "caption": "Two kids count seashells on a sandy beach while their mother reads under a blue umbrella."
}
```