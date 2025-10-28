---
title: 图片知识增强问答生成（SKVQA）
createTime: 2025/10/26 15:00:00
icon: material-symbols-light:image
permalink: /zh/mm_operators/generate/image_skvqa/
---

## 📘 概述

`ImageSKVQAGenerate` 是一个用于生成 **Synthetic Knowledge Visual Question Answering（SKVQA，合成知识视觉问答）** 数据的算子。
与普通的视觉问答（VQA）不同，SKVQA 会在问答生成过程中结合外部**上下文（context）**信息，
让模型在回答问题时不仅基于图像内容，还能参考文字描述或背景知识进行推理。

这种能力可广泛应用于**视觉知识理解、产品文档问答生成、多模态知识增强训练**等任务。

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

| 参数名           | 类型              | 默认值 | 说明                                |
| :------------ | :-------------- | :-- | :-------------------------------- |
| `llm_serving` | `LLMServingABC` | -   | 模型服务对象，用于调用视觉语言模型（VLM）生成 SKVQA 结果 |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    multi_modal_key: str = "image",
    output_key: str = "skvqa"
):
    ...
```

执行算子主逻辑，对输入的图像批量生成包含上下文（context）与问答对（QAs）的结构化输出。

---

## 🧾 `run` 参数说明

| 参数名               | 类型                | 默认值       | 说明                |
| :---------------- | :---------------- | :-------- | :---------------- |
| `storage`         | `DataFlowStorage` | -         | DataFlow 数据存储对象   |
| `multi_modal_key` | `str`             | `"image"` | 多模态输入字段名（通常为图片路径） |
| `output_key`      | `str`             | `"skvqa"` | 输出结果字段名，用于保存解析结果  |

---

## 🧠 算子功能说明

* 自动为每张输入图像生成一个结构化的 **SKVQA 输出**，包括：

  * `context`：与图像内容相关的上下文（背景描述或知识片段）
  * `qas`：多个问答对，每个包含 `question` 和 `answer`

* 自动解析模型输出中的 Markdown 格式结构，如：

  ```
  ### Wikipedia Article
  （上下文内容）

  ### Question Answer Pairs
  1. **问题**  
     - 答案
  2. **问题**  
     - 答案
  ```

* 支持容错解析，即使格式不完全符合预期也能尽量提取有效内容。

* 可应用于视觉知识增强、图文融合训练、问答生成等场景。

---

## 🧩 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision.generate.sk_vqa_generator import ImageSKVQAGenerate

# Step 1: 启动本地视觉语言模型
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512
)

# Step 2: 准备输入文件
storage = FileStorage(
    first_entry_file_name="data/example_skvqa.jsonl",
    cache_path="./cache_skvqa",
    cache_type="jsonl"
)
storage.step()

# Step 3: 初始化算子并运行
skvqa_generator = ImageSKVQAGenerate(serving)
skvqa_generator.run(
    storage=storage,
    multi_modal_key="image",
    output_key="skvqa"
)
```

---

## 🧾 默认输出格式（Output Format）

| 字段      | 类型               | 说明                           |
| :------ | :--------------- | :--------------------------- |
| `image` | `List[str]`      | 输入图像路径列表                     |
| `skvqa` | `Dict[str, Any]` | 模型生成的结构化 SKVQA 输出，含上下文与问答对数组 |

---

### 📥 示例输入

```jsonl
{"image": ["./data/product_manual.jpg"]}
```

### 📤 示例输出

```jsonl
{
  "image": ["./data/product_manual.jpg"],
  "skvqa": {
    "context": "这是一份关于智能手表功能的说明文档，图中展示了健康监测界面。",
    "qas": [
      {"question": "图中展示的设备是什么？", "answer": "一块智能手表"},
      {"question": "该设备有哪些主要功能？", "answer": "支持心率监测、步数统计和睡眠分析"},
      {"question": "这段文字的主题是什么？", "answer": "智能手表的功能介绍"}
    ]
  }
}
```

## 💡 特点总结

* ✅ 支持批量图像输入
* ✅ 自动生成上下文 + 问答对的结构化结果
* ✅ 内置格式容错与清洗逻辑
* ✅ 可与任意多模态大模型（如 Qwen-VL、InternVL、MiniCPM-V）兼容
* ✅ 适用于多模态知识增强、检索问答、数据生成任务
