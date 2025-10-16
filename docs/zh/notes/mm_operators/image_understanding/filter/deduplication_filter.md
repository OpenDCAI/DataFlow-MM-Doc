---
title: 图片相似度过滤（DuplicateFilter）
createTime: 2025/10/15 19:24:01
icon: material-symbols-light:image
permalink: /zh/mm_operators/jr4r1iek/
---
## 📘 概述
`DeduplicateFilter` 是一个**基于 CLIP 图像嵌入相似度**的去重过滤算子。它为数据集中每张图片提取 CLIP 向量，计算两两余弦相似度，凡是相似度**≥ `threshold`** 的图片对，保留**第一张**、移除**后出现**的重复项。同时会在输出中给出每张保留图片的**最大相似度分数**（列名为 `output_score_key`，默认 `max_similarity`），以便后续审计。

## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "openai/clip-vit-base-patch32",
    threshold: float = 0.90,
    batch_size: int = 32,
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"openai/clip-vit-base-patch32"` | 用于提取图像嵌入的 CLIP 模型（HF Model ID 或本地路径）。 |
| `threshold` | `float` | `0.90` | 去重判定阈值；两图余弦相似度 **≥** 该值即视为重复，保留先出现的一张、移除后者。 |
| `batch_size` | `int` | `32` | CLIP 推理批大小；越大吞吐越高，显存占用也越高。 |
| `device` | `str` | `"cuda"`（可用时）否则 `"cpu"` | 模型推理设备。 |




## `run`函数
```python
def run(
    self, 
    storage: DataFlowStorage,
    input_image_key: str = "image",
    output_score_key: str = "max_similarity"
) -> None:
    ...
```
执行算子主逻辑：
1. 从 `storage` 读取 DataFrame，提取 `input_image_key` 列为待处理图片序列。  
2. **批处理提取嵌入**：使用 CLIP 对有效图片生成向量，并进行 L2 归一化，拼接为矩阵 `E`。  
3. **相似度计算**：计算 `cosine_similarity(E, E)` 获得两两相似度矩阵。  
4. **重复判定**：遍历所有 `i < j` 且相似度 **≥ `threshold`** 的索引对 `(i, j)`，将 `j` 标记为重复项（移除），`i` 为保留项。  
5. **审计分数**：计算每个样本与其它样本的**最大相似度**，写入列 `output_score_key`（默认 `max_similarity`）。  
6. **写回结果**：仅保留“非重复”的样本行并写回 `storage`；释放模型资源（`del self.model`）。  

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `input_image_key` | `str` | `"image"` | 输入图片列名；元素可为路径或可被 `_load_image` 解析的对象。 |
| `output_score_key` | `str` | `"max_similarity"` | 输出中记录“该图片与其它图片的最大相似度”的列名。 |



## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import DeduplicateFilter

# 1) 准备 FileStorage（至少包含 image 列）
storage = FileStorage(
    first_entry_file_name="data/dedup_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="image_dedup",
    cache_type="jsonl"
)

# 2) 初始化算子
dedup = DeduplicateFilter(
    model_name="openai/clip-vit-base-patch32",
    threshold=0.90,
    batch_size=32,
    device="cuda"  # 或 "cpu"
)

# 3) 执行去重
dedup.run(
    storage=storage.step(),
    input_image_key="image",           # 图片列
    output_score_key="max_similarity"  # 最大相似度列
)
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image`（或 `input_image_key` 指定列） | `string/any` | 无 | 去重后保留样本的图片字段。 |
| `max_similarity`（或 `output_score_key`） | `float` | 无 | 该样本与其它样本的最大相似度（用于审计；被判定为重复的行不在输出中）。 |


示例输入：
```jsonl
{
  "image": "a.jpg"
}
{
  "image": "b.jpg"
}
{
  "image": "a_copy.jpg"
}

```

示例输出：
```jsonl
{
  "image": "a.jpg",
  "max_similarity": 0.96
}
{
  "image": "b.jpg",
  "max_similarity": 0.12
}
```