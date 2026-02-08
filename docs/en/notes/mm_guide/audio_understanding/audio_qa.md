---
title: Audio Q&A Generation
createTime: 2025/07/15 21:33:01
icon: material-symbols-light:autoplay
permalink: /en/mm_guide/2gjc47qb/
---

## Audio Q&A Generation

## Step 1: Install Environment
See[Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Import Relevant Packages
```python
from dataflow.operators.core_audio import PromptedAQAGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
```

## Step 3: Start the Local Model Service
The local model serving method is as follows:
```python
vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2-Audio-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=8192,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 4: Prepare the Audio Data for Caption Generation
Fill in the audio paths in the following format:
```jsonl
{"audio": ["../example_data/audio_aqa_pipeline/test_1.wav"], "conversation": [{"from": "human", "value": "Transcribe the audio into Chinese." }]}
{"audio": ["../example_data/audio_aqa_pipeline/test_2.wav"], "conversation": [{"from": "human", "value": "Describe the sound in this audio clip." }]}

```

## Step 5: Provide the Data Path to FileStorage in the Following Format
```python
storage = FileStorage(
    first_entry_file_name="../example_data/audio_aqa_pipeline/sample_data.jsonl",
    cache_path="./cache",
    file_name_prefix="audio_aqa_pipeline",
    cache_type="jsonl",
)
```

## Step 6: Initialize the PromptedAQAGenerator Operator
```python
prompt_generator = PromptedAQAGenerator(
    vlm_serving=vlm_serving,
    system_prompt="You are a helpful assistant."
)
```

## Step 7: Run the Operator
```python
prompted_generator.run(
    storage=storage.step(),
    input_audio_key="audio",
    output_answer_key="answer",
)
```

## Synthetic Data Example
```json
{"audio":["..\/example_data\/audio_aqa_pipeline\/test_1.wav"],"conversation":[{"from":"human","value":"Transcribe the audio into Chinese."}],"answer":"The audio states: '二十三家全国品牌企业市场份额已达到百分之二十三点三一'"}
{"audio":["..\/example_data\/audio_aqa_pipeline\/test_2.wav"],"conversation":[{"from":"human","value":"Describe the sound in this audio clip."}],"answer":"The audio contains the sound of a machine turning on and off repeatedly."}
```