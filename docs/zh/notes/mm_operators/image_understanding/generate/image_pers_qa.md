---
title: PersQAGenerator
createTime: 2026/01/24 15:37:37
permalink: /zh/mm_operators/generate/image_pers_qa/
---

## 📘 概述

`PersQAGenerator` 是一个用于**基于视觉语言大模型（VLM）生成个性化图片问答**的算子。  
该算子专注于“以人物为中心”的问答生成：它会自动为图像中的主要人物分配名称标签（默认为 `<mam>`），从预定义的问题池中随机抽取问题，并强制模型以人物标签作为回答的开头。

**功能特点：**
* **身份锚定**：自动为图像主人公分配 `<mam>` 标签，实现个性化指代。
* **模板驱动**：内置 `PersQAGeneratorPrompt` 自动构建系统提示词和问题模板。
* **动态注入**：在 `run` 过程中自动修改对话上下文（conversation），无需手动构造问题。
* **结构化输出**：输出经过角色对齐的回答，适用于人物中心的多模态模型评估。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...

```

### 🧾 `__init__` 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `llm_serving` | `LLMServingABC` | - | **模型服务对象**，用于调用 VLM 执行推理 |

> **注意**：算子内部会自动初始化 `PersQAGeneratorPrompt` 并配置 `system_prompt`，用户无需手动传入。

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

`run` 算子主逻辑：

1. 从存储中读取数据。
2. 自动随机生成包含 `<mam>` 标签的个性化问题。
3. **改写数据**：将生成的 Prompt 填入 `conversation` 字段。
4. 调用模型生成以 `<mam>` 开头的回答并存入 `output_key`。

### 🧾 `run` 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `storage` | `DataFlowStorage` | - | Dataflow 统一数据存储对象 |
| `input_modal_key` | `str` | `"image"` | **图像字段名** |
| `output_key` | `str` | `"output"` | **生成的个性化回答存放的字段名** |

---

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import PersQAGenerator

# 1. 初始化推理引擎
model = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
)

# 2. 初始化算子 (内部自动处理 Prompt 模板)
generator = PersQAGenerator(llm_serving=model)

# 3. 准备数据
storage = FileStorage(
    first_entry_file_name="./sample_data.json", 
    cache_path="./cache_local",
    file_name_prefix="pers_qa_res",
    cache_type="json",
)
storage.step()

# 4. 执行生成
generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="pers_qa"
)

```

---

## 🧾 数据流示例

### 📥 示例输入

注意：`conversation` 中的初始 `value` 会被算子自动替换为生成的个性化 Prompt。

```json
[
    {
        "source":["[https://huggingface.co/datasets/.../0.png](https://huggingface.co/datasets/.../0.png)"],
        "image": ["./dataflow/example/test_data/0.png"],
        "conversation": [
            {
                "from": "human",
                "value": "任意内容，后续会被自动覆盖"
            }
        ]
    }
]

```

### 📤 示例输出

算子会自动在 `conversation` 中构造符合要求的指令，并在 `pers_qa` 字段返回模型的个性化回答。

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

> **Tips**: 算子内硬编码标识符为 `<mam>`（可以自定义修改）。建议配合高性能 MLLM 使用，以确保模型能严格遵守“以指定标签开头”的回复约束。