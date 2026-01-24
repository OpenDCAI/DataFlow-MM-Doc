---
title: ImageCaptionGenerator
createTime: 2026/01/24 15:37:37
permalink: /en/mm_operators/generate/image_caption/
---

## 📘 Overview

`ImageCaptionGenerator` is an operator designed to **automatically generate image descriptions (captions) using Large Vision-Language Models (VLM)**.  
It wraps `PromptedVQAGenerator` and produces high-quality, structured scene descriptions based on input images and preset system prompts. This operator is widely used for multimodal data annotation, automatic summary generation, and dataset construction.

**Key Features:**
* **Batch Processing**: Supports streaming or batch caption generation for large-scale image datasets.
* **Flexible Configuration**: Allows custom `system_prompt` to control text style (e.g., concise, detailed, or specific formats).
* **Strong Compatibility**: Based on the `LLMServingABC` interface, it supports both local models deployed via vLLM and API services using OpenAI-compatible formats (such as DashScope, GPT-4o, etc.).

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
| `llm_serving` | `LLMServingABC` | - | **Model serving object**, supports local GPU loading or remote API call instances |
| `system_prompt` | `str` | - | **System prompt**, defines the generator's role and output requirements (e.g., "generate a concise caption") |

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

### 🧾 `run` Parameter Description

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow unified data storage object |
| `input_modal_key` | `str` | `"image"` | **Image field name**, specifies the key where image paths are stored |
| `output_key` | `str` | `"output"` | **Output field name**, specifies the key where generated captions will be stored |

---

## 🧠 Example Usage

### Option A: Using Local Deployment (Local vLLM)

Best for users with local GPU resources.

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageCaptionGenerator

# 1. Initialize model serving (e.g., Qwen2.5-VL)
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=512,
)

# 2. Initialize operator and set system prompt
caption_generator = ImageCaptionGenerator(
    llm_serving=model,
    system_prompt="You are a image caption generator. Your task is to generate a concise and informative caption for the given image content.",
)

# 3. Prepare input data
storage = FileStorage(
    first_entry_file_name="./capsbench_captions.json", 
    cache_path="./cache_local",
    file_name_prefix="caption_task",
    cache_type="json",
)
storage.step()  # Load data into memory

# 4. Execute operator
caption_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="caption"
)

```

### Option B: Using Online API Service (OpenAI Compatible)

Best for cloud-based models like Alibaba DashScope, GPT-4o, etc. Other operators or pipelines in the project can also use similar API model configurations.

```python
import os
from dataflow.utils.storage import FileStorage
from dataflow.serving.api_vlm_serving_openai import APIVLMServing_openai
from dataflow.operators.core_vision import ImageCaptionGenerator

# Set API Key environment variable
os.environ["DF_API_KEY"] = "your api-key"

# 1. Initialize API serving object (e.g., Qwen via DashScope)
api_serving = APIVLMServing_openai(
  api_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
  key_name_of_api_key="DF_API_KEY",
  model_name="qwen3-vl-8b-instruct",
  image_io=None,
  send_request_stream=False,
  max_workers=10,
  timeout=1800
)

# 2. Initialize operator
caption_generator = ImageCaptionGenerator(
    llm_serving=api_serving,
    system_prompt="You are a image caption generator. Your task is to generate a concise and informative caption.",
)

# 3. Prepare input data
storage = FileStorage(
    first_entry_file_name="./capsbench_captions.json", 
    cache_path="./cache_local",
    file_name_prefix="caption_task",
    cache_type="json",
)
storage.step()  # Load data into memory

# 4. Execute operator
caption_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="caption"
)

```

---

## 🧾 Data Flow Examples

### 📥 Example Input (Input)

```json
[
  {
    "source":["[https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png](https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png)"],
    "image": ["./dataflow/example/test_data/0.png"],
    "conversation": [
      {
        "from": "human",
        "value": "Please describe the image in detail."
      }
    ]
  }
]

```

### 📤 Example Output (Output)

```json
[
  {
    "source":["[https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png](https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png)"],
    "image": ["./dataflow/example/test_data/0.png"],
    "conversation": [
      {
        "from": "human",
        "value": "Please describe the image in detail."
      }
    ],
    "caption": "This is a black-and-white movie poster for the film *Nightmare Alley*. The central focus is a dramatic portrait of actor Bradley Cooper. He is dressed in formal attire... The overall design uses stark monochrome tones to create a suspenseful aesthetic."
  }
]

```