---

title: ContextVQA Multimodal Question Answering Data Generation Pipeline
icon: mdi:image-text
createTime: 2025/06/16 14:30:00
permalink: /en/guide/contextvqa_pipeline/
-----------------------------------------

# ContextVQA Multimodal Question Answering Data Generation Pipeline

## 1. Overview

The **ContextVQA Multimodal Question Answering Data Generation Pipeline** is designed to automatically generate **visual question answering (Context-based VQA) data with external knowledge context** starting from images.

This pipeline leverages a Vision-Language Model (VLM) to understand images, generate a Wikipedia-style article related to the image along with question–answer pairs, and further parse the generated content into a structured `{context, qas}` format.

The pipeline emphasizes:

* **Text-context–mediated visual question answering** (Context VQA)
* Questions that *refer to the image*, while answers are *derived from textual context*
* Automatic construction of high-quality data for multimodal reasoning, RAG-VQA, and knowledge-enhanced VQA

### Typical Use Cases

* 📷 Automatic synthesis of knowledge-based VQA data from images
* 🧠 Training data construction for multimodal reasoning / context-aware VQA
* 📚 Dataset generation combining vision with Wikipedia-style knowledge

---

## 2. Overall Pipeline Workflow

The ContextVQA pipeline consists of **two core operators** connected in sequence:

1. **FixPromptedVQAGenerator**

   * Generates Wikipedia-style articles and raw QA text based on images
2. **WikiQARefiner**

   * Cleans and parses the generated raw text into structured QA data

The overall data flow is as follows:

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

## 3. Quick Start

### Step 1: Install DataFlow

```bash
pip install open-dataflow
```

### Step 2: Prepare Input Data

The input file should be in `json` or `jsonl` format and contain at least one image field, for example:

```jsonl
{
  "id": 1,
  "image": "data/images/example.jpg"
}
```

Where:

* The `image` field can be a local file path or any image reference format supported by DataFlow

---

## 4. Pipeline Initialization

```python
pipe = ContextVQAPipeline(
    model_path="Qwen/Qwen2.5-VL-3B-Instruct",
    first_entry_file="dataflow/example/image_to_text_pipeline/capsbench_captions.jsonl",
    cache_path="./cache_local",
    file_name_prefix="context_vqa",
)
```

### 4.1 Storage (Data Storage)

```python
self.storage = FileStorage(
    first_entry_file_name=first_entry_file,
    cache_path=cache_path,
    file_name_prefix=file_name_prefix,
    cache_type=cache_type,
)
```

**Purpose:**

* Reads and manages input image data
* Handles intermediate result caching at each pipeline stage

---

### 4.2 Serving (Vision-Language Model Serving)

```python
self.serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path=model_path,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512,
)
```

**Description:**

* Uses vLLM-accelerated local VLM serving
* Supports HuggingFace VLMs (e.g., Qwen-VL, InternVL)
* Responsible for image-to-text generation

---

## 5. Core Operators

### 5.1 FixPromptedVQAGenerator (VQA Generation)

```python
self.vqa_generator = FixPromptedVQAGenerator(
    serving=self.serving,
    system_prompt="You are a helpful assistant.",
    user_prompt="..."
)
```

**Functionality:**

* Input: Image
* Output: Raw text containing a Wikipedia-style article and QA pairs

**Prompt Design Goals:**

* Questions should refer to the image but **must not directly name objects in the image**
* Answers must be derived from the generated Wikipedia article
* Answers should be short words or phrases
* Questions should be natural, concise, and require reasoning

**Output Field:**

* `vqa`: Raw generated text (unstructured)

---

### 5.2 WikiQARefiner (Text Parsing and Normalization)

```python
self.refiner = WikiQARefiner()
```

**Functionality:**

* Cleans Markdown and rich-text noise from raw VQA text
* Automatically separates the Wikipedia article and QA sections
* Parses content into a standardized structured format

**Output Format:**

```json
{
  "context": "...",
  "qas": [
    {"question": "...", "answer": "..."}
  ]
}
```

---

## 6. Pipeline Execution Logic

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

### Field Transition Summary

| Stage          | Input Field | Output Field  | Description                                   |
| -------------- | ----------- | ------------- | --------------------------------------------- |
| VQA Generation | `image`     | `vqa`         | Image → raw Wikipedia-style article + QA text |
| Text Parsing   | `vqa`       | `context_vqa` | Structured `{context, qas}`                   |

---

## 7. Example Output

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

## 8. One-Command Execution via CLI

```bash
python context_vqa_pipeline.py \
  --model_path Qwen/Qwen2.5-VL-3B-Instruct \
  --images_file data/images.jsonl \
  --cache_path ./cache_local \
  --file_name_prefix context_vqa
```

---

## 9. Pipeline Highlights

* 🖼️ **Image-driven**: Automatically constructs knowledge-based QA from visual content
* 📚 **Context-aware**: Answers come from textual context rather than direct visual recognition
* 🧠 **Strong reasoning capability**: Questions require joint reasoning over image and text
* 🔌 **Modular design**: Operators can be freely replaced or extended
* ⚡ **Engineering-friendly**: Supports batch processing and cache reuse

This pipeline is particularly well-suited for **context-aware VQA, multimodal RAG, and visual reasoning dataset construction**.