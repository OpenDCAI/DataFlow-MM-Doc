---
title: 图像美学过滤（ImageAsetheticFilter）
createTime: 2025/10/15 15:45:04
icon: material-symbols-light:image
permalink: /zh/mm_operators/iwc11ea5/
---
## 📘 概述
`ImageAestheticFilter` 是一个**图片基础美学过滤**算子，用于快速剔除低质量图像。它基于灰度图的四项指标做判定：**清晰度**（Laplacian 方差）、**亮度**（均值）、**对比度**（标准差）以及**极端像素比例**（近黑/近白占比）。仅当四项全部达标时，样本被保留。


## ```__init__```函数
```python
def __init__(
    self,
    blur_thresh: float = 150.0,
    brightness_range: tuple[float, float] = (30, 230),
    contrast_thresh: float = 40.0,
    max_black_ratio: float = 0.90,
    max_white_ratio: float = 0.90
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `blur_thresh` | `float` | `150.0` | 清晰度阈值（Laplacian 方差）；数值越大要求越清晰。 |
| `brightness_range` | `tuple[float, float]` | `(30, 230)` | 允许的平均亮度范围（灰度 0–255）。 |
| `contrast_thresh` | `float` | `40.0` | 对比度阈值（灰度标准差）；越大要求越高。 |
| `max_black_ratio` | `float` | `0.90` | 近黑像素（<10）占比上限；超过则视为极暗/大块遮挡。 |
| `max_white_ratio` | `float` | `0.90` | 近白像素（>245）占比上限；超过则视为过曝/大面积空白。 |





## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str
):
    ...
```
执行算子主逻辑：从 `storage` 读取数据表，对 `image_key` 指定列逐行进行清晰度/亮度/对比度/极端像素比例四项检测；新增布尔列 `quality`，仅保留 `quality == True` 的样本并写回存储。
参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | 无 | 图片路径列名（如 `"image_path"`）。 |





## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ImageAestheticFilter

# 1) 准备 FileStorage（至少包含 image_path 列）
storage = FileStorage(
    first_entry_file_name="data/aesthetic_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="img_aesthetic",
    cache_type="jsonl"
)

# 2) 初始化算子（可按需调整阈值）
flt = ImageAestheticFilter(
    blur_thresh=150.0,
    brightness_range=(30, 230),
    contrast_thresh=40.0,
    max_black_ratio=0.90,
    max_white_ratio=0.90
)

# 3) 执行过滤
cols = flt.run(
    storage=storage.step(),
    image_key="image_path"
)
print(cols)  # ["image_path"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path` | `string` | 无 | 过滤后保留样本的图片路径。 |
| `quality` | `bool` | `True` | 质量判定结果；输出中仅保留 `quality=True` 的样本行（其余行被剔除）。 |



示例输入：
```jsonl
{
  "image_path": "1.png"
}
{
  "image_path": "2.jpg"
}
```

示例输出：
```jsonl
{
  "image_path": "1.png",
  "quality": true
}
```