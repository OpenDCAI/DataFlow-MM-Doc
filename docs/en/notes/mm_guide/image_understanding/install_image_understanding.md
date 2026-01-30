---
title: Image环境安装
icon: material-symbols-light:download-rounded
createTime: 2025/06/09 10:29:31
permalink: /en/mm_guide/install_image_understanding/
---
# 安装
```bash
conda create -n Dataflow-MM python=3.12
conda activate DataFlow-MM

cd ./DataFlow-MM
pip install -e .
pip install -e ".[vllm]"
```