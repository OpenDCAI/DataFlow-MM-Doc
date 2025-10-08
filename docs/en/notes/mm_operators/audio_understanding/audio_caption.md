---
title: 音频字幕生成
createTime: 2025/07/15 21:33:01
icon: material-symbols-light:autoplay
permalink: /en/mm_operators/2gjc47qb/
---


## 音频字幕生成

## 第一步: 准备Dataflow环境
```bash
conda create -n myvenv python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## 第二步: 安装Dataflow音频模块
```bash
pip install open-dataflow[audio]
```

## 第三步: 启动本地模型服务
本地模型调用服务方法如下:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2-Audio-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=8192,
    vllm_gpu_memory_utilization=0.7
)
```

## 第四步: 按如下格式填写音频路径, 准备需要增加音频字幕的数据
```jsonl
{"audio": ["your_audio_path"]}
```

## 第五步: 按下述格式将数据路径填入FileStorage中
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

## 第六步: 初始化CaptionGenerator算子
```python
generator = CaptionGenerator(llm_serving)
```

## 第七步: 执行算子
```python
generator.run(storage=storage.step(), output_key="caption")
```