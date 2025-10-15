---
title: 图文对齐评估（VQA Score）
createTime: 2025/10/15 15:30:00
icon: material-symbols-light:quiz
permalink: /zh/mm_operators/eval/vqa_score_image_text_evaluator/
---

## 图文对齐评估（VQA Score）

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

本算子基于 BLIP VQA 对“是否匹配描述”的是/否问题进行判断，并返回 yes 概率 作为分数（范围 [0,1]）。你可以使用本地权重或 HuggingFace 上的模型名称（如`Salesforce/blip-vqa-base`）。

## 第四步: 准备 FileStorage

```python
from dataflow.utils.storage import FileStorage

storage = FileStorage(
    first_entry_file_name="data/vqa_input.jsonl",  # 至少包含 image_path 与 text 两列
    cache_path="./cache_local",
    file_name_prefix="vqa_eval",
    cache_type="jsonl"
)
```

## 第五步: 初始化 VQA 评估算子

```python
from dataflow.operators.core_vision import VQAScoreEvaluator

evaluator = VQAScoreEvaluator(
    model_name="Salesforce/blip-vqa-base",  # 可替换为你的本地路径
    device=None,       # None 自动选择 cuda/cpu
)
```

## 第六步: 执行算子
```python
evaluator.run(
    storage=storage.step(),
    image_key="image_path",  # 输入列：图片路径
    text_key="text",         # 输入列：文本描述（内部会构造Yes/No问题）
    output_key="vqa_score"   # 输出列：分数字段，范围 [0,1]，代表“yes”的概率
)
```

## 输入示例
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car."
}
```
## 输出示例

生成的 `jsonl` 文件中会新增 `vqa_score` 字段，例如：

```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car.",
  "vqa_score": 0.774
}
```
