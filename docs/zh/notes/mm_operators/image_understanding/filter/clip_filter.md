---
title: 相似度过滤（ClipFilter）
createTime: 2025/10/15 15:48:32
icon: material-symbols-light:image
permalink: /zh/mm_operators/vmea8ovk/
---
## 📘 概述
`ClipFilter` 是一个基于 **CLIP 相似度** 的图文一致性过滤算子。对每条样本计算图片与文本的归一化嵌入余弦相似度（映射到 `[0,1]` 范围内），当相似度 **≥ 阈值**（`threshold`）时保留该样本，否则过滤掉。


## ```__init__```函数
```python
def __init__(
    self,
    model_name: str = "../ckpt/clip-vit-base-patch32",
    device: str = None
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_name` | `str` | `"../ckpt/clip-vit-base-patch32"` | CLIP 模型本地路径或 Hugging Face Model ID。内部以 `CLIPProcessor` / `CLIPModel` 加载（`use_safetensors=True`, `weights_only=False`）。 |
| `device` | `str \| None` | `None` | 推理设备；`None` 时自动选择可用的 `"cuda"`，否则回退到 `"cpu"`。 |





## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str = "image",
    caption_key: str = "caption",
    threshold: float = 0.25
):
    ...
```
执行算子主逻辑：从 storage 读取数据表，按行计算 CLIP 图文相似度，仅保留相似度 ≥ threshold 的样本行，并写回存储。
参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | `"image"` | 图片路径列名。 |
| `caption_key` | `str` | `"caption"` | 文本描述列名。 |
| `threshold` | `float` | `0.25` | 图文相似度阈值；样本相似度 **<** 该值将被过滤。 |




## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import ClipFilter

# 1) 准备 FileStorage（至少包含 image 与 caption 列）
storage = FileStorage(
    first_entry_file_name="data/clip_filter_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="clip_filter",
    cache_type="jsonl"
)

# 2) 初始化算子（可用本地或HF模型）
flt = ClipFilter(
    model_name="../ckpt/clip-vit-base-patch32",  # 或 "openai/clip-vit-base-patch32"
    device=None                                  # 自动选择cuda/cpu
)

# 3) 执行过滤（将只保留相似度≥0.25的样本）
cols = flt.run(
    storage=storage.step(),
    image_key="image",
    caption_key="caption",
    threshold=0.25
)
print(cols)  # ["image", "caption"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image` | `string` | 无 | 过滤后保留样本的图片路径。 |
| `caption` | `string` | 无 | 过滤后保留样本的文本描述（图文相似度 ≥ `threshold`）。 |


示例输入：
```jsonl
{
  "image": "1.png",
  "caption": "A bride and groom smiling in a car."
}
{
  "image": "2.jpg",
  "caption": "A red bus driving across a snowy mountain road at night."
}
```

示例输出：
```jsonl
{
  "image": "1.png",
  "caption": "A bride and groom smiling in a car."
}
```