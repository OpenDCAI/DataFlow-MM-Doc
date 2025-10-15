---
title: 个性化图片问答生成
createTime: 2025/10/15 18:20:00
icon: material-symbols-light:quiz
permalink: /zh/mm_operators/generate/image_pers_qa/
---

## 📘 概述

`PersQAGenerate` 是一个用于**基于视觉语言大模型生成个性化图片问答**的算子。  
它会：
- 自动为图像中的主要人物分配名称标签（如 `<mam>`）；
- 从预定义模板中随机选择合适的问题；
- 引导大模型以人物名为开头作答；
- 输出结构化的问答对，适用于多模态问答数据集构建与角色理解能力评估。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名           | 类型              | 默认值 | 说明                   |
| :------------ | :-------------- | :-- | :------------------- |
| `llm_serving` | `LLMServingABC` | -   | 模型服务对象，用于调用 VLM 生成问答 |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    multi_modal_key: str = "image",
    output_key: str = "pers_qa"
):
    ...
```

`run` 是算子主逻辑，执行问答生成任务，读取图片路径 → 构建问题和提示词 → 调用模型 → 返回结构化问答结果。

## 🧾 `run` 参数说明

| 参数名               | 类型                | 默认值         | 说明              |
| :---------------- | :---------------- | :---------- | :-------------- |
| `storage`         | `DataFlowStorage` | -           | Dataflow 数据存储对象 |
| `multi_modal_key` | `str`             | `"image"`   | 多模态输入字段名        |
| `output_key`      | `str`             | `"pers_qa"` | 模型输出字段名         |

---

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import PersQAGenerate

# Step 1: 启动本地模型服务
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512
)

# Step 2: 构建存储
storage = FileStorage(
    first_entry_file_name="data/example.jsonl",
    cache_path="./cache_local",
    file_name_prefix="pers_qa",
    cache_type="jsonl",
    media_key="image",
    media_type="image"
)
storage.step()

# Step 3: 初始化并运行算子
generator = PersQAGenerate(serving)
generator.run(
    storage=storage,
    multi_modal_key="image",
    output_key="pers_qa"
)
```

---

## 🧾 默认输出格式（Output Format）

| 字段        | 类型          | 说明                                            |
| :-------- | :---------- | :-------------------------------------------- |
| `image`   | `List[str]` | 输入图像路径                                        |
| `pers_qa` | `str`       | 模型生成的个性化问答对文本，格式为 `Question: ... Answer: ...` |

---

### 📥 示例输入

```jsonl
{"image": ["./test/example1.jpg"]}
{"image": ["./test/example2.jpg"]}
```

### 📤 示例输出

```jsonl
{"image": ["./test/example1.jpg"], "pers_qa": "Question: <mam>在做什么？ Answer: <mam>正在微笑看向镜头。"}
{"image": ["./test/example2.jpg"], "pers_qa": "Question: <mam>在哪里？ Answer: <mam>在一间咖啡馆。"}
```