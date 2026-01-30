---
title: Audio Environment Setup
icon: material-symbols-light:download-rounded
createTime: 2025/06/09 10:29:31
permalink: /en/mm_guide/install_audio_understanding/
---
## Environment Setup

```bash
conda create -n DataFlow-MM python=3.12
conda activate DataFlow-MM

cd ./DataFlow-MM
pip install -e .
pip install -e ".[audio]"
```