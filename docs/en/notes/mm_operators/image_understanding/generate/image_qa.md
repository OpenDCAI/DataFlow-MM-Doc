---
title: ImageQAGenerator
createTime: 2026/01/24 15:37:37
permalink: /en/mm_operators/generate/image_qa/
---

## 📘 Overview

`ImageQAGenerator` is an operator used to **automatically generate question-answer (QA) pairs based on image content (Visual QA)**.  
By wrapping `PromptedVQAGenerator`, it intelligently proposes reasonable questions and generates reference answers based on the image scene. This operator is a core component for building multimodal datasets, instruction-tuning data, and visual question-answering systems.

**Key Features:**
* **Automatic Generation**: Automatically extracts key image information and constructs QA pairs based on Vision-Language Models (VLM).
* **Batch Processing**: Supports automated annotation for massive volumes of images.
* **Flexible Prompting**: Define QA styles (such as single-turn, multi-turn, or specific knowledge point extraction) via `system_prompt`.
* **Context Support**: Automatically handles the construction logic for image inputs and conversation prompts.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    llm_serving: LLMServingABC,
    system_prompt: str
):
    ...

```

### 🧾 `__init__` Parameter Description

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `llm_serving` | `LLMServingABC` | - | **Model serving object**, used to call VLM for inference tasks |
| `system_prompt` | `str` | - | **System prompt**, used to constrain the QA generation logic (e.g., specifying the language or depth of questions) |

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_modal_key: str = "image", 
    output_key: str = "output"
):
    ...

```

Main logic of the `run` operator: reads image paths, combines the `system_prompt` with conversation information from the input data, calls the inference backend to generate QA text, and saves the result to the specified `output_key`.

### 🧾 `run` Parameter Description

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow unified data storage object |
| `input_modal_key` | `str` | `"image"` | **Multimodal input field name** (the Key where the image is located) |
| `output_key` | `str` | `"output"` | **Field name where the generated QA is stored** |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageQAGenerator

# 1. Start model serving
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=512,
)

# 2. Initialize operator and set QA generation rules
qa_generator = ImageQAGenerator(
    llm_serving=model,
    system_prompt="You are a image question-answer generator. Your task is to generate a question-answer pair for the given image content.",
)

# 3. Prepare data
storage = FileStorage(
    first_entry_file_name="./capsbench_qas.json",
    cache_path="./cache_local",
    file_name_prefix="qa_task",
    cache_type="json",
)
storage.step() # Load data

# 4. Execute
qa_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="qa"
)

```

---

## 🧾 Data Flow Examples

### 📥 Example Input

```json
[
    {
        "source":["[https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png](https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png)"],
        "image": ["./dataflow/example/test_data/0.png"],
        "conversation": [
            {
                "from": "human",
                "value": "Please construct a QA pair based on the content in the image."
            }
        ]
    }
]

```

### 📤 Example Output

```json
[
  {
    "source":["[https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png](https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png)"],
    "image": ["./dataflow/example/test_data/0.png"],
    "conversation":[
      {
        "from":"human",
        "value":"Please construct a QA pair based on the content in the image."
      }
    ],
    "qa":"**Question:** Who is the main actor in the movie \"Nightmare Alley\"?\n**Answer:** Bradley Cooper is the main actor in the movie \"Nightmare Alley.\""
  }
]

```

> **Note:** The `qa` field typically returns raw text containing Markdown formatting. If you need to further split `Question` and `Answer` into independent fields, it is recommended to use a text parsing operator in combination.