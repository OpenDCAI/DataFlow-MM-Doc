---
title: 视频描述生成
createTime: 2025/07/16 14:50:59
permalink: /zh/mm_guide/4q34ajso/
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

## 第三步: 导入必要的模块
```python
from dataflow.operators.core_vision import VideoToCaptionGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
```

## 第四步: 初始化存储对象

首先准备输入数据文件，格式如下：
```json
{"video": ["your_video_path"], "conversation": [{"from": "human", "value": ""}]}
```

然后初始化存储对象：
```python
storage = FileStorage(
    first_entry_file_name="your_data_file.json",
    cache_path="./cache",
    file_name_prefix="video_caption",
    cache_type="json",
)
```

## 第五步: 启动本地模型服务

初始化VLM服务：
```python
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
```

## 第六步: 初始化VideoToCaptionGenerator算子

```python
video_caption_generator = VideoToCaptionGenerator(
    vlm_serving=vlm_serving,
)
```

::: tip 提示
算子会使用默认的视频描述prompt："Please describe the video in detail."
如需自定义prompt，可以通过 `prompt_template` 参数传入。
:::

## 第七步: 执行算子生成视频描述

```python
video_caption_generator.run(
    storage=storage.step(),
    input_image_key="image",
    input_video_key="video",
    input_conversation_key="conversation",
    output_key="caption",
)
```

## 完整示例代码

```python
from dataflow.operators.core_vision import VideoToCaptionGenerator
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage

# 初始化存储
storage = FileStorage(
    first_entry_file_name="./sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_caption",
    cache_type="json",
)

# 初始化VLM服务
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

# 初始化算子
video_caption_generator = VideoToCaptionGenerator(
    vlm_serving=vlm_serving,
)

# 执行生成
video_caption_generator.run(
    storage=storage.step(),
    input_image_key="image",
    input_video_key="video",
    input_conversation_key="conversation",
    output_key="caption",
)
```
