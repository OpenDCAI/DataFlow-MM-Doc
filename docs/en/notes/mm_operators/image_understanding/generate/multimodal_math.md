---
title: Multimodal Math Question Generation
createTime: 2025/10/15 19:00:00
icon: material-symbols-light:functions
permalink: /en/mm_operators/generate/multimodal_math/
---

## 📘 Overview

`MultimodalMathGenerate` is an operator for **automatically generating math function plots along with math question-answer pairs**.  
It supports various function types such as linear, quadratic, sine, and exponential functions. Users can generate both simple and complex math problems, with automatically plotted corresponding function images. This is suitable for educational scenarios, visual QA model training, and mathematical reasoning evaluation.

---

## 🏗️ `__init__` Function

```python
def __init__(
    self,
    image_dir: str = "/data0/mt/Dataflow-MM-Preview/cache",
    seed: int | None = None
):
    ...
```

## 🧾 `__init__` Parameters

| Parameter   | Type          | Default                                 | Description                                |
| :---------- | :------------ | :-------------------------------------- | :----------------------------------------- |
| `image_dir` | `str`         | `"/data0/mt/Dataflow-MM-Preview/cache"` | Directory to save generated function plots |
| `seed`      | `int \| None` | `None`                                  | Random seed for reproducibility            |

---

## ⚡ `run` Function

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

Executes the main workflow, automatically generating a specified number of function plots along with corresponding math QA pairs.

---

## 🧾 `run` Parameters

| Parameter    | Type              | Default             | Description                                                                                                 |
| :----------- | :---------------- | :------------------ | :---------------------------------------------------------------------------------------------------------- |
| `storage`    | `DataFlowStorage` | -                   | Dataflow storage object                                                                                     |
| `n`          | `int`             | `200`               | Number of samples to generate                                                                               |
| `mode`       | `str`             | `"complex"`         | Generation mode: `"simple"` for straightforward numeric problems, `"complex"` for advanced concept problems |
| `output_key` | `str`             | `"multimodal_math"` | Output field name prefix for generated data                                                                 |

---

## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_math import MultimodalMathGenerate

# Step 1: Prepare storage
storage = FileStorage(
    first_entry_file_name="data/math_samples.jsonl",
    cache_path="./cache_local",
    file_name_prefix="math",
    cache_type="jsonl"
)

# Step 2: Initialize operator
math_generator = MultimodalMathGenerate(
    image_dir="./math_plots",
    seed=42
)

# Step 3: Generate complex math problems (derivatives, extrema, monotonicity)
math_generator.run(
    storage=storage,
    n=10,
    mode="complex",
    output_key="multimodal_math"
)

# Step 4: Generate simple numeric problems
math_generator.run(
    storage=storage,
    n=10,
    mode="simple",
    output_key="multimodal_math_simple"
)
```

---

## 🧾 Default Output Format

| Field        | Type  | Description                           |
| :----------- | :---- | :------------------------------------ |
| `image_path` | `str` | Path to the generated function plot   |
| `question`   | `str` | Automatically generated math question |
| `answer`     | `str` | Answer to the question                |
| `solution`   | `str` | Detailed step-by-step solution        |

---

### 📥 Example Input

```jsonl
{}
```

> This operator does not depend on external input data and generates samples directly.

---

### 📤 Example Output (Simple Mode)

```jsonl
{
  "image_path": "./math_plots/plot_0.png",
  "question": "The function plot represents f(x) = x². What is the value of the function at x=3.5?",
  "answer": "12.25",
  "solution": "According to the function expression f(x) = x², substituting x=3.5 gives y=12.25."
}
```

---

### 📤 Example Output (Complex Mode)

```jsonl
{
  "image_path": "./math_plots/plot_7.png",
  "question": "The function plot represents f(x) = sin(x). Determine whether the rate of change of the function at x=2.5 is positive or negative.",
  "answer": "Negative",
  "solution": "By observing the slope near x=2.5 on the plot, the rate of change is negative."
}
```