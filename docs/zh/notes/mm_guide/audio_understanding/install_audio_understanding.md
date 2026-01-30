---
title: Audio环境安装
icon: material-symbols-light:download-rounded
createTime: 2025/06/09 10:29:31
permalink: /zh/mm_guide/install_audio_understanding/
---
## 环境安装

```bash
conda create -n DataFlow-MM python=3.12
conda activate DataFlow-MM

cd ./DataFlow-MM
pip install -e .
pip install -e ".[audio]"
```