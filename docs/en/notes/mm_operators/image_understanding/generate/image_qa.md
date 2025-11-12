---
title: Image Question-Answer Generation
createTime: 2025/10/15 16:00:00
icon: material-symbols-light:quiz
permalink: /en/mm_operators/generate/image_qa/
---

## 📘 Overview

`ImageQAGenerate` is an operator for **automatically generating question-answer pairs (Visual QA) based on image content**.  
It can intelligently ask relevant questions about the image scene and generate reference answers. This is suitable for multimodal QA dataset construction, retrieval augmentation, and image-text matching enhancement.

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

| Parameter     | Type            | Default | Description                                                                 |
| :------------ | :-------------- | :------ | :-------------------------------------------------------------------------- |
| `llm_serving` | `LLMServingABC` | -       | Model serving object used to call a vision-language model for QA generation |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    multi_modal_key: str = "image",
    output_key: str = "qa_pairs"
):
    ...
```

The `run` function executes the main QA generation workflow: generates multiple QA pairs for the input images and writes them to the output file.

## 🧾 `run` Parameters

| Parameter         | Type              | Default      | Description                    |
| :---------------- | :---------------- | :----------- | :----------------------------- |
| `storage`         | `DataFlowStorage` | -            | Dataflow storage object        |
| `multi_modal_key` | `str`             | `"image"`    | Multimodal input field name    |
| `output_key`      | `str`             | `"qa_pairs"` | Output field name for QA pairs |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageQAGenerate

# Step 1: Launch local model service
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=1024
)

# Step 2: Prepare input data
storage = FileStorage(
    first_entry_file_name="data/example_qa.jsonl",
    cache_path="./cache_local",
    file_name_prefix="imageqa",
    cache_type="jsonl",
    media_key="image",
    media_type="image"
)
storage.step()

# Step 3: Initialize and run the operator
qa_generator = ImageQAGenerate(serving)
qa_generator.run(
    storage=storage,
    multi_modal_key="image",
    output_key="qa_pairs"
)
```

---

## 🧾 Default Output Format

| Field      | Type                   | Description                                                        |
| :--------- | :--------------------- | :----------------------------------------------------------------- |
| `image`    | `List[str]`            | Input image paths                                                  |
| `qa_pairs` | `List[Dict[str, str]]` | Generated QA pairs, each containing `question` and `answer` fields |

---

### 📥 Example Input

```jsonl
{"image": ["./test/street_scene.jpg"]}
```

### 📤 Example Output

```jsonl
{
  "image": ["./test/street_scene.jpg"],
  "qa_pairs": [
    {"question": "How many cars are in the image?", "answer": "Two"},
    {"question": "What kind of scene is captured in this photo?", "answer": "City street"},
    {"question": "What is the main type of transportation in the image?", "answer": "Cars"}
  ]
}
```