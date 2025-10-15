---
title: 图片基础美学过滤（ImageAestheticFilter）
createTime: 2025/10/15 15:30:00
icon: material-symbols-light:quiz
permalink: /zh/mm_operators/filter/image_aesthetic_filter/
---

## 图片基础美学过滤（ImageAestheticFilter）

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

本算子对图片进行清晰度、亮度、对比度、极端像素比例四项基础质量筛查，不需要额外权重。

## 第四步: 准备 FileStorage

```python
from dataflow.utils.storage import FileStorage

storage = FileStorage(
    first_entry_file_name="data/aesthetic_input.jsonl",  # 至少包含 image_path 列
    cache_path="./cache_local",
    file_name_prefix="img_aesthetic",
    cache_type="jsonl"
)
```

## 第五步: 初始化ImageAestheticFilter算子

```python
from dataflow.operators.core_vision import ImageAestheticFilter

flt = ImageAestheticFilter(
    blur_thresh=150.0,
    brightness_range=(30, 230),
    contrast_thresh=40.0,
    max_black_ratio=0.90,
    max_white_ratio=0.90
)
```

## 第六步: 执行算子

```python
output_cols = flt.run(
    storage=storage.step(),
    image_key="image_path"
)
```

## 输入示例
```jsonl
{
  "image_path": "1.png"
}
{
  "image_path": "2.jpg"
}
```
## 输出示例

生成的 `jsonl` 文件中去除被过滤掉的样本：

```jsonl
{
  "image_path": "1.png",
  "quality": true
}
```
