---
title: 视频OCR过滤（VideoOCRFilter）
createTime: 2025/01/20 10:00:00
permalink: /zh/mm_operators/video_understanding/filter/video_ocr_filter/
---

## 📘 概述

`VideoOCRFilter` 是一个基于**OCR文本面积比例**的视频过滤算子。它直接对整个视频进行OCR检测和过滤，无需预先切分片段：
1. 从视频中采样若干帧
2. 使用 PaddleOCR 检测文本区域
3. 计算文本面积占比（OCR score）
4. 根据阈值（`ocr_min`、`ocr_max`）判断是否通过过滤
5. 输出包含 `ocr_score` 和 `filtered` 字段的结果

适用于过滤包含过多文字（如字幕、水印）或需要包含文字的视频。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    input_video_key: str = "video",
    load_num: int = 3,
    batch_size: int = 8,
    num_workers: int = 4,
    gpu_num: int = 0,
    output_key: str = "video_ocr",
    det_model_dir: str = None,
    rec_model_dir: str = None,
    ocr_min: Optional[float] = None,
    ocr_max: Optional[float] = None
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名                 | 类型               | 默认值             | 说明                                    |
| :------------------- | :---------------- | :-------------- | :------------------------------------ |
| `input_video_key`    | `str`             | `"video"`       | 输入数据中视频路径字段名                          |
| `load_num`           | `int`             | `3`             | 从视频中采样的帧数                             |
| `batch_size`         | `int`             | `8`             | 处理批次大小                                |
| `num_workers`        | `int`             | `4`             | 数据加载的 worker 进程数                       |
| `gpu_num`            | `int`             | `0`             | GPU ID（0+ 表示使用GPU，-1 表示使用CPU）         |
| `output_key`         | `str`             | `"video_ocr"`   | 输出字段名                                 |
| `det_model_dir`      | `str`             | `None`          | PaddleOCR 检测模型目录路径                    |
| `rec_model_dir`      | `str`             | `None`          | PaddleOCR 识别模型目录路径                    |
| `ocr_min`            | `Optional[float]` | `None`          | 最小OCR分数阈值（0-1），低于此值的视频将被标记为 `filtered=False` |
| `ocr_max`            | `Optional[float]` | `None`          | 最大OCR分数阈值（0-1），高于此值的视频将被标记为 `filtered=False` |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    input_video_key: Optional[str] = None,
    video_clips_key: Optional[str] = None,
    load_num: Optional[int] = None,
    batch_size: Optional[int] = None,
    num_workers: Optional[int] = None,
    output_key: Optional[str] = None,
    ocr_min: Optional[float] = None,
    ocr_max: Optional[float] = None
) -> None:
    ...
```

执行算子主逻辑：从 storage 读取数据表，对每个视频采样帧并进行OCR检测，根据阈值过滤，并写回存储。

## 🧾 `run` 参数说明

| 参数名                 | 类型                | 默认值    | 说明                          |
| :------------------- | :---------------- | :----- | :--------------------------- |
| `storage`            | `DataFlowStorage` | -      | Dataflow 数据存储对象              |
| `input_video_key`    | `Optional[str]`   | `None` | 视频路径字段名（覆盖初始化参数）           |
| `video_clips_key`    | `Optional[str]`   | `None` | 视频片段字段名（应设为 `None` 表示整体视频模式）|
| `load_num`           | `Optional[int]`   | `None` | 采样帧数（覆盖初始化参数）              |
| `batch_size`         | `Optional[int]`   | `None` | 批次大小（覆盖初始化参数）              |
| `num_workers`        | `Optional[int]`   | `None` | worker 数量（覆盖初始化参数）         |
| `output_key`         | `Optional[str]`   | `None` | 输出字段名（覆盖初始化参数）             |
| `ocr_min`            | `Optional[float]` | `None` | 最小OCR分数阈值（覆盖初始化参数）         |
| `ocr_max`            | `Optional[float]` | `None` | 最大OCR分数阈值（覆盖初始化参数）         |

---

## 🧠 示例用法

::: tip 完整示例代码
完整的流水线示例代码位于：`playground/video_ocr_filter_pipeline.py`

在使用 `dataflowmm init` 初始化后，你可以在该路径下找到完整的可运行示例。
:::

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import VideoOCRFilter

# Step 1: 准备 FileStorage（至少包含 video 列）
storage = FileStorage(
    first_entry_file_name="data/video_ocr_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="video_ocr_filter",
    cache_type="jsonl"
)

# Step 2: 初始化算子
filter_op = VideoOCRFilter(
    output_key="video_ocr",
    load_num=3,  # 从视频中采样 3 帧
    batch_size=8,
    num_workers=2,
    det_model_dir="/path/to/PP-OCRv5_server_det",
    rec_model_dir="/path/to/PP-OCRv5_server_rec",
    ocr_min=None,  # 不设置最小阈值
    ocr_max=0.3    # 最大OCR分数阈值，过滤文字过多的视频
)

# Step 3: 执行过滤
filter_op.run(
    storage=storage.step(),
    input_video_key="video",
    video_clips_key=None,  # None 表示整体视频模式
    output_key="video_ocr"
)
```

---

## 🧾 输出格式

**新增字段：**
- `video_ocr` (dict): OCR检测信息字典

**字典字段：**

| 字段          | 类型      | 说明                                   |
| :---------- | :------ | :----------------------------------- |
| `ocr_score` | `float` | OCR文本面积占比（0-1）                       |
| `filtered`  | `bool`  | 是否通过过滤（仅当设置了 `ocr_min` 或 `ocr_max` 时出现）|

示例输入：

```jsonl
{"video": "./test/video1.mp4"}
{"video": "./test/video2.mp4"}
```

示例输出（设置了 `ocr_max=0.3`）：

```jsonl
{"video": "./test/video1.mp4", "video_ocr": {"ocr_score": 0.15, "filtered": true}}
{"video": "./test/video2.mp4", "video_ocr": {"ocr_score": 0.45, "filtered": false}}
```

---

## 💡 使用建议

1. **过滤字幕视频**: 设置 `ocr_max=0.3`，过滤掉字幕占比过高的视频
2. **过滤水印视频**: 设置较小的 `ocr_max` 值，过滤包含大量文字水印的视频
3. **保留文字内容**: 设置 `ocr_min` 值，保留包含一定文字内容的视频（如教学视频）
4. **采样帧数**: `load_num=3` 通常足够，可根据视频长度调整
5. **模型选择**: 推荐使用 PP-OCRv5 server 模型以获得更好的检测效果

---

## 🔗 相关链接

- **代码:** [VideoOCRFilter](https://github.com/OpenDCAI/DataFlow-MM/blob/main/dataflow/operators/core_vision/filter/video_ocr_filter.py)
- **相关算子:** [VideoOCREvaluator](/zh/mm_operators/video_understanding/eval/video_ocr_evaluator/)
- **PaddleOCR:** [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)
