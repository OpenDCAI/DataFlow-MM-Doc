---
title: Video Caption Generation
createTime: 2025/07/16 14:50:59
permalink: /en/mm_guide/4q34ajso/
icon: material-symbols-light:interpreter-mode
---

## 📘 Overview

`VideoToCaptionGenerator` is an operator for **automatically generating video captions using Vision-Language Models (VLM)**.  
It analyzes input videos and generates high-quality descriptive text through prompt-based guidance, suitable for video annotation, multimodal dataset construction, and video understanding tasks.

---

## 🚀 Quick Start

### Step 1: Setup Environment

```bash
conda create -n dataflow-mm python=3.12
conda activate dataflow-mm
pip install open-dataflow
pip install open-dataflow[vllm]
pip install open-dataflow[video]
```

### Step 2: Prepare Input Data

Create input data file (JSON format):

```json
{"video": ["./test/example_video.mp4"], "conversation": [{"from": "human", "value": ""}]}
```

### Step 3: Write Code and Run

```python
from dataflow.operators.core_vision import VideoToCaptionGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage

# Initialize VLM service
vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",
    hf_cache_dir="./model_cache",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=2048,
    vllm_max_model_len=51200,
    vllm_gpu_memory_utilization=0.9
)

# Initialize storage
storage = FileStorage(
    first_entry_file_name="./sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_caption",
    cache_type="json",
)

# Initialize and run operator
video_caption_generator = VideoToCaptionGenerator(vlm_serving=vlm_serving)
video_caption_generator.run(
    storage=storage.step(),
    input_video_key="video",
    input_conversation_key="conversation",
    output_key="caption"
)
```

---

## 📤 Output Example

```json
{
  "video": ["./test/example_video.mp4"],
  "conversation": [{"from": "human", "value": "Please describe the video in detail."}],
  "caption": "This video shows a person walking in a park on a sunny day. The person is wearing casual clothes and appears to be enjoying the outdoor scenery."
}
```

---

## 🎯 Advanced Usage

### Custom Prompts

```python
# Method 1: Direct string
video_caption_generator = VideoToCaptionGenerator(
    vlm_serving=vlm_serving,
    prompt_template="Describe the video content, scenes and main activities in detail."
)

# Method 2: Custom Prompt class
from dataflow.prompts.video import DiyVideoPrompt

custom_prompt = DiyVideoPrompt("Describe the video focusing on: {aspect}")
video_caption_generator = VideoToCaptionGenerator(
    vlm_serving=vlm_serving,
    prompt_template=custom_prompt
)
```

---

## 📖 More Information

For complete parameter descriptions and advanced usage, visit:
- [VideoToCaptionGenerator Operator Documentation](/en/mm_operators/video_understanding/generate/video_caption/)
