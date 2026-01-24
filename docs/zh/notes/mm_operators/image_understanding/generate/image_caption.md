---
title: ImageCaptionGenerator
createTime: 2026/01/24 15:37:37
permalink: /zh/mm_operators/generate/image_caption/
---

## 📘 概述

`ImageCaptionGenerator` 是一个用于**调用视觉语言大模型（VLM）自动生成图片描述（Caption）**的算子。  
它封装了 `PromptedVQAGenerator`，能够根据输入图像及预设的系统提示词，引导模型输出高质量、结构化的场景描述。该算子广泛应用于多模态数据标注、自动摘要生成及数据集构建等任务。

**功能特点：**
* **批量化处理**：支持对大规模图像数据集进行流式或批量描述生成。
* **灵活配置**：支持自定义 `system_prompt` 以控制生成文本的风格（如简洁、详尽、或特定格式）。
* **兼容性强**：基于 `LLMServingABC` 接口，既支持通过 vLLM 部署的本地模型，也支持 OpenAI 兼容格式的 API 服务（如 DashScope、GPT-4o 等）。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    llm_serving: LLMServingABC,
    system_prompt: str
):
    ...

```

### 🧾 `__init__` 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `llm_serving` | `LLMServingABC` | - | **模型服务对象**，支持本地显卡加载或远程 API 调用实例 |
| `system_prompt` | `str` | - | **系统提示词**，定义生成器的角色和输出要求（如：要求生成简洁的标题） |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    input_modal_key: str = "image", 
    output_key: str = "output"
):
    ...

```

### 🧾 `run` 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow 统一数据存储对象 |
| `input_modal_key` | `str` | `"image"` | **图像字段名**，指定数据中存放图片路径的 Key |
| `output_key` | `str` | `"output"` | **输出字段名**，指定生成的描述文本存放的 Key |

---

## 🧠 示例用法

### 选项 A：使用本地部署模型 (Local vLLM)

适用于拥有本地 GPU 算力资源的情况。

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageCaptionGenerator

# 1. 初始化模型服务（以 Qwen2.5-VL 为例）
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=512,
)

# 2. 初始化算子，设置系统提示词
caption_generator = ImageCaptionGenerator(
    llm_serving=model,
    system_prompt="You are a image caption generator. Your task is to generate a concise and informative caption for the given image content.",
)

# 3. 准备输入数据
storage = FileStorage(
    first_entry_file_name="./capsbench_captions.json", 
    cache_path="./cache_local",
    file_name_prefix="caption_task",
    cache_type="json",
)
storage.step()  # 加载数据到内存

# 4. 执行算子
caption_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="caption"
)

```

### 选项 B：使用在线 API 服务 (OpenAI 兼容接口)

适用于调用阿里云 DashScope、GPT-4o 或其他云端大模型服务。项目中其余算子或者Pipeline都可以使用如下类似的API模型。

```python
import os
from dataflow.utils.storage import FileStorage
from dataflow.serving.api_vlm_serving_openai import APIVLMServing_openai
from dataflow.operators.core_vision import ImageCaptionGenerator

# 设置 API Key 环境变量
os.environ["DF_API_KEY"] = "your api-key"

# 1. 初始化 API 服务对象 (以 Qwen API 为例)
api_serving = APIVLMServing_openai(
  api_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
  key_name_of_api_key="DF_API_KEY",
  model_name="qwen3-vl-8b-instruct",
  image_io=None,
  send_request_stream=False,
  max_workers=10,
  timeout=1800
)

# 2. 初始化算子
caption_generator = ImageCaptionGenerator(
    llm_serving=api_serving,
    system_prompt="You are a image caption generator. Your task is to generate a concise and informative caption.",
)

# 3. 准备输入数据
storage = FileStorage(
    first_entry_file_name="./capsbench_captions.json", 
    cache_path="./cache_local",
    file_name_prefix="caption_task",
    cache_type="json",
)
storage.step()  # 加载数据到内存

# 4. 执行算子
caption_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="caption"
)

```

---

## 🧾 数据流示例

### 📥 示例输入 (Input)

```json
[
  {
    "source":["https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png"],
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

### 📤 示例输出 (Output)

```json
[
  {
    "source":["https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png"],
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