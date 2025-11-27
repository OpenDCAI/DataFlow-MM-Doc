---

title: Image-based Knowledge-Enhanced Question Answering Generation (SKVQA)
createTime: 2025/10/26 15:00:00
icon: material-symbols-light:image
permalink: /en/mm_operators/generate/image_skvqa/
---

## 📘 Overview

`ImageSKVQAGenerate` is an operator used to generate **Synthetic Knowledge Visual Question Answering (SKVQA)** data.  
Unlike standard Visual Question Answering (VQA), SKVQA integrates external **context** information during the QA generation process.  
This requires the model to answer questions by reasoning not only based on the image content but also by referencing the textual description or background knowledge.

This capability is widely applicable in tasks such as **visual knowledge reasoning, product documentation QA generation, and multimodal knowledge-enhanced training**.

-----

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter     | Type            | Default | Description                                                             |
| :------------ | :-------------- | :------ | :---------------------------------------------------------------------- |
| `llm_serving` | `LLMServingABC` | -       | **Model Serving Object** used to call the VLM to generate SKVQA results |

-----

## ⚡ `run` Function

```python
def run(
    self,
    storage: DataFlowStorage,
    input_modal_key: str = "image",
    output_key: str = "skvqa"
):
    ...
```

The `run` function executes the main operator logic, generating structured output (including context and QA pairs) in batches for the input images.

-----

## 🧾 `run` Parameters

| Parameter         | Type              | Default     | Description                                                     |
| :---------------- | :---------------- | :---------- | :-------------------------------------------------------------- |
| `storage`         | `DataFlowStorage` | -           | DataFlow storage object                                         |
| `input_modal_key` | `str`             | `"image"`   | **Multimodal Input Field Name** (typically the image path)      |
| `output_key`      | `str`             | `"skvqa"`   | **Output Result Field Name**, used to store the parsed SKVQA results |

-----

## 🧠 Operator Functionality Details

  * Automatically constructs prompts for each input image, requiring both **context generation and QA generation**.

  * After calling the VLM, the built-in `parse_wiki_qa` function is used to automatically parse the model's Markdown structured output, such as sections delimited by: `### Wikipedia Article` and `### Question Answer Pairs`.

  * A structured **SKVQA output** is generated for each input image, stored under the `output_key` field, including:

      * `context`: Context relevant to the image content (background description or knowledge snippet).
      * `qas`: An array of QA pairs, each containing a `question` and an `answer`.

  * Supports fault-tolerant parsing, allowing extraction of valid content even if the output format is not strictly adhered to.

-----

## 🧩 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision.generate.sk_vqa_generator import ImageSKVQAGenerate

# Step 1: Launch local Vision-Language Model
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-3B-Instruct", # Use your actual model path
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512
)

# Step 2: Prepare input file
storage = FileStorage(
    first_entry_file_name="dataflow/example/image_to_text_pipeline/capsbench_captions.jsonl",
    cache_path="./cache_skvqa",
    cache_type="jsonl"
)
storage.step()

# Step 3: Initialize and run the operator
skvqa_generator = ImageSKVQAGenerate(serving)
skvqa_generator.run(
    storage=storage,
    input_modal_key="image",
    output_key="skvqa"
)
```

-----

## 🧾 Default Output Format

| Field   | Type               | Description                                                                  |
| :------ | :--------------- | :--------------------------------------------------------------------------- |
| `image` | `List[str]`      | List of input image paths                                                    |
| `skvqa` | `Dict[str, Any]` | Model-generated structured SKVQA output, containing `context` and the `qas` array |

-----

### 📥 Example Input

```jsonl
{"image": ["./data/product_manual.jpg"]}
```

### 📤 Example Output

```jsonl
{
  "image": ["./data/product_manual.jpg"],
  "skvqa": {
    "context": "This is an instruction document about smartwatch features, showing the health monitoring interface.",
    "qas": [
      {"question": "What device is shown in the image?", "answer": "A smartwatch"},
      {"question": "What are the main functions of this device?", "answer": "It supports heart rate monitoring, step counting, and sleep analysis"},
      {"question": "What is the topic of this text?", "answer": "Introduction to smartwatch features"}
    ]
  }
}
```

## 💡 Key Features Summary

  * ✅ **Knowledge Enhancement**: Generates QA pairs combined with external context.
  * ✅ **Batch Processing**: Supports batch input of images.
  * ✅ **Structured Output**: Automatically parses and outputs structured `context` + `qas` results.
  * ✅ **Compatibility**: Compatible with various Multimodal Large Models (e.g., Qwen-VL, InternVL, MiniCPM-V).
  * ✅ **Wide Application**: Suitable for multimodal knowledge enhancement, retrieval QA, and data generation tasks.