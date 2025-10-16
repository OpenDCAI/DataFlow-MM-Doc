---
title: LongClip分数评估
createTime: 2025/10/15 14:30:52
icon: material-symbols-light:image
permalink: /zh/mm_operators/eval/longclip_image_text_evaluator/
---
## 📘 概述
`LongCLIPEvaluator` 使用 **LongCLIP** 计算图像与**长文本**的对齐分数，分数范围为 `[0,1]`。相较于标准 CLIP，LongCLIP 支持更长的文本上下文（本实现默认 `context_length=248`），适合段落级描述的匹配评估。



## ```__init__```函数
```python
def __init__(
    self,
    ckpt_path: str = "/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/LongCLIP-L-336px/longclip-L@336px.pt",
    device: str = None,
):
    ...
```

## `init`参数说明
## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `ckpt_path` | `str` | `"/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/LongCLIP-L-336px/longclip-L@336px.pt"` | LongCLIP 权重路径；通过 `longclip.load(ckpt_path, device=...)` 加载模型与预处理。 |
| `device` | `str \| None` | `None` | 推理设备；`None` 时自动选择可用的 `"cuda"`，否则使用 `"cpu"`。 ||



## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    image_key: str = "image_path",
    text_key: str = "text",
    output_key: str = "longclip_score"
):
    ...
```
执行算子主逻辑
1. 从 `storage` 读取 DataFrame，逐行读取 `image_key` 与 `text_key`。  
2. 使用 `self.preprocess` 将图像转为张量 `img_t`；使用 `_tokenize_safe` 对长文本进行安全分词与截断（优先 `context_length=248`，失败则回退）。  
3. 分别前向 `model.encode_image(img_t)` 与 `model.encode_text(txt_t)` 得到图像/文本特征。  
4. 对两个特征做 L2 归一化并计算点积余弦相似度 `cos`，映射为分数 `score = (cos + 1) / 2`，裁剪到 `[0,1]`。  
5. 将分数写入新列 `output_key`，写回 `storage` 并返回 `[output_key]`。  
6. 若图片无法读取或文本为空，则该样本分数记为 `0.0`。

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | 无 | Dataflow 的读写存储对象。 |
| `image_key` | `str` | `"image_path"` | 输入图片列名。 |
| `text_key` | `str` | `"text"` | 输入长文本列名。 |
| `output_key` | `str` | `"longclip_score"` | 输出分数字段名（范围 `[0,1]`）。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_vision import LongCLIPEvaluator

# 1) 准备 FileStorage（至少包含 image_path 与 text 两列）
storage = FileStorage(
    first_entry_file_name="data/longclip_input.jsonl",
    cache_path="./cache_local",
    file_name_prefix="longclip_eval",
    cache_type="jsonl"
)

# 2) 初始化 LongCLIP 评估算子（替换为你的权重路径）
evaluator = LongCLIPEvaluator(
    ckpt_path="/data0/happykeyan/DataFlow-MM/Dataflow-MM-Preview/ckpt/LongCLIP-L-336px/longclip-L@336px.pt",
    device=None  # 自动选择 cuda/cpu
)

# 3) 执行评估：将为每行新增 longclip_score ∈ [0,1]
cols = evaluator.run(
    storage=storage.step(),
    image_key="image_path",
    text_key="text",
    output_key="longclip_score"
)
print(cols)  # ["longclip_score"]
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `image_path`（或 `image_key` 指定列） | `string` | 无 | 输入图片路径。 |
| `text`（或 `text_key` 指定列） | `string` | 无 | 输入长文本。 |
| `longclip_score`（或 `output_key`） | `float` | 无 | 长文本图文对齐分数，范围 `[0,1]`。 |


示例输入：
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car."
}
```

示例输出：
```jsonl
{
  "image_path": "1.png",
  "text": "The image shows a man and a woman in what appears to be a car.",
  "clip_score": 0.642
}
```