---
title: Image Environment Installation
icon: material-symbols-light:download-rounded
createTime: 2026/01/24 15:37:37
permalink: /en/mm_operators/install_image_understanding/
---

# Installation

The dependencies for image-related operators in DataFlow-MM are already included in the base installation.

### Base Installation

```bash
cd DataFlow-MM
conda create -n Dataflow-MM python=3.12
conda activate Dataflow-MM
pip install -e .

```

Executing `pip install -e .` will automatically install all dependencies specified in `requirements.txt`.

## 🎯 VLM Model Support (Recommended)

To utilize Vision-Language Models (VLM) for image understanding tasks (such as image caption generation, visual question answering, etc.), additional components must be installed:

```bash
pip install -e ".[vllm,vqa]"

```