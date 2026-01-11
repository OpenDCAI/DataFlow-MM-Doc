---

title: WikiQA 文本解析与规范化算子
createTime: 2025/10/15 19:00:00
icon: material-symbols-light:article
permalink: /zh/text_operators/refine/wikiqa/
--------------------------------------------

## 📘 概述

`WikiQARefiner` 是一个 **纯文本处理算子**，用于将包含 *Wikipedia Article + Question Answer Pairs* 的原始文本进行 **格式规范化** 并解析为结构化 JSON 数据。

该算子不依赖模型或 GPU，专注于：

* 清洗 Markdown / 富文本噪声（如 `**bold**`、`*italic*`、嵌套加粗等）
* 鲁棒解析 WikiQA 常见文本结构
* 将非结构化文本转换为 `{context, qas}` 的标准格式

适用于：

* WikiQA / 阅读理解数据清洗
* 文本 → 结构化 QA 数据的预处理
* 多模态 / RAG / QA 数据流水线中的文本规范化阶段

---

## 🏗️ `__init__` 函数

```python
def __init__(self):
    ...
```

### 🧾 说明

该算子无需额外参数，初始化时仅创建日志实例：

* 不加载模型
* 不占用 GPU
* 启动开销极低

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    input_key: str = "text",
    output_key: str = "parsed",
):
    ...
```

执行算子主逻辑：

1. 从 `storage` 中读取 dataframe
2. 对 `input_key` 指定的文本列逐行解析 WikiQA 结构
3. 将解析结果写入新的 `output_key` 列
4. 将结果 dataframe 写回 storage

---

## 🧾 `run` 参数说明

| 参数名          | 类型                | 默认值        | 说明                           |
| :----------- | :---------------- | :--------- | :--------------------------- |
| `storage`    | `DataFlowStorage` | -          | Dataflow 数据存储对象              |
| `input_key`  | `str`             | `"text"`   | **输入文本列名**，每行是一段 WikiQA 原始文本 |
| `output_key` | `str`             | `"parsed"` | **输出列名**，存放解析后的结构化结果         |

⚠️ 注意：

* `input_key` 必须存在于 dataframe 中
* `output_key` 不能与已有列名冲突

---

## 🧠 解析逻辑说明

### 📖 Context（文章正文）解析

* 自动识别并分离 `Article` 与 `QA` 区域
* 支持以下 QA 标题变体（大小写不敏感）：

  * `### Question Answer Pairs`
  * `### QA`
  * `### Q&A`
* 对正文部分进行：

  * Markdown 标记清洗
  * 多余空白压缩

输出为单一字符串字段：

```json
"context": "Cleaned wikipedia article text"
```

---

### ❓ QA 解析策略（鲁棒性设计）

不同于严格依赖 Markdown 格式，该算子 **基于行结构进行解析**：

* 以 `数字.` 作为问题起始标记（如 `1.`、`2.`）
* 问题与答案必须换行
* 答案行以 `-` / `–` / `—` 引导

示例支持格式：

```
1. What is AI?
- Artificial Intelligence.

2. Who proposed it?
- John McCarthy.
```

即使存在如下情况，也可正确解析：

* 嵌套加粗：`**Question **Sub** End**`
* 不规范空格 / 多余换行
* 不完整 Markdown

最终输出 QA 列表：

```json
"qas": [
  {"question": "...", "answer": "..."}
]
```

---

## 🧩 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.text import WikiQARefiner

storage = FileStorage(
    first_entry_file_name="data/wiki_raw.jsonl",
    cache_path="./cache_local",
    file_name_prefix="wikiqa_refined",
    cache_type="jsonl",
)
storage.step()

op = WikiQARefiner()
op.run(
    storage=storage,
    input_key="text",
    output_key="parsed",
)
```

---

## 📥 示例输入

```jsonl
{
  "id": 1,
  "text": "### Wikipedia Article\nArtificial intelligence (AI) is...\n\n### Question Answer Pairs\n1. What does AI stand for?\n- Artificial Intelligence."
}
```

---

## 📤 示例输出

```jsonl
{
  "id": 1,
  "text": "...",
  "parsed": {
    "context": "Artificial intelligence (AI) is...",
    "qas": [
      {
        "question": "What does AI stand for?",
        "answer": "Artificial Intelligence."
      }
    ]
  }
}
```

---

## ✅ 输出格式总结

| 字段        | 类型           | 说明                               |
| :-------- | :----------- | :------------------------------- |
| `context` | `str`        | 规范化后的 Wikipedia 正文               |
| `qas`     | `List[Dict]` | 问答对列表，每项包含 `question` 和 `answer` |

---

## ⭐ 算子特点总结

* 🧠 **高鲁棒性**：不依赖严格 Markdown
* 🧹 **强清洗能力**：自动去除富文本噪声
* ⚡ **高性能**：纯 CPU，适合大规模批处理
* 🔌 **易集成**：标准 DataFlow Operator 接口