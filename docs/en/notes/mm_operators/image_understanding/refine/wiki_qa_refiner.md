---

title: WikiQARefiner
createTime: 2025/10/15 19:00:00
# icon: material-symbols-light:article
permalink: /en/text_operators/refine/wikiqa/
--------------------------------------------

## 📘 Overview

`WikiQARefiner` is a **pure text-processing operator** designed to normalize raw text containing *Wikipedia Article + Question Answer Pairs* and parse it into structured JSON data.

This operator does **not** rely on models or GPUs, and focuses on:

* Cleaning Markdown / rich-text noise (e.g. `**bold**`, `*italic*`, nested emphasis)
* Robustly parsing common WikiQA text structures
* Converting unstructured text into a standardized `{context, qas}` format

Typical use cases include:

* WikiQA / reading comprehension data cleaning
* Text → structured QA data preprocessing
* Text normalization stages in multimodal / RAG / QA data pipelines

---

## 🏗️ `__init__` Function

```python
def __init__(self):
    ...
```

### 🧾 Description

This operator requires no additional parameters. During initialization, it only creates a logger instance:

* No model loading
* No GPU usage
* Minimal startup overhead

---

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_key: str = "text",
    output_key: str = "parsed",
):
    ...
```

Executes the main operator logic:

1. Reads the dataframe from `storage`
2. Parses the WikiQA structure row by row from the column specified by `input_key`
3. Writes the parsed result into a new column specified by `output_key`
4. Writes the updated dataframe back to storage

---

## 🧾 `run` Parameters

| Parameter    | Type              | Default    | Description                                                     |
| :----------- | :---------------- | :--------- | :-------------------------------------------------------------- |
| `storage`    | `DataFlowStorage` | –          | DataFlow storage object                                         |
| `input_key`  | `str`             | `"text"`   | **Input text column name**, each row contains a raw WikiQA text |
| `output_key` | `str`             | `"parsed"` | **Output column name** for the parsed structured result         |

⚠️ Notes:

* `input_key` must exist in the dataframe
* `output_key` must not conflict with existing column names

---

## 🧠 Parsing Logic

### 📖 Context (Article Body) Parsing

* Automatically detects and separates the `Article` and `QA` sections

* Supports the following QA header variants (case-insensitive):

  * `### Question Answer Pairs`
  * `### QA`
  * `### Q&A`

* The article body is processed with:

  * Markdown marker removal
  * Excess whitespace normalization

The output is a single string field:

```json
"context": "Cleaned wikipedia article text"
```

---

### ❓ QA Parsing Strategy (Robust Design)

Instead of strictly relying on Markdown formatting, this operator **parses based on line structure**:

* Each question starts with `number.` (e.g. `1.`, `2.`)
* Questions and answers must be separated by a newline
* Answer lines are introduced by `-` / `–` / `—`

Supported example format:

```
1. What is AI?
- Artificial Intelligence.

2. Who proposed it?
- John McCarthy.
```

The parser remains robust even in the presence of:

* Nested emphasis: `**Question **Sub** End**`
* Irregular spacing or extra newlines
* Incomplete or broken Markdown

The final QA output format:

```json
"qas": [
  {"question": "...", "answer": "..."}
]
```

---

## 🧩 Example Usage

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

## 📥 Example Input

```jsonl
{
  "id": 1,
  "text": "### Wikipedia Article\nArtificial intelligence (AI) is...\n\n### Question Answer Pairs\n1. What does AI stand for?\n- Artificial Intelligence."
}
```

---

## 📤 Example Output

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

## ✅ Output Format Summary

| Field     | Type         | Description                                               |
| :-------- | :----------- | :-------------------------------------------------------- |
| `context` | `str`        | Normalized Wikipedia article text                         |
| `qas`     | `List[Dict]` | List of QA pairs, each containing `question` and `answer` |

---

## ⭐ Operator Highlights

* 🧠 **Highly robust**: Does not depend on strict Markdown formatting
* 🧹 **Strong cleaning capability**: Automatically removes rich-text noise
* ⚡ **High performance**: Pure CPU, suitable for large-scale batch processing
* 🔌 **Easy integration**: Standard DataFlow Operator interface