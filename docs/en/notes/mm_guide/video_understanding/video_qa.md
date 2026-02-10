---
title: Video QA Generation Pipeline
createTime: 2025/07/16 16:00:00
permalink: /en/mm_guide/video_qa_pipeline/
icon: mdi:chat-question
---

# Video QA Generation Pipeline

## 1. Overview

The **Video QA Generation Pipeline** automatically generates high-quality question-answer pairs from video content by first generating video captions and then creating QA pairs based on the captions, suitable for video QA dataset construction, video understanding evaluation, and multimodal training data generation.

We support the following use cases:

- Automatic video QA dataset construction
- Video understanding evaluation data generation
- Multimodal dialogue training data synthesis
- Video content understanding and QA

The main stages of the pipeline include:

1. **Video Caption Generation**: Analyze video content using VLM models and generate detailed captions.
2. **QA Pair Generation**: Generate questions and answers based on video captions (optionally combined with video).

---

## 2. Quick Start

### Step 1: Create a new DataFlow workspace
```bash
mkdir run_dataflow_mm
cd run_dataflow_mm
```

### Step 2: Initialize DataFlow-MM
```bash
dataflowmm init
```
You will see:
```bash
run_dataflow_mm/playground/video_qa_pipeline.py  
```

### Step 3: Configure model path

In `video_qa_pipeline.py`, configure the VLM model path:

```python
self.vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",  # Modify to your model path
    hf_cache_dir="./dataflow_cache",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=2048,
    vllm_max_model_len=51200,
    vllm_gpu_memory_utilization=0.9
)
```

### Step 4: One-click run
```bash
python playground/video_qa_pipeline.py
```

::: tip API Version
If you prefer to use an API service instead of a local model, you can use the API version of the pipeline:
```bash
python api_pipelines/video_qa_api_pipeline.py
```
The API version is used similarly to the local version. Simply configure the API key and service address. For details, see the configuration instructions in `api_pipelines/video_qa_api_pipeline.py`.
:::

You can adjust the generation strategy (whether to use video input when generating QA) based on your needs. Below we introduce each step in the pipeline and parameter configuration in detail.

---

## 3. Data Flow and Pipeline Logic

### 1. **Input Data**

The pipeline input includes the following fields:

* **video**: List of video file paths, e.g., `["path/to/video.mp4"]`
* **conversation**: Conversation format data, e.g., `[{"from": "human", "value": ""}]`
* **image** (optional): List of image file paths for processing images simultaneously

Inputs can be stored in designated files (such as `json` or `jsonl`) and managed and read via the `FileStorage` object:

```python
self.storage = FileStorage(
    first_entry_file_name="./dataflow/example/video_caption/sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_vqa",
    cache_type="json",
)
```

**Input Data Example**:

```json
[
    {
        "video": ["./videos/sample1.mp4"],
        "conversation": [{"from": "human", "value": ""}]
    },
    {
        "video": ["./videos/sample2.mp4"],
        "conversation": [{"from": "human", "value": ""}]
    }
]
```

### 2. **Video Caption Generation (PromptedVQAGenerator)**

The first step of the pipeline is to use the **Prompted VQA Generator** (`PromptedVQAGenerator`) combined with `VideoCaptionGeneratorPrompt` to generate detailed text descriptions for videos.

**Functionality:**

* Analyze video content using VLM models and generate descriptive text
* Provide content foundation for subsequent QA generation
* Use a prompt template to configure the format and style of generated content

**Input:** Video file paths and conversation format data  
**Output:** Generated video caption text (`caption` field)

**Operator Initialization**:

```python
from dataflow.prompts.video import VideoCaptionGeneratorPrompt

self.prompt_template = VideoCaptionGeneratorPrompt()

self.prompted_vqa_generator = PromptedVQAGenerator(
    serving=self.vlm_serving,
    system_prompt="You are a helpful assistant.",
    prompt_template=self.prompt_template
)
```

**Operator Run**:

