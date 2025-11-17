---
title: Audio Caption Generation
createTime: 2025/07/15 21:33:01
icon: material-symbols-light:autoplay
permalink: /en/mm_guide/2gjc47qb/
---

## Audio Caption Generation

## Step 1: Install Environment
See[ Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Start the Local Model Service
The local model serving method is as follows:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2-Audio-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=8192,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 3: Prepare the Audio Data for Caption Generation
Fill in the audio paths in the following format:
```jsonl
{"audio": ["your_audio_path"]}
```

## Step 4: Add the Data Path to FileStorage in the Following Format
```python
storage = FileStorage(
    first_entry_file_name="your_path",
    cache_path="./cache",
    file_name_prefix="audio_caption",
    cache_type="jsonl",
    media_key="audio",
    media_type="audio"
)
```

## Step 5: Initialize the CaptionGenerator Operator
```python
generator = CaptionGenerator(llm_serving)
```

## Step 6: Execute the Operator
```python
generator.run(storage=storage.step(), output_key="caption")
```