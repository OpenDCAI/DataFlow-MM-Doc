---
title: PersQAGenerator
createTime: 2026/01/24 15:37:37
permalink: /en/mm_operators/generate/image_pers_qa/
---

## 📘 Overview

`PersQAGenerator` is an operator designed for **generating personalized image Question-Answering (QA) pairs based on Large Vision-Language Models (VLM)**.  
This operator focuses on "character-centric" QA generation: it automatically assigns a name tag (default is `<mam>`) to the main character in an image, randomly selects questions from a predefined pool, and constrains the model to begin its response with the character's tag.

**Key Features:**
* **Identity Anchoring**: Automatically assigns the `<mam>` tag to the main protagonist for personalized reference.
* **Template Driven**: Built-in `PersQAGeneratorPrompt` automatically constructs system prompts and question templates.
* **Dynamic Injection**: Automatically modifies the conversation context during the `run` process, eliminating the need to manually construct questions.
* **Structured Output**: Produces character-aligned responses suitable for evaluating character-centric multimodal model performance.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...

```

### 🧾 `__init__` Parameter Description

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `llm_serving` | `LLMServingABC` | - | **Model serving object**, used to call the VLM for inference |

> **Note**: The operator internally initializes `PersQAGeneratorPrompt` and configures the `system_prompt`, so users do not need to provide them manually.

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

The main logic of the `run` operator:

1. Reads data from storage.
2. Automatically generates a personalized question containing the `<mam>` tag.
3. **Data Rewriting**: Fills the generated Prompt into the `conversation` field.
4. Calls the model to generate a response starting with `<mam>` and saves it in the `output_key`.

### 🧾 `run` Parameter Description

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow unified data storage object |
| `input_modal_key` | `str` | `"image"` | **Image field name** |
| `output_key` | `str` | `"output"` | **Field name for the generated personalized answer** |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import PersQAGenerator

# 1. Initialize the inference engine
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
)

# 2. Initialize the operator (Prompt templates handled internally)
generator = PersQAGenerator(llm_serving=model)

# 3. Prepare data
storage = FileStorage(
    first_entry_file_name="./sample_data.json", 
    cache_path="./cache_local",
    file_name_prefix="pers_qa_res",
    cache_type="json",
)
storage.step()

# 4. Execute generation
generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="pers_qa"
)

```

---

## 🧾 Data Flow Examples

### 📥 Example Input

Note: The initial `value` in the `conversation` field will be automatically overwritten by the operator with the generated personalized Prompt.

```json
[
    {
        "source":["[https://huggingface.co/datasets/.../0.png](https://huggingface.co/datasets/.../0.png)"],
        "image": ["./dataflow/example/test_data/0.png"],
        "conversation": [
            {
                "from": "human",
                "value": "Any content, will be automatically overwritten later"
            }
        ]
    }
]

```

### 📤 Example Output

The operator automatically constructs the required instructions in the `conversation` field and returns the model's personalized answer in the `pers_qa` field.

```json
[
  {
    "source":["[https://huggingface.co/datasets/.../0.png](https://huggingface.co/datasets/.../0.png)"],
    "image":["./dataflow/example/test_data/0.png"],
    "conversation":[
      {
        "from":"human",
        "value":"The name of the main character in the image is <mam>. You need to answer a question about <mam>.\nQuestion: How would you describe <mam>'s attire? Please answer starting with <mam>!\nAnswer: "
      }
    ],
    "pers_qa":"<mam> is dressed in a formal black suit with a white bow tie, exuding a sophisticated and elegant appearance."
  }
]

```

> **Tips**: The identifier `<mam>` is hardcoded within the operator (but can be customized in the source). It is recommended to use high-performance MLLMs to ensure the model strictly follows the constraint of starting the response with the specified tag.