```python
self.prompted_vqa_generator.run(
    storage=self.storage.step(),
    input_image_key="image",              # Input image field (optional)
    input_video_key="video",              # Input video field
    input_conversation_key="conversation", # Input conversation field
    output_answer_key="caption",          # Output caption field
)
```

### 3. **QA Pair Generation (VideoCaptionToQAGenerator)**

The second step of the pipeline is to use the **QA Generator** (`VideoCaptionToQAGenerator`) to generate QA pairs based on video captions.

**Functionality:**

* Generate relevant questions and answers based on video captions
* Supports two modes:
  - **With video input**: Generate QA based on both caption and video content (more accurate)
  - **Caption only**: Generate QA based only on text caption (faster)

**Input:** Video caption, video file (optional), conversation data  
**Output:** Generated QA pairs (`qa` field)

**Operator Initialization**:

```python
self.videocaption_to_qa_generator = VideoCaptionToQAGenerator(
    vlm_serving=self.vlm_serving,
    use_video_input=True,  # Controls whether to use video input
)
```

**Parameter Description**:
- `use_video_input=True`: Use both caption and video to generate questions
- `use_video_input=False`: Use only caption to generate questions

**Operator Run**:

```python
self.videocaption_to_qa_generator.run(
    storage=self.storage.step(),
    input_image_key="image",              # Input image field (optional)
    input_video_key="video",              # Input video field
    input_conversation_key="conversation", # Input conversation field
    output_key="qa",                      # Output QA field
)
```

### 4. **Output Data**

The final output includes:

* **video**: Original video path
* **conversation**: Updated conversation data
* **caption**: Generated video caption text
* **qa**: Generated QA pairs (including questions and answers)

**Output Data Example**:

```json
{
    "video": ["./videos/sample1.mp4"],
    "conversation": [{"from": "human", "value": "Please describe the video in detail."}],
    "caption": "This video shows a person walking in a park on a sunny day. The weather is clear and bright, with trees and benches visible in the background.",
    "qa": {
        "question": "What is the person doing in the video?",
        "answer": "The person in the video is walking in a park, enjoying the sunny weather."
    }
}
```

---

## 4. Pipeline Example

An example pipeline demonstrating how to use VideoVQAGenerator for video QA generation:

```python
from dataflow.operators.core_vision import PromptedVQAGenerator, VideoCaptionToQAGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
from dataflow.prompts.video import VideoCaptionGeneratorPrompt

class VideoVQAGenerator():
    def __init__(self):
        """
        Initialize VideoVQAGenerator with default parameters.
        """
        self.storage = FileStorage(
            first_entry_file_name="./dataflow/example/video_caption/sample_data.json",
            cache_path="./cache",
            file_name_prefix="video_vqa",
            cache_type="json",
        )

        self.vlm_serving = LocalModelVLMServing_vllm(
            hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",
            hf_cache_dir="./dataflow_cache",
            vllm_tensor_parallel_size=1,
            vllm_temperature=0.7,
            vllm_top_p=0.9, 
            vllm_max_tokens=2048,
            vllm_max_model_len=51200,  
            vllm_gpu_memory_utilization=0.9
        )

        self.prompt_template = VideoCaptionGeneratorPrompt()
        
        self.prompted_vqa_generator = PromptedVQAGenerator(
            serving=self.vlm_serving,
            system_prompt="You are a helpful assistant.",
            prompt_template=self.prompt_template
        )
        
        self.videocaption_to_qa_generator = VideoCaptionToQAGenerator(
            vlm_serving=self.vlm_serving,
            use_video_input=True,  # Control video input usage
        )

    def forward(self):
        # Step 1: Generate video captions using PromptedVQAGenerator
        self.prompted_vqa_generator.run(
            storage=self.storage.step(),
            input_image_key="image",
            input_video_key="video",
            input_conversation_key="conversation",
            output_answer_key="caption",
        )
        
        # Step 2: Generate QA from captions
        self.videocaption_to_qa_generator.run(
            storage = self.storage.step(),
            input_image_key="image",
            input_video_key="video",
            input_conversation_key="conversation",
            output_key="qa",
        )

if __name__ == "__main__":
    model = VideoVQAGenerator()
    model.forward()
```