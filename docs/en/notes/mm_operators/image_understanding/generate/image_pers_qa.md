---
title: Personalized Image QA Generation
createTime: 2025/10/15 18:20:00
icon: material-symbols-light:quiz
permalink: /en/mm_operators/generate/image_pers_qa/
---

## 📘 Overview

`PersQAGenerate` is an operator for **generating personalized image question-answer pairs using large vision-language models (VLMs)**.  
It can:  
- Automatically assign name tags to main characters in images (e.g., `<mam>`);  
- Randomly select suitable questions from predefined templates;  
- Guide the model to start answers with the character's name;  
- Output structured QA pairs suitable for multimodal QA dataset construction and evaluation of character understanding.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter     | Type            | Default | Description                                                   |
| :------------ | :-------------- | :------ | :------------------------------------------------------------ |
| `llm_serving` | `LLMServingABC` | -       | Model serving object used to call VLM for generating QA pairs |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    multi_modal_key: str = "image",
    output_key: str = "pers_qa"
):
    ...
```

The `run` function executes the main QA generation workflow:
read image paths → construct questions and prompts → call the model → return structured QA results.

## 🧾 `run` Parameters

| Parameter         | Type              | Default     | Description                    |
| :---------------- | :---------------- | :---------- | :----------------------------- |
| `storage`         | `DataFlowStorage` | -           | Dataflow storage object        |
| `multi_modal_key` | `str`             | `"image"`   | Multimodal input field name    |
| `output_key`      | `str`             | `"pers_qa"` | Output field name for QA pairs |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import PersQAGenerate

# Step 1: Launch local model service
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512
)

# Step 2: Prepare storage
storage = FileStorage(
    first_entry_file_name="data/example.jsonl",
    cache_path="./cache_local",
    file_name_prefix="pers_qa",
    cache_type="jsonl",
    media_key="image",
    media_type="image"
)
storage.step()

# Step 3: Initialize and run the operator
generator = PersQAGenerate(serving)
generator.run(
    storage=storage,
    multi_modal_key="image",
    output_key="pers_qa"
)
```

---

## 🧾 Default Output Format

| Field     | Type        | Description                                                              |
| :-------- | :---------- | :----------------------------------------------------------------------- |
| `image`   | `List[str]` | Input image paths                                                        |
| `pers_qa` | `str`       | Generated personalized QA text in the format `Question: ... Answer: ...` |

---

### 📥 Example Input

```jsonl
{"image": ["./test/example1.jpg"]}
{"image": ["./test/example2.jpg"]}
```

### 📤 Example Output

```jsonl
{"image": ["./test/example1.jpg"], "pers_qa": "Question: <mam> What is she doing? Answer: <mam> is smiling at the camera."}
{"image": ["./test/example2.jpg"], "pers_qa": "Question: <mam> Where is she? Answer: <mam> is in a cafe."}
```