---
title: 音频问答生成
createTime: 2025/07/15 21:33:01
icon: material-symbols-light:autoplay
permalink: /zh/mm_guide/2gjc47qb/
---


## 音频问答生成

## 第一步: 安装环境
见[Audio环境安装](./install_audio_understanding.md)

## 第二步: 导入包
```python
from dataflow.operators.core_audio import PromptedAQAGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
```

## 第三步: 启动本地模型服务
本地模型调用服务方法如下:
```python
vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2-Audio-7B-Instruct", 
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=8192,
    vllm_gpu_memory_utilization=0.7
)
```

## 第四步: 按如下格式填写音频路径, 准备需要增加音频字幕的数据
```jsonl
{"audio": ["../example_data/audio_aqa_pipeline/test_1.wav"], "conversation": [{"from": "human", "value": "Transcribe the audio into Chinese." }]}
{"audio": ["../example_data/audio_aqa_pipeline/test_2.wav"], "conversation": [{"from": "human", "value": "Describe the sound in this audio clip." }]}

```

## 第五步: 按下述格式将数据路径填入FileStorage中
```python
storage = FileStorage(
    first_entry_file_name="../example_data/audio_aqa_pipeline/sample_data.jsonl",
    cache_path="./cache",
    file_name_prefix="audio_aqa_pipeline",
    cache_type="jsonl",
)
```

## 第六步: 初始化PromptedAQAGenerator算子
```python
prompt_generator = PromptedAQAGenerator(
    vlm_serving=vlm_serving,
    system_prompt="You are a helpful assistant."
)
```

## 第七步: 执行算子
```python
prompted_generator.run(
    storage=storage.step(),
    input_audio_key="audio",
    output_answer_key="answer",
)
```

## 合成数据样例
```json
{"audio":["..\/example_data\/audio_aqa_pipeline\/test_1.wav"],"conversation":[{"from":"human","value":"Transcribe the audio into Chinese."}],"answer":"The audio states: '二十三家全国品牌企业市场份额已达到百分之二十三点三一'"}
{"audio":["..\/example_data\/audio_aqa_pipeline\/test_2.wav"],"conversation":[{"from":"human","value":"Describe the sound in this audio clip."}],"answer":"The audio contains the sound of a machine turning on and off repeatedly."}
```