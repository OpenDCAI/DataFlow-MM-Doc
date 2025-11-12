---
title: 图片字幕生成
createTime: 2025/10/15 15:00:00
icon: material-symbols-light:image
permalink: /zh/mm_operators/generate/image_caption/
---

## 📘 概述

`ImageCaptionGenerate` 是一个用于**调用视觉语言大模型自动生成图片描述（Caption）**的算子。  
它会根据输入图像，自动构建提示词，引导模型输出高质量的场景或目标描述，适用于多模态标注、数据集构建、图文匹配等场景。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    llm_serving: LLMServingABC
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名           | 类型              | 默认值 | 说明                     |
| :------------ | :-------------- | :-- | :--------------------- |
| `llm_serving` | `LLMServingABC` | -   | 模型服务对象，用于调用 VLM 生成图像字幕 |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    multi_modal_key: str = "image",
    output_key: str = "caption"
):
    ...
```

`run` 是算子主逻辑，执行字幕生成任务：
读取图片路径 → 构建提示词 → 调用模型 → 生成文本描述 → 写入输出文件。

## 🧾 `run` 参数说明

| 参数名               | 类型                | 默认值         | 说明              |
| :---------------- | :---------------- | :---------- | :-------------- |
| `storage`         | `DataFlowStorage` | -           | Dataflow 数据存储对象 |
| `multi_modal_key` | `str`             | `"image"`   | 多模态输入字段名        |
| `output_key`      | `str`             | `"caption"` | 模型输出字段名         |

---

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving.local_model_vlm_serving import LocalModelVLMServing_vllm
from dataflow.operators.core_vision import ImageCaptionGenerate

# Step 1: 启动本地模型服务
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="./models/Qwen2.5-VL-3B-Instruct",
    vllm_tensor_parallel_size=1,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512
)

# Step 2: 准备输入数据
storage = FileStorage(
    first_entry_file_name="data/example_caption.jsonl",
    cache_path="./cache_local",
    file_name_prefix="caption",
    cache_type="jsonl",
    media_key="image",
    media_type="image"
)
storage.step()

# Step 3: 初始化并运行算子
generator = ImageCaptionGenerate(serving)
generator.run(
    storage=storage,
    multi_modal_key="image",
    output_key="caption"
)
```

---

## 🧾 默认输出格式（Output Format）

| 字段        | 类型          | 说明          |
| :-------- | :---------- | :---------- |
| `image`   | `List[str]` | 输入图像路径      |
| `caption` | `str`       | 模型生成的图像字幕文本 |

---

### 📥 示例输入

```jsonl
{"image": ["./test/example1.jpg"]}
{"image": ["./test/example2.jpg"]}
```

### 📤 示例输出

```jsonl
{"image": ["./test/example1.jpg"], "caption": "A young woman is standing on a city street and smiling."}
{"image": ["./test/example2.jpg"], "caption": "A cat is lying on the windowsill, with blue sky and white clouds outside."}
```