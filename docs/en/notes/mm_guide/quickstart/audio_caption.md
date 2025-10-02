---
title: Audio Caption Generation
createTime: 2025/07/15 21:31:49
icon: material-symbols-light:autoplay
permalink: /en/mm_guide/09q1xv7v/
---

## Audio Caption Generation

## Step 1: Prepare the DataFlow environment
```bash
conda create -n myvenv python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## Step 2: Install the DataFlow audio module
```bash
pip install open-dataflow[audio]
```

## Step 3: Launch the local model service
How to Call the Local Model Service:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2-Audio-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=8192,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 4: Fill in the audio path in the specified format and prepare the data that needs audio caption.
```jsonl
{"audio": ["your_audio_path"]}
```

## Step 5: Set the data path in FileStorage using the format below.
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

## Step 6: Initialize the CaptionGenerator operator
```python
generator = CaptionGenerator(llm_serving)
```

## Step 7: Run the operator
```python
generator.run(storage=storage.step(), output_key="caption")
```
