---
title: 敏感内容过滤（SensitiveFilter）
createTime: 2025/10/15 15:30:00
icon: material-symbols-light:quiz
permalink: /zh/mm_operators/filter/sensitive_filter/
---

## 敏感内容过滤（SensitiveFilter）

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

本算子使用 **Hugging Face** 的公开模型进行图像与文本敏感内容检测。你可以直接下载下面的 **Model ID**：

- 图像（NSFW / 不当内容）检测（任选其一）  
  - `Falconsai/nsfw_image_detection`  
  - `laion/CLIP-based-NSFW-Detector`

- 文本（毒性/仇恨/不当言论）分类（任选其一）  
  - `unitary/toxic-bert`  
  - `SkolkovoInstitute/roberta_toxicity_classifier`

## 第四步: 准备 FileStorage

```python
from dataflow.utils.storage import FileStorage

storage = FileStorage(
    first_entry_file_name="data/sensitive_input.jsonl",  # 至少包含 image 与若干文本列
    cache_path="./cache_local",
    file_name_prefix="sensitive_filter",
    cache_type="jsonl"
)
```

## 第五步: 初始化SensitiveFilter算子

```python
from dataflow.operators.core_vision import SensitiveFilter

filt = SensitiveFilter(
    img_model_name="/data0/happykeyan/workspace/ckpt/nsfw_image_detection",  # 图像敏感检测模型
    txt_model_name="/data0/happykeyan/workspace/ckpt/toxic-bert",            # 文本敏感检测模型
    img_thresh=0.5,   # 图像敏感阈值（≥阈值且命中敏感标签则判为不安全）
    txt_thresh=0.5    # 文本敏感阈值（同上）
)
```

## 第六步: 执行算子

```python
output_cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    text_keys=["text"]   # 多列示例: ["caption", "question", "answer"]
)
```

## 输入示例
```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
{
  "image_path": "2.jpg",
  "text": "Some abusive or hateful phrase here."
}
```
## 输出示例

生成的 `jsonl` 文件中去除被过滤掉的样本：

```jsonl
{
  "image_path": "1.png",
  "text": "A bride and groom smiling in a car."
}
```
