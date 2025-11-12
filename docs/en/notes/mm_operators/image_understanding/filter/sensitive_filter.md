---
title: sensitive_filter
createTime: 2025/10/15 19:56:56
icon: material-symbols-light:image
permalink: /en/mm_operators/filter/sensitive_filter/
---
## 📘 Overview
`SensitiveFilter` is a **sensitive content filtering operator** that combines **image NSFW classification** and **text toxicity/hate speech detection** to remove unsafe samples.  

- **Image side**: Uses an image classification model to detect labels such as `{porn, hentai, sexy, nsfw}`; if the confidence score **≥ `img_thresh`**, the image is marked unsafe.  
- **Text side**: Uses a text classification model to detect labels such as `{toxic, offensive, hate, obscene, threat, sexual_explicit, identity_attack}`; if the confidence score **≥ `txt_thresh`**, the text is marked unsafe.  
A sample is filtered out if **either** the image **or any text field** is classified as unsafe.


## ```__init__```
```python
def __init__(
    self,
    img_model_name="../ckpt/nsfw_image_detection",
    txt_model_name="../ckpt/toxic-bert",
    img_thresh=0.5,
    txt_thresh=0.5,
):
    ...
```


## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `img_model_name` | `str` | `"../ckpt/nsfw_image_detection"` | Local path or Hugging Face Model ID for the image-sensitive detection model. Internally loaded using `AutoImageProcessor` and `AutoModelForImageClassification` (`use_safetensors=True`, `weights_only=False`). |
| `txt_model_name` | `str` | `"../ckpt/toxic-bert"` | Local path or Hugging Face Model ID for the text-toxicity detection model. Internally loaded using `AutoTokenizer` and `AutoModelForSequenceClassification` (`use_safetensors=True`, `weights_only=False`). |
| `img_thresh` | `float` | `0.5` | The image sensitivity threshold; if the image matches `{porn, hentai, sexy, nsfw}` with score **≥** this value, it is classified as unsafe. |
| `txt_thresh` | `float` | `0.5` | The text sensitivity threshold; if any text field matches `{toxic, offensive, hate, obscene, threat, sexual_explicit, identity_attack}` with score **≥** this value, it is classified as unsafe. |

## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    text_keys: list
):
    ...
```

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | — | The Dataflow storage object used for reading and writing data. |
| `image_key` | `str` | — | The column name containing the image path (e.g., `"image_path"`). |
| `text_keys` | `list[str]` | — | A list of text column names to be checked (e.g., `["caption", "question", "answer"]`). |




## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import SensitiveFilter

# 1) Prepare FileStorage (must contain image_path and text columns)
storage = FileStorage(
    first_entry_file_name="data/sensitive_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="sensitive_filter",
    cache_type="jsonl"
)

# 2) Initialize the operator (you can also use HF model IDs like
#     img_model_name="Falconsai/nsfw_image_detection",
#     txt_model_name="unitary/toxic-bert")
filt = SensitiveFilter(
    img_model_name="../ckpt/nsfw_image_detection",
    txt_model_name="../ckpt/toxic-bert",
    img_thresh=0.5,
    txt_thresh=0.5,
)

# 3) Execute filtering
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    text_keys=["text"]  # or ["caption", "question", "answer"]
)
print(cols)  # ["image_path", "text"]
```

### 🧾 Default Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `image_path` / specified `image_key` | `string` | The retained image path after filtering. |
| Each field in `text_keys` | `string` | The retained text fields; only samples where both the image and all texts are safe are included in the output. |


Example Input:
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
{
  "image_path": "2.jpg",
  "text": "Some abusive or hateful phrase here."
}
```

Example Output:
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
```