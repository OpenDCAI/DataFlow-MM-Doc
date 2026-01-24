---
title: Image环境安装
icon: material-symbols-light:download-rounded
createTime: 2026/01/24 15:37:37
permalink: /zh/mm_operators/install_image_understanding/
---
# 安装
DataFlow-MM 的图像相关算子依赖已包含在基础安装中。

### 基础安装

```bash
cd DataFlow-MM
conda create -n Dataflow-MM python=3.12
conda activate Dataflow-MM
pip install -e .
```

执行 `pip install -e .` 会自动安装 `requirements.txt` 中的所有依赖。

## 🎯 VLM 模型支持（推荐）

如果需要使用 VLM 模型进行图像理解（如图像描述生成、图像问答等），需要额外安装：

```bash
pip install -e ".[vllm,vqa]"
```