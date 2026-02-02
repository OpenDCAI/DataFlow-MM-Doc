---
title: 视频亮度过滤（VideoLuminanceFilter）
createTime: 2025/01/20 10:00:00
permalink: /zh/mm_operators/video_understanding/filter/video_luminance_filter/
---

## 📘 概述

`VideoLuminanceFilter` 是一个基于**亮度统计**的视频过滤算子。它直接对整个视频进行亮度分析和过滤，无需预先切分片段：
1. 从视频中采样若干帧
2. 计算亮度统计信息（平均值、最小值、最大值）
3. 根据亮度阈值（`lum_min`、`lum_max`）判断是否通过过滤
4. 输出包含 `luminance_mean`、`luminance_min`、`luminance_max` 和 `filtered` 字段的结果

适用于过滤过暗或过亮的视频，确保视频具有适当的亮度范围。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    input_video_key: str = "video",
    load_num: int = 3,
    batch_size: int = 64,
    num_workers: int = 4,
    output_key: str = "video_luminance",
    lum_min: Optional[float] = None,
    lum_max: Optional[float] = None
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名                 | 类型               | 默认值                   | 说明                                    |
| :------------------- | :---------------- | :-------------------- | :------------------------------------ |
| `input_video_key`    | `str`             | `"video"`             | 输入数据中视频路径字段名                          |
| `load_num`           | `int`             | `3`                   | 从视频中采样的帧数                             |
| `batch_size`         | `int`             | `64`                  | 处理批次大小                                |
| `num_workers`        | `int`             | `4`                   | 数据加载的 worker 进程数                       |
| `output_key`         | `str`             | `"video_luminance"`   | 输出字段名                                 |
| `lum_min`            | `Optional[float]` | `None`                | 最小亮度阈值（0-255），低于此值的视频将被标记为 `filtered=False` |
| `lum_max`            | `Optional[float]` | `None`                | 最大亮度阈值（0-255），高于此值的视频将被标记为 `filtered=False` |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    lum_min: Optional[float] = None,
    lum_max: Optional[float] = None
) -> None:
    ...
```

执行算子主逻辑：从 storage 读取数据表，对每个视频采样帧并计算亮度统计，根据阈值过滤，并写回存储。

## 🧾 `run` 参数说明

| 参数名                 | 类型                | 默认值    | 说明                          |
| :------------------- | :---------------- | :----- | :--------------------------- |
| `storage`            | `DataFlowStorage` | -      | Dataflow 数据存储对象              |
| `input_video_key`    | `Optional[str]`   | `None` | 视频路径字段名（覆盖初始化参数）           |
| `load_num`           | `Optional[int]`   | `None` | 采样帧数（覆盖初始化参数）              |
| `batch_size`         | `Optional[int]`   | `None` | 批次大小（覆盖初始化参数）              |
| `num_workers`        | `Optional[int]`   | `None` | worker 数量（覆盖初始化参数）         |
| `output_key`         | `Optional[str]`   | `None` | 输出字段名（覆盖初始化参数）             |
| `lum_min`            | `Optional[float]` | `None` | 最小亮度阈值（覆盖初始化参数）            |
| `lum_max`            | `Optional[float]` | `None` | 最大亮度阈值（覆盖初始化参数）            |

---

## 🧠 示例用法

::: tip 完整示例代码
完整的流水线示例代码位于：`playground/video_luminance_filter_pipeline.py`

在使用 `dataflowmm init` 初始化后，你可以在该路径下找到完整的可运行示例。
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoLuminanceFilter

# Step 1: 准备 FileStorage（至少包含 video 列）
storage = FileStorage(
    first_entry_file_name="data/video_luminance_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_luminance_filter",
    cache_type="jsonl"
)

# Step 2: 初始化算子
filter_op = VideoLuminanceFilter(
    output_key="video_luminance",
    load_num=3,  # 从视频中采样 3 帧
    batch_size=16,
    num_workers=2,
    lum_min=20,  # 最小亮度阈值
    lum_max=140  # 最大亮度阈值
)

# Step 3: 执行过滤
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    output_key="video_luminance"
)
```

---

## 🧾 输出格式

**新增字段：**
- `video_luminance` (dict): 亮度统计信息字典

**字典字段：**

| 字段                 | 类型      | 说明                                   |
| :----------------- | :------ | :----------------------------------- |
| `luminance_mean`   | `float` | 平均亮度（0-255）                          |
| `luminance_min`    | `float` | 最小亮度（0-255）                          |
| `luminance_max`    | `float` | 最大亮度（0-255）                          |
| `filtered`         | `bool`  | 是否通过过滤（仅当设置了 `lum_min` 或 `lum_max` 时出现）|

示例输入：

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

示例输出（设置了 `lum_min=20`, `lum_max=140`）：

```jsonl
{"video": "./test/video1.mp4", "video_luminance": {"luminance_mean": 80.5, "luminance_min": 15.2, "luminance_max": 180.3, "filtered": true}}
{"video": "./test/video2.mp4", "video_luminance": {"luminance_mean": 10.2, "luminance_min": 5.1, "luminance_max": 25.8, "filtered": false}}
```

---

## 🔗 相关链接

- **代码:** [VideoLuminanceFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_luminance_filter.py)
- **相关算子:** [VideoLuminanceEvaluator](/zh/mm_operators/video_understanding/eval/video_luminance_evaluator/)
