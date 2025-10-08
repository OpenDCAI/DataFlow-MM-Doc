---
title: 视频描述生成
createTime: 2025/07/16 14:50:59
permalink: /zh/mm_operators/4q34ajso/
icon: material-symbols-light:interpreter-mode
---

# 快速开始

## 第一步: 准备Dataflow环境
```bash
conda create -n dataflow-mm python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## 第二步：安装Dataflow视频模块
```bash
pip install open-dataflow[video]
```

## 第三步: 启动本地模型服务

本地模型调用服务方法如下:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=None,
    vllm_gpu_memory_utilization=0.7
)
```

## 第四步: 按如下格式填写视频路径

```jsonl
{"video": ["your_video_path"]}
```

## 第五步: 按下述格式将数据路径填入FileStorage中
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

## 第六步: 初始化VideoGenerator算子，并设定Prompt
```python
from dataflow.prompts.VideoCaptionPromptGenerator import VideoCaptionPromptGenerator
captionGenerator = VideoGenerator(
    llm_serving, VideoCaptionPromptGenerator()
)
```

## 第七步: 执行算子
```python
captionGenerator.run(storage=storage.step(), output_key="caption")
```
