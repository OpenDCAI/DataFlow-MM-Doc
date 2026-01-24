---
title: ImageQAGenerator
createTime: 2026/01/24 15:37:37
permalink: /zh/mm_operators/generate/image_qa/
---

## 📘 概述

`ImageQAGenerator` 是一个用于**根据图像内容自动生成问答对（Visual QA）**的算子。  
它通过封装 `PromptedVQAGenerator`，基于图像场景智能提出合理问题并生成参考答案。该算子是构建多模态数据集、指令微调数据以及视觉问答系统的核心组件。

**功能特点：**
* **自动生成**：基于视觉语言模型（VLM）自动提取图像关键信息并构建 QA。
* **批量处理**：支持对海量图像进行自动化标注。
* **灵活提示**：通过 `system_prompt` 定义问答的风格（如单轮问答、多轮问答或特定知识点提取）。
* **上下文支持**：自动处理图像输入与对话提示词的构建逻辑。

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
| `llm_serving` | `LLMServingABC` | - | **模型服务对象**，用于调用 VLM 执行推理任务 |
| `system_prompt` | `str` | - | **系统提示词**，用于约束生成 QA 的逻辑（如：指定生成问题的语言或深度） |

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

`run` 算子主逻辑：读取图像路径，结合 `system_prompt` 和输入数据中的对话信息，调用推理后端生成 QA 文本，并将结果保存至指定的 `output_key`。

### 🧾 `run` 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow 统一数据存储对象 |
| `input_modal_key` | `str` | `"image"` | **多模态输入字段名**（图像所在的 Key） |
| `output_key` | `str` | `"output"` | **生成的 QA 存放的字段名** |

---

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageQAGenerator

# 1. 启动模型服务
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=512,
)

# 2. 初始化算子，设置 QA 生成规则
qa_generator = ImageQAGenerator(
    llm_serving=model,
    system_prompt="You are a image question-answer generator. Your task is to generate a question-answer pair for the given image content.",
)

# 3. 准备数据
storage = FileStorage(
    first_entry_file_name="./capsbench_qas.json",
    cache_path="./cache_local",
    file_name_prefix="qa_task",
    cache_type="json",
)
storage.step() # 加载数据

# 4. 执行
qa_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="qa"
)

```

---

## 🧾 数据流示例

### 📥 示例输入

```json
[
    {
        "source":["https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png"],
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

### 📤 示例输出

```json
[
  {
    "source":["https://huggingface.co/datasets/OpenDCAI/dataflow-demo-image/resolve/main/capsbench_images/0.png"],
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

> **提示：** `qa` 字段返回的通常是包含 Markdown 格式的原始文本。若需进一步将 `Question` 和 `Answer` 拆分为独立字段，建议配合文本切分算子使用。