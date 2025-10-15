---
title: 长文本图文对齐评估（LongCLIP）
createTime: 2025/10/15 15:30:00
icon: material-symbols-light:quiz
permalink: /zh/mm_operators/eval/longclip_image_text_evaluator/
---

## 图文对齐评估（LongCLIP）

## 第一步: 准备 Dataflow 环境
```bash
conda create -n myvenv python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
````

## 第二步: 安装 Dataflow 图像模块

```bash
pip install open-dataflow[image]
```

## 第三步: 准备权重

本算子基于 LongCLIP 计算图像与长文本描述的对齐分数（范围 [0,1]）。请准备 LongCLIP 权重文件（例如 `LongCLIP-L-336px/longclip-L@336px.pt`）

## 第四步: 准备 FileStorage

```python
from dataflow.utils.storage import FileStorage

storage = FileStorage(
    first_entry_file_name="data/longclip_input.jsonl",  # 至少包含 image_path 与 text 两列（text 支持较长段落）
    cache_path="./cache_local",
    file_name_prefix="longclip_eval",
    cache_type="jsonl"
)
```

## 第五步: 初始化 LongCLIP 评估算子

```python
from dataflow.operators.core_vision import LongCLIPEvaluator

evaluator = LongCLIPEvaluator(
    ckpt_path="LongCLIP-L-336px/longclip-L@336px.pt",  # 替换为你的本地权重路径
    device=None  # None 时自动选择 "cuda"（若可用）否则 "cpu"
)
```

## 第六步: 执行算子

```python
evaluator.run(
    storage=storage.step(),
    image_key="image_path",     # 输入列：图片路径
    text_key="text",            # 输入列：文本描述（支持更长文本；内部会安全截断/分词）
    output_key="longclip_score" # 输出列：分数字段，范围 [0,1]
)
```

## 输入示例
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car. The man is wearing a black tuxedo with a white bow tie and has a wristwatch on his left wrist. He has light-colored hair and is pointing upwards with his right hand. The woman, who is seated next to him, is wearing a white bridal dress with a veil and has her hair styled in an updo. She is smiling and looking towards the man. The interior of the car is visible, with the ceiling and part of the window frame showing."
}
```
## 输出示例

生成的 `jsonl` 文件中会新增 `longclip_score` 字段，例如：

```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car. The man is wearing a black tuxedo with a white bow tie and has a wristwatch on his left wrist. He has light-colored hair and is pointing upwards with his right hand. The woman, who is seated next to him, is wearing a white bridal dress with a veil and has her hair styled in an updo. She is smiling and looking towards the man. The interior of the car is visible, with the ceiling and part of the window frame showing.",
  "longclip_score": 0.624
}
```
