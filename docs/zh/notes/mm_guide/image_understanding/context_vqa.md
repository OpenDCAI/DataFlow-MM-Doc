---

title: ContextVQA 多模态问答数据生成流水线
icon: mdi:image-text
createTime: 2025/06/16 14:30:00
permalink: /zh/guide/contextvqa_pipeline/
-----------------------------------------

# ContextVQA 多模态问答数据生成流水线

## 1. 概述

**ContextVQA 多模态问答数据生成流水线**旨在从图像出发，自动生成**具备外部知识上下文的视觉问答（Context-based VQA）数据**。该流水线通过视觉语言模型（VLM）对图像进行理解，生成一段与图像相关的 Wikipedia 风格文章及其问答对，并进一步将其解析为结构化的 `{context, qas}` 数据格式。

该流水线强调：

* **以文本上下文为中介的视觉问答**（Context VQA）
* 问题需要“指向图像，但答案来自文本上下文”
* 自动构建适用于多模态推理、RAG-VQA、知识增强 VQA 的高质量数据

### 典型应用场景

* 📷 图像 → 知识型 VQA 数据自动合成
* 🧠 多模态推理 / Context-aware VQA 训练数据构建
* 📚 视觉 + Wikipedia 风格知识融合数据集生成

---

## 2. 流水线整体流程

ContextVQA 流水线由 **两个核心算子** 串联组成：

1. **FixPromptedVQAGenerator**：

   * 基于图像生成 Wikipedia 风格文章 + QA 原始文本
2. **WikiQARefiner**：

   * 对生成的原始文本进行清洗与解析，输出结构化 QA

整体数据流如下：

```
Image
  ↓
FixPromptedVQAGenerator
  ↓ (raw VQA text)
WikiQARefiner
  ↓
{ context, qas }
```

---

## 3. 快速开始

### 第一步：安装 DataFlow

```bash
pip install open-dataflow
```

### 第二步：准备输入数据

输入文件需为 `json` / `jsonl` 格式，并至少包含一列图像字段，例如：

```jsonl
{
  "id": 1,
  "image": "data/images/example.jpg"
}
```

其中：

* `image` 字段可以是本地路径或 DataFlow 支持的图像引用格式

---

## 4. Pipeline 初始化说明

```python
pipe = ContextVQAPipeline(
    model_path="Qwen/Qwen2.5-VL-3B-Instruct",
    first_entry_file="dataflow/example/image_to_text_pipeline/capsbench_captions.jsonl",
    cache_path="./cache_local",
    file_name_prefix="context_vqa",
)
```

### 4.1 Storage（数据存储）

```python
self.storage = FileStorage(
    first_entry_file_name=first_entry_file,
    cache_path=cache_path,
    file_name_prefix=file_name_prefix,
    cache_type=cache_type,
)
```

**作用：**

* 负责输入图像数据的读取
* 管理流水线中每一步的中间结果缓存

---

### 4.2 Serving（视觉语言模型服务）

```python
self.serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path=model_path,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512,
)
```

**说明：**

* 使用 vLLM 加速的本地视觉语言模型 Serving
* 支持 HuggingFace VLM（如 Qwen-VL、InternVL 等）
* 负责图像 → 文本生成

---

## 5. 核心算子说明

### 5.1 FixPromptedVQAGenerator（VQA 生成）

```python
self.vqa_generator = FixPromptedVQAGenerator(
    serving=self.serving,
    system_prompt="You are a helpful assistant.",
    user_prompt="..."
)
```

**功能：**

* 输入：图像
* 输出：包含 Wikipedia 风格文章 + QA 的原始文本

**Prompt 设计目标：**

* 问题需指向图像，但**不能直接说出图像中的物体名称**
* 答案必须来自生成的 Wikipedia 文章
* 答案应为简短的词或短语
* 问题自然、简洁，具备推理属性

**输出字段：**

* `vqa`：原始生成文本（未结构化）

---

### 5.2 WikiQARefiner（文本解析与规范化）

```python
self.refiner = WikiQARefiner()
```

**功能：**

* 清洗 VQA 原始文本中的 Markdown / 富文本噪声
* 自动拆分 Wikipedia Article 与 QA 区域
* 解析为标准结构化格式

**输出字段：**

```json
{
  "context": "...",
  "qas": [
    {"question": "...", "answer": "..."}
  ]
}
```

---

## 6. Pipeline 执行逻辑

```python
self.vqa_generator.run(
    storage=self.storage.step(),
    input_image_key="image",
    output_answer_key="vqa"
)

self.refiner.run(
    storage=self.storage.step(),
    input_key="vqa",
    output_key="context_vqa"
)
```

### 字段流转说明

| 阶段     | 输入字段    | 输出字段          | 说明                        |
| :----- | :------ | :------------ | :------------------------ |
| VQA 生成 | `image` | `vqa`         | 图像 → 原始 Wikipedia + QA 文本 |
| 文本解析   | `vqa`   | `context_vqa` | 结构化 `{context, qas}`      |

---

## 7. 示例输出

```jsonl
{
  "id": 1,
  "image": "...",
  "context_vqa": {
    "context": "The Eiffel Tower is a wrought-iron lattice tower in Paris...",
    "qas": [
      {
        "question": "Which city is this landmark located in?",
        "answer": "Paris"
      }
    ]
  }
}
```

---

## 8. 命令行一键运行

```bash
python context_vqa_pipeline.py \
  --model_path Qwen/Qwen2.5-VL-3B-Instruct \
  --images_file data/images.jsonl \
  --cache_path ./cache_local \
  --file_name_prefix context_vqa
```

---

## 9. 流水线特点总结

* 🖼️ **图像驱动**：从视觉内容自动构建知识型 QA
* 📚 **上下文感知**：答案来自文本而非直接视觉识别
* 🧠 **强推理属性**：问题需结合图像 + 文本推理
* 🔌 **模块化设计**：算子可自由替换与扩展
* ⚡ **工程友好**：支持批量处理与缓存复用

该流水线非常适合用于 **Context-aware VQA、多模态 RAG、视觉推理数据集构建** 等高级应用场景。