---
title: Image Environment Installation
icon: material-symbols-light:download-rounded
createTime: 2026/01/24 15:37:37
permalink: /en/mm_guide/install_image_understanding/
---

# Installation
```bash
conda create -n Dataflow-MM python=3.12
conda activate DataFlow-MM

cd ./DataFlow-MM
pip install -e .
pip install -e ".[vllm]"
```
