---
title: AIGC 图像编辑
createTime: 2025/07/15 22:38:45
permalink: /zh/mm_guide/image_editing
icon: basil:lightning-alt-outline
---

# 图片编辑数据合成流水线

# 1. 概述
图片编辑数据合成流水线的核心目标是

## 支持应用场景

## 处理流程
1. 提示词生成

2. 编辑图片生成

# 2. 快速开始
## 第一步 安装环境


## 第二步 


## 第三步


# 3. 流水线逻辑


# 4. 输出数据


# 5. 运行方式
这里支持本地编辑模型以及在线编辑模型两种生成方式，同时支持多张图片作为输入的
- 本地编辑模型图片编辑流水线
  ```bash
  python /path/to/
  ```
- 在线编辑模型图片编辑流水线
  ```bash
  python /path/to/
  ```
- 多张图片输入的图片编辑流水线
  ```bash
  python /path/to/
  ```

# 6. 流水线示例



## 图片编辑
该任务和文本到图片生成基本一致，需要对模型调用、数据准备以及算子调用进行一定的微调

本地模型调用方式如下：
```python
from dataflow.serving.local_image_gen_serving import LocalImageGenServing

self.serving = LocalImageGenServing(
    image_io=ImageIO(save_path=os.path.join(self.storage.cache_path, "images")),
    hf_model_name_or_path="black-forest-labs/FLUX.1-Kontext-dev",
    hf_cache_dir="./cache_local",
    hf_local_dir="./ckpt/models/",
    Image_gen_task="imageedit",
    batch_size=4,
    diffuser_model_name="FLUX-Kontext",
    diffuser_num_inference_steps=28,
    diffuser_guidance_scale=3.5,
)
```

数据准备调整如下：
```jsonl
{"conversations": [{"content": "Change the woman's clothes to a white dress.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image1.png"], "edited_images": [""]}
{"conversations": [{"content": "Change the vase to red.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image2.png"], "edited_images": [""]}
```

生成脚本调整如下：
```python
from dataflow.operators.core_vision import PromptedImageEditGenerator

self.generator = PromptedImageEditGenerator(pipe=self.serving)

self.generator.run(
    storage=self.storage.step(),
    input_image_key="images",
    input_conversation_key="conversations",
    output_image_key="edited_images",
)
```

### 调用nano-banana
目前我们接入了使用nano-banana对图片进行编辑，参考前文的图片编辑，只要修改对应的serving即可运行nano-banana进行测试。模型调用方式如下所示：
```python
import os
from dataflow.serving.api_vlm_serving_openai import APIVLMServing_openai

os.environ['DF_API_KEY'] = args.api_key

self.serving = APIVLMServing_openai(
    api_url=api_url,
    model_name="gemini-2.5-flash-image-preview",               # try nano-banana
    image_io=ImageIO(save_path=os.path.join(self.storage.cache_path, "images")),
    send_request_stream=True,
)
```
我们所使用的api来自于[huiyun](http://123.129.219.111:3000)
