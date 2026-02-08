---
title: Audio Environment Setup
icon: material-symbols-light:download-rounded
createTime: 2025/06/09 10:29:31
permalink: /en/mm_guide/install_audio_understanding/
---
## Environment Setup

```bash
conda create -n myvenv
conda activate myvenv

cd ./DataFlow-MM
pip install open-dataflow-mm[audio]
```

## Test Data Download
```bash
hf download --repo-type dataset OpenDCAI/dataflow-demo-audio --local-dir ./dataflow/example
```