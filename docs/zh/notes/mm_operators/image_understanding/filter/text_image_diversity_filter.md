---
title: 图文多样性过滤（TextImageDiversityFilter）
createTime: 2025/10/15 19:34:47
icon: material-symbols-light:image
permalink: /zh/mm_operators/filter/text_image_diversity_filter/
---
## 📘 概述
`TextImageDiversityFilter` 是一个**文本 + 图像联合去重**算子：  
- 文本侧使用 **TF-IDF + 余弦相似度** 检测与历史语料的最大相似度，低于阈值才视作“文本足够不同”；  
- 图像侧使用 **perceptual hash（pHash）** 并计算汉明距离，高于阈值才视作“图像足够不同”。  
仅当“文本唯一 **且** 图像唯一”同时满足时保留该样本，否则过滤。

## ```__init__```函数
```python
def __init__(
    self,
    text_thresh: float = 0.8,
    hash_size: int = 8,
    img_dist_thresh: int = 5
):
    ...
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `text_thresh` | `float` | `0.8` | 文本唯一性阈值：与最近语料（最多 `max_corpus` 条，由内部 `TextDuplicateFilter` 维护）相比的**最大余弦相似度**需 **< 该值** 才视为“文本唯一”。 |
| `hash_size` | `int` | `8` | 图像 pHash 的哈希尺寸；值越大越细致但计算/内存开销更高（由内部 `ImageDuplicateFilter` 使用）。 |
| `img_dist_thresh` | `int` | `5` | 图像唯一性阈值：与最近入库图像 pHash 的**最小汉明距离**需 **> 该值** 才视为“图像唯一”。 |



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str,
    text_key: str
):
    ...
```
执行算子主逻辑：
1. 从 `storage` 读取 DataFrame，逐行读取 `image_key` 与 `text_key`。  
2. **文本侧**：用 `TextDuplicateFilter` 计算当前文本与最近语料的 TF-IDF 余弦相似度的最大值 `max_sim`；若 `max_sim < text_thresh` → 记为“文本唯一”，并把当前文本加入语料；否则记为“重复”。  
3. **图像侧**：用 `ImageDuplicateFilter` 计算当前图像 pHash 与最近图像哈希的**最小汉明距离** `min_dist`；若 `min_dist > img_dist_thresh`（或历史为空）→ 记为“图像唯一”，并把当前图像哈希入库；否则记为“重复”。  
4. 仅当“文本唯一 **且** 图像唯一”同时为真时保留该行；否则过滤。  
5. 将保留下来的行重置索引后写回 `storage`，返回 `[image_key, text_key]`。  

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | 无 | 图片路径列名（如 `"image_path"`）。 |
| `text_key` | `str` | 无 | 文本列名（如 `"text"` / `"caption"`）。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import TextImageDiversityFilter

# 1) 准备 FileStorage（至少包含 image_path 与 text）
storage = FileStorage(
    first_entry_file_name="data/ti_diversity_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="ti_diversity",
    cache_type="jsonl"
)

# 2) 初始化算子
filt = TextImageDiversityFilter(
    text_thresh=0.8,  # 文本唯一阈值（越低越宽松）
    hash_size=8,      # pHash 尺寸
    img_dist_thresh=5 # 图像唯一阈值（越大越严格）
)

# 3) 执行过滤
cols = filt.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text"
)
print(cols)  # ["image_path", "text"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path`（或 `image_key` 指定列） | `string` | 无 | 去重后保留样本的图片路径。 |
| `text`（或 `text_key` 指定列） | `string` | 无 | 去重后保留样本的文本内容。 |



示例输入：
```jsonl
{
  "image_path": "a.jpg",
  "text": "A cat sitting on a wooden chair."
}
{
  "image_path": "a_dup.jpg",
  "text": "A cat sits on a wooden chair."  
}
{
  "image_path": "b.jpg",
  "text": "A bus driving through a snowy mountain pass at night."
}
```

示例输出：
```jsonl
{
  "image_path": "a.jpg",
  "text": "A cat sitting on a wooden chair."
}
{
  "image_path": "b.jpg",
  "text": "A bus driving through a snowy mountain pass at night."
}

```