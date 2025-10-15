---
title: 多模态数学题目生成
createTime: 2025/10/15 19:00:00
icon: material-symbols-light:functions
permalink: /zh/mm_operators/generate/multimodal_math/
---

## 📘 概述

`MultimodalMathGenerate` 是一个用于 **自动生成数学函数图像 + 数学问答对** 的多模态数据生成算子。  
它支持一次、二次、正弦、指数等多种函数类型，可生成简单和复杂两类数学问题，并自动绘制对应函数图像，适用于教育场景、视觉问答模型训练和数学推理评测。

---

## 🏗️ `__init__` 函数

```python
def __init__(
    self,
    image_dir: str = "/data0/mt/Dataflow-MM-Preview/cache",
    seed: int | None = None
):
    ...
```

## 🧾 `__init__` 参数说明

| 参数名         | 类型            | 默认值                                     | 说明               |
| :---------- | :------------ | :-------------------------------------- | :--------------- |
| `image_dir` | `str`         | `"/data0/mt/Dataflow-MM-Preview/cache"` | 用于保存生成的函数图像的目录   |
| `seed`      | `int \| None` | `None`                                  | 随机种子，用于保证生成结果可复现 |

---

## ⚡ `run` 函数

```python
def run(
    self,
    storage: DataFlowStorage,
    n: int = 200,
    mode: str = "complex",
    output_key: str = "multimodal_math"
):
    ...
```

执行算子主逻辑，自动生成指定数量的函数图像及对应数学问答对。

---

## 🧾 `run` 参数说明

| 参数名          | 类型                | 默认值                 | 说明                                        |
| :----------- | :---------------- | :------------------ | :---------------------------------------- |
| `storage`    | `DataFlowStorage` | -                   | Dataflow 数据存储对象                           |
| `n`          | `int`             | `200`               | 生成题目的数量                                   |
| `mode`       | `str`             | `"complex"`         | 生成模式，`"simple"` 为简单数值题，`"complex"` 为高阶概念题 |
| `output_key` | `str`             | `"multimodal_math"` | 输出数据的字段名前缀                                |

---

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_math import MultimodalMathGenerate

# Step 1: 准备存储
storage = FileStorage(
    first_entry_file_name="data/math_samples.jsonl",
    cache_path="./cache_local",
    file_name_prefix="math",
    cache_type="jsonl"
)

# Step 2: 初始化算子
math_generator = MultimodalMathGenerate(
    image_dir="./math_plots",
    seed=42
)

# Step 3: 生成复杂数学题目（含导数、极值、单调性）
math_generator.run(
    storage=storage,
    n=10,
    mode="complex",
    output_key="multimodal_math"
)

# Step 4: 也可生成简单题（直接代入计算）
math_generator.run(
    storage=storage,
    n=10,
    mode="simple",
    output_key="multimodal_math_simple"
)
```

---

## 🧾 默认输出格式（Output Format）

| 字段           | 类型    | 说明         |
| :----------- | :---- | :--------- |
| `image_path` | `str` | 函数图像保存路径   |
| `question`   | `str` | 自动生成的数学题目  |
| `answer`     | `str` | 答案         |
| `solution`   | `str` | 详细的解题步骤与解释 |

---

### 📥 示例输入

```jsonl
{}
```

> 该算子不依赖外部输入数据，而是直接生成样本。

---

### 📤 示例输出（Simple 模式）

```jsonl
{
  "image_path": "./math_plots/plot_0.png",
  "question": "函数图像表示 f(x) = x²，请问在 x=3.5 时，函数值是多少？",
  "answer": "12.25",
  "solution": "根据函数表达式 f(x) = x²，代入 x=3.5，计算得 y=12.25。"
}
```

---

### 📤 示例输出（Complex 模式）

```jsonl
{
  "image_path": "./math_plots/plot_7.png",
  "question": "函数图像表示 f(x) = sin(x)，请判断在 x=2.5 处函数的变化率是正的还是负的？",
  "answer": "负",
  "solution": "观察图像在 x=2.5 附近的斜率，可知变化率为负。"
}
```