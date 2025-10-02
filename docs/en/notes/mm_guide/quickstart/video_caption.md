---
title: Video Caption Generation
createTime: 2025/07/16 15:39:23
permalink: /en/mm_guide/84ire1nl/
icon: material-symbols-light:interpreter-mode
---

# Quick Start

## Step 1: Prepare the DataFlow environment
```bash
conda create -n dataflow-mm python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## Step 2: Install the DataFlow video module
```bash
pip install open-dataflow[video]
```

## Step 3: Launch the local model service

Call the Local Model Service:

```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=None,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 4: Fill in the video path in using the format below

```jsonl
{"video": ["your_video_path"]}
```

## Step 5: Set the data path in FileStorage using the format below

```python
storage = FileStorage(
    first_entry_file_name="your_path",
    cache_path="./cache",
    file_name_prefix="video_caption",
    cache_type="jsonl",
    media_key="video",
    media_type="video"
)
```

## Step 6: Initialize a VideoGenerator operator and set Prompt properly
```python
from dataflow.prompts.VideoCaptionPromptGenerator import VideoCaptionPromptGenerator
captionGenerator = VideoGenerator(
    llm_serving, VideoCaptionPromptGenerator()
)
```

## Step 7: Run the operator
```python
captionGenerator.run(storage=storage.step(), output_key="caption")
```
