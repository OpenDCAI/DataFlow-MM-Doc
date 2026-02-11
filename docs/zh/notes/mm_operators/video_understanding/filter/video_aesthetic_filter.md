---
title: 视频美学过滤（VideoAestheticFilter）
createTime: 2025/01/20 10:00:00
permalink: /zh/mm_operators/video_understanding/filter/video_aesthetic_filter/
---

## 📘 概述

`VideoAestheticFilter` 是一个基于**美学分数**的视频过滤算子。它直接对整个视频进行美学评分和过滤，无需预先切分片段：
1. 从视频中采样若干帧
2. 使用 CLIP 模型和 MLP 模型计算美学分数
3. 根据最小美学分数阈值（`aes_min`）判断是否通过过滤
4. 输出包含 `aesthetic_score` 和 `filtered` 字段的结果

适用于初步筛选视频质量，快速过滤低质量视频。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    input_video_key: str = "video",
    clip_model: str = "ViT-L/14",
    mlp_checkpoint: Optional[str] = None,
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    output_key: str = "video_aesthetic",
    aes_min: Optional[float] = None
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名                 | 类型               | 默认值                  | 说明                                    |
| :------------------- | :---------------- | :------------------- | :------------------------------------ |
| `input_video_key`    | `str`             | `"video"`            | 输入数据中视频路径字段名                          |
| `clip_model`         | `str`             | `"ViT-L/14"`         | CLIP 模型名称或路径                          |
| `mlp_checkpoint`     | `Optional[str]`   | `None`               | MLP 检查点路径，用于美学预测                      |
| `load_num`           | `int`             | `3`                  | 从视频中采样的帧数                             |
| `batch_size`         | `int`             | `64`                 | 处理批次大小                                |
| `num_workers`        | `int`             | `4`                  | 数据加载的 worker 进程数                       |
| `output_key`         | `str`             | `"video_aesthetic"`  | 输出字段名                                 |
| `aes_min`            | `Optional[float]` | `None`               | 最小美学分数阈值，低于此值的视频将被标记为 `filtered=False` |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    clip_model: Optional[str] = None,
    mlp_checkpoint: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    aes_min: Optional[float] = None
) -> None:
    ...
```

执行算子主逻辑：从 storage 读取数据表，对每个视频采样帧并计算美学分数，根据阈值过滤，并写回存储。

## 🧾 `run` 参数说明

| 参数名                 | 类型                | 默认值    | 说明                          |
| :------------------- | :---------------- | :----- | :--------------------------- |
| `storage`            | `DataFlowStorage` | -      | Dataflow 数据存储对象              |
| `input_video_key`    | `Optional[str]`   | `None` | 视频路径字段名（覆盖初始化参数）           |
| `clip_model`         | `Optional[str]`   | `None` | CLIP 模型路径（覆盖初始化参数）         |
| `mlp_checkpoint`     | `Optional[str]`   | `None` | MLP 检查点路径（覆盖初始化参数）         |
| `load_num`           | `Optional[int]`   | `None` | 采样帧数（覆盖初始化参数）              |
| `batch_size`         | `Optional[int]`   | `None` | 批次大小（覆盖初始化参数）              |
| `num_workers`        | `Optional[int]`   | `None` | worker 数量（覆盖初始化参数）         |
| `output_key`         | `Optional[str]`   | `None` | 输出字段名（覆盖初始化参数）             |
| `aes_min`            | `Optional[float]` | `None` | 最小美学分数阈值（覆盖初始化参数）          |

---

## 🧠 示例用法

::: tip 完整示例代码
完整的流水线示例代码位于：`playground/video_aesthetic_filter_pipeline.py`

在使用 `dataflowmm init` 初始化后，你可以在该路径下找到完整的可运行示例。
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoAestheticFilter

# Step 1: 准备 FileStorage（至少包含 video 列）
storage = FileStorage(
    first_entry_file_name="data/video_aesthetic_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_aesthetic_filter",
    cache_type="jsonl"
)

# Step 2: 初始化算子
filter_op = VideoAestheticFilter(
    output_key="video_aesthetic",
    load_num=3,  # 从视频中采样 3 帧
    batch_size=16,
    num_workers=2,
    clip_model="ViT-L/14",
    mlp_checkpoint="/path/to/sac+logos+ava1-l14-linearMSE.pth",
    aes_min=4.0  # 最小美学分数阈值
)

# Step 3: 执行过滤
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    output_key="video_aesthetic"
)
```

---

## 🧾 输出格式

**新增字段：**
- `video_aesthetic` (dict): 美学评分信息字典

**字典字段：**

| 字段                 | 类型      | 说明                                   |
| :----------------- | :------ | :----------------------------------- |
| `aesthetic_score`  | `float` | 视频美学分数                               |
| `filtered`         | `bool`  | 是否通过过滤（仅当设置了 `aes_min` 时出现）          |

示例输入：

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

示例输出（设置了 `aes_min=4.0`）：

```jsonl
{"video": "./test/video1.mp4", "video_aesthetic": {"aesthetic_score": 5.2, "filtered": true}}
{"video": "./test/video2.mp4", "video_aesthetic": {"aesthetic_score": 3.5, "filtered": false}}
```

---

## 🔗 相关链接

- **代码:** [VideoAestheticFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_aesthetic_filter.py)
- **相关算子:** [VideoAestheticEvaluator](/zh/mm_operators/video_understanding/eval/video_aesthetic_evaluator/)

