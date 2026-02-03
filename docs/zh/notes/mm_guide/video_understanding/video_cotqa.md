---
title: 视频思维链问答流水线
createTime: 2025/07/16 16:30:00
permalink: /zh/mm_guide/video_cotqa_pipeline/
icon: mdi:thought-bubble
---

# 视频思维链问答流水线

## 1. 概述

**视频思维链问答流水线**（Video Chain-of-Thought QA Pipeline）通过让模型逐步推理来生成高质量的视频问答数据，并对生成的答案进行评估和过滤，适用于需要复杂推理的视频理解任务、高质量问答数据集构建和模型训练数据筛选。

我们支持以下应用场景：

- 视频推理问答数据集构建
- 复杂视频理解任务评测
- 高质量训练数据筛选
- 思维链推理能力训练

流水线的主要流程包括：

1. **Prompt 构建**：使用 `VideoCOTQAGeneratorPrompt` 模板构建思维链问答提示。
2. **CoT 问答生成**：利用 `PromptedVQAGenerator` 和 VLM 模型生成包含 `<think>` 和 `<answer>` 标签的响应。
3. **响应处理**：提取思考过程和最终答案，生成结构化输出。
4. **答案评估**：评估生成答案的质量，计算奖励分数。
5. **质量过滤**：基于奖励分数过滤低质量样本，保留高质量数据。

---

## 2. 快速开始

### 第一步：创建新的 DataFlow 工作文件夹
```bash
mkdir run_dataflow_mm
cd run_dataflow_mm
```

### 第二步：初始化 DataFlow-MM
```bash
dataflowmm init
```
这时你会看到：
```bash
run_dataflow_mm/gpu_pipelines/video_cotqa_pipeline.py  
```

### 第三步：配置模型路径和过滤阈值

在 `video_cotqa_pipeline.py` 中配置 VLM 模型路径、prompt template 和评分阈值：

```python
# VLM 模型配置
self.vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",  # 修改为你的模型路径
    hf_cache_dir='./dataflow_cache',
    vllm_tensor_parallel_size=1,
    vllm_temperature=1.0,
    vllm_top_p=0.95,
    vllm_max_tokens=2048,
    vllm_max_model_len=51200,
    vllm_gpu_memory_utilization=0.9,
)

# 初始化算子
self.prompted_vqa_generator = PromptedVQAGenerator(
    serving=self.vlm_serving,
    system_prompt="You are a helpful assistant."
)
self.prompt_template = VideoCOTQAGeneratorPrompt()

# 评分过滤器配置
self.score_filter = ScoreFilter(
    min_score=0.6,  # 最低奖励分数阈值
)
```

### 第四步：一键运行
```bash
python gpu_pipelines/video_cotqa_pipeline.py
```

::: tip API 版本
如果你希望使用 API 服务而非本地模型，可以使用 API 版本的流水线：
```bash
python api_pipelines/video_cotqa_api_pipeline.py
```
API 版本的使用方式与本地版本类似，只需配置 API Key 和服务地址即可。详情参见 `api_pipelines/video_cotqa_api_pipeline.py` 中的配置说明。
:::

此外，你可以根据自己的需求调整评分阈值和评估策略。接下来，我们会详细介绍流水线中的各个步骤和参数配置。

---

## 3. 数据流与流水线逻辑

### 1. **输入数据**

该流程的输入数据包括以下字段：

* **video**：视频文件路径列表，如 `["path/to/video.mp4"]`
* **image**（可选）：图像文件路径列表
* **problem_type**：问题类型（如 "multiple choice", "free-form", "numerical" 等）
* **problem**：问题内容
* **options**：选项列表（多选题时使用，其他类型可为空列表）
* **data_type**：数据类型（"video" 或 "image"）
* **solution**：标准答案（格式为 `<answer>...</answer>`）

这些输入数据可以存储在指定的文件中（如 `json` 或 `jsonl`），并通过 `FileStorage` 对象进行管理和读取：

```python
self.storage = FileStorage(
    first_entry_file_name="./dataflow/example/video_cot_qa/sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_cotqa_test",
    cache_type="json",
)
```

**输入数据示例**：

```json
[
    {
        "video": ["./dataflow/example/video_cot_qa/ytb_7nRmsEw7nsE.mp4"],
        "problem_type": "multiple choice",
        "problem": "What appears on the screen in Russian during the missile's ascent?",
        "options": [
            "A. A YouTube subscription notification",
            "B. A military command",
            "C. A warning message",
            "D. A weather update"
        ],
        "data_type": "video",
        "solution": "<answer>A</answer>"
    },
    {
        "video": ["./dataflow/example/video_cot_qa/split_8.mp4"],
        "problem_type": "free-form",
        "problem": "What cooking action does the person perform with the black frying pan on the right burner?",
        "options": [],
        "data_type": "video",
        "solution": "<answer>The person cracks an egg into the black frying pan on the right burner.</answer>"
    }
]
```

### 2. **CoT 问答生成（PromptedVQAGenerator + VideoCOTQAGeneratorPrompt）**

流程的第一步是使用 **PromptedVQAGenerator** 结合 **VideoCOTQAGeneratorPrompt** 生成包含推理过程的答案。

**功能：**

* 使用 `VideoCOTQAGeneratorPrompt` 模板构建思维链问答 prompt
* 根据问题类型（多选题、开放题等）添加特定的后缀
* 利用 VLM 模型生成包含 `<think>...</think>` 和 `<answer>...</answer>` 标签的响应
* 提取思考过程和最终答案，生成结构化输出

**输入**：视频、图像（可选）、问题、问题类型、选项  
**输出**：推理过程（process）、最终答案（answer）、完整响应（full_response）

**算子初始化**：

```python
self.prompted_vqa_generator = PromptedVQAGenerator(
    serving=self.vlm_serving,
    system_prompt="You are a helpful assistant."
)
self.prompt_template = VideoCOTQAGeneratorPrompt()
```

**核心处理流程**：

```python
# 1. 构建 prompt
def _build_prompts(self, df):
    prompts = []
    for _, row in df.iterrows():
        problem_type = row.get('problem_type', '')
        problem = row.get('problem', '')
        options = row.get('options', [])
        
        # 格式化问题（多选题包含选项）
        if problem_type == 'multiple choice' and options:
            question = problem + "Options:\n"
            for op in options:
                question += op + "\n"
        else:
            question = problem
        
        # 使用模板构建 prompt
        type_template = getattr(self.prompt_template, 'type_template', {})
        type_suffix = type_template.get(problem_type, "")
        prompt = self.prompt_template.build_prompt(Question=question) + type_suffix
        prompts.append(prompt)
    
    return prompts

# 2. 生成响应
self.prompted_vqa_generator.run(
    storage=storage.step(),
    input_image_key="image",
    input_video_key="video",
    input_prompt_key="prompt",
    output_answer_key="_temp_cotqa_response",
)

# 3. 提取 <think> 和 <answer> 标签内容
def _extract_think(output_str: str) -> str:
    pattern = r'<think>\s*(.*?)\s*</think>'
    match = re.search(pattern, output_str, re.DOTALL)
    return match.group(1).strip() if match else ""

def _extract_answer(text: str) -> str:
    pattern = r'<answer>\s*(.*?)\s*</answer>'
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

# 4. 处理响应生成结构化输出
answers, processes = self._process_responses(responses)
df["answer"] = answers
df["process"] = processes
df["full_response"] = responses
```

### 3. **答案评估（GeneralTextAnswerEvaluator）**

流程的第二步是使用**答案评估器**（`GeneralTextAnswerEvaluator`）评估生成答案的质量并计算奖励分数。

**功能：**

* 将生成的答案与标准答案进行比较
* 计算相似度和正确性分数
* 生成奖励值用于后续过滤

**输入**：生成的完整响应、标准答案、问题类型  
**输出**：奖励分数（reward）

**算子初始化**：

```python
self.evaluator = GeneralTextAnswerEvaluator(
    use_stemmer=True,  # 使用词干提取器进行文本匹配
)
```

**参数说明**：
- `use_stemmer=True`: 启用词干提取，提高文本匹配的鲁棒性

**算子运行**：

```python
self.evaluator.run(
    storage=self.storage.step(),
    input_model_output_key="full_response",     # 输入模型输出字段
    input_gt_solution_key="solution",           # 输入标准答案字段
    input_question_type_key="problem_type",     # 输入问题类型字段
    output_reward_key="reward",                 # 输出奖励分数字段
)
```

### 4. **质量过滤（ScoreFilter）**

流程的第三步是使用**分数过滤器**（`ScoreFilter`）基于奖励分数过滤低质量样本。

**功能：**

* 根据设定的阈值过滤低质量样本
* 标记通过过滤的高质量数据
* 便于后续数据筛选和使用

**输入**：奖励分数  
**输出**：选择标记（select，布尔值）

**算子初始化**：

```python
self.score_filter = ScoreFilter(
    min_score=0.6,  # 最低奖励分数阈值（0-1之间）
)
```

**参数说明**：
- `min_score`: 最低奖励分数阈值，低于此分数的样本将被过滤

**算子运行**：

```python
self.score_filter.run(
    storage=self.storage.step(),
    input_score_key="reward",      # 输入分数字段
    output_select_key="select",    # 输出选择标记字段
)
```

### 5. **输出数据**

最终，流水线生成的输出数据将包含以下内容：

* **video**：原始视频路径
* **problem**：输入的问题
* **problem_type**：问题类型（输入）
* **options**：选项列表（输入）
* **data_type**：数据类型（输入）
* **solution**：标准答案（输入）
* **answer**：生成的最终答案
* **process**：推理过程（思维链）
* **full_response**：完整的模型响应
* **reward**：评估的奖励分数
* **select**：是否通过质量过滤（布尔值）

**输出数据示例**：

```json
{
    "video": ["./dataflow/example/video_cot_qa/split_8.mp4"],
    "problem_type": "free-form",
    "problem": "What cooking action does the person perform with the black frying pan on the right burner?",
    "options": [],
    "data_type": "video",
    "solution": "<answer>The person cracks an egg into the black frying pan on the right burner.</answer>",
    "answer": "The person cracks an egg into the black frying pan on the right burner.",
    "process": "First, I observe the kitchen setup with multiple burners. Then, I focus on the right burner where a black frying pan is placed. Next, I see the person holding an egg and cracking it into the pan.",
    "full_response": "Let me analyze the cooking action... [complete reasoning process] ...Therefore, the answer is: The person cracks an egg into the black frying pan on the right burner.",
    "reward": 0.92,
    "select": true
}
```

---

## 4. 流水线示例

以下给出示例流水线，展示如何使用 VideoCOTQATest 进行思维链问答生成、评估和过滤。

```python
from dataflow.operators.core_vision import PromptedVQAGenerator, GeneralTextAnswerEvaluator, ScoreFilter
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
from dataflow.prompts.video import VideoCOTQAGeneratorPrompt
import os
import re

class VideoCOTQATest:
    def __init__(self):
        # 初始化存储
        self.storage = FileStorage(
            first_entry_file_name="./dataflow/example/video_cot_qa/sample_data.json",
            cache_path="./cache",
            file_name_prefix="video_cotqa",
            cache_type="json",
        )
        
        self.model_cache_dir = './dataflow_cache'
        
        self.vlm_serving = LocalModelVLMServing_vllm(
            hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",
            hf_cache_dir=self.model_cache_dir,
            vllm_tensor_parallel_size=1,
            vllm_temperature=1.0,
            vllm_top_p=0.95,
            vllm_max_tokens=2048,
            vllm_max_model_len=51200,
            vllm_gpu_memory_utilization=0.9,
        )

        # 初始化算子
        self.prompted_vqa_generator = PromptedVQAGenerator(
            serving=self.vlm_serving,
            system_prompt="You are a helpful assistant."
        )
        self.prompt_template = VideoCOTQAGeneratorPrompt()
        
        self.evaluator = GeneralTextAnswerEvaluator(
            use_stemmer=True
        )
        
        self.score_filter = ScoreFilter(
            min_score=0.6,
        )

    @staticmethod
    def _extract_think(output_str: str) -> str:
        """提取 <think> 和 </think> 标签之间的内容"""
        pattern = r'<think>\s*(.*?)\s*</think>'
        match = re.search(pattern, output_str, re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    @staticmethod
    def _extract_answer(text: str) -> str:
        """提取 <answer> 和 </answer> 标签之间的内容"""
        pattern = r'<answer>\s*(.*?)\s*</answer>'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    def _build_prompts(self, df):
        """使用模板为每一行构建 prompt"""
        prompts = []
        for _, row in df.iterrows():
            problem_type = row.get('problem_type', '')
            problem = row.get('problem', '')
            options = row.get('options', [])
            
            # 格式化问题，多选题包含选项
            if problem_type == 'multiple choice' and options:
                question = problem + "Options:\n"
                for op in options:
                    question += op + "\n"
            else:
                question = problem
            
            # 使用 prompt template 构建，并添加类型特定的后缀
            type_template = getattr(self.prompt_template, 'type_template', {})
            type_suffix = type_template.get(problem_type, "")
            prompt = self.prompt_template.build_prompt(Question=question) + type_suffix
            prompts.append(prompt)
        
        return prompts
    
    def _process_responses(self, responses):
        """处理 CoT QA 响应以提取答案和思考链"""
        answers = []
        processes = []
        
        for response in responses:
            # 提取思考链和答案
            think_chain = self._extract_think(response)
            final_ans = self._extract_answer(response)
            
            answers.append(final_ans)
            processes.append(f"<think>{think_chain}</think>" if think_chain else "")
        
        return answers, processes
    
    def _print_results_summary(self, result_df):
        """打印最终结果摘要"""
        print("\n" + "="*60)
        print("Final Results:")
        print("="*60)
        print(f"Results shape: {result_df.shape}")
        
        if result_df.empty:
            return
        
        print("\nColumns:", result_df.columns.tolist())
        
        # 计算并显示统计信息
        if 'reward' in result_df.columns and 'select' in result_df.columns:
            rewards = result_df['reward'].tolist()
            selects = result_df['select'].tolist()
            print(f"\nAverage reward: {sum(rewards)/len(rewards):.4f}")
            print(f"Selected samples: {sum(selects)}/{len(selects)}")
        
        # 打印第一批结果样本
        print("\nSample results:")
        cols_to_show = ['answer', 'process', 'reward', 'select']
        available_cols = [col for col in cols_to_show if col in result_df.columns]
        print(result_df[available_cols].head())

    def run(self):
        print("Running VideoCOTQAGenerator pipeline...")
        
        # 步骤 1: 生成 CoT QA 响应
        print("\n[Step 1/3] Generating CoT QA responses...")
        
        # 加载数据并构建 prompts
        storage = self.storage.step()
        df = storage.read("dataframe")
        
        # 构建 prompts 并添加到 dataframe
        prompts = self._build_prompts(df)
        df["prompt"] = prompts
        storage.write(df)
        
        # 使用 PromptedVQAGenerator 生成响应
        self.prompted_vqa_generator.run(
            storage=storage.step(),
            input_image_key="image",
            input_video_key="video",
            input_prompt_key="prompt",
            output_answer_key="_temp_cotqa_response",
        )
        
        # 读取带有响应的结果
        storage.step()
        df = storage.read("dataframe")
        responses = df["_temp_cotqa_response"].tolist()
        
        # 处理响应 - 提取思考链和答案
        answers, processes = self._process_responses(responses)
        
        # 附加提取的答案和过程
        df["answer"] = answers
        df["process"] = processes
        df["full_response"] = responses
        storage.write(df)
                
        # 步骤 2: 评估答案并计算奖励
        print("\n[Step 2/3] Evaluating answers and calculating rewards...")
        self.evaluator.run(
            storage=self.storage.step(),
            input_model_output_key="full_response",
            input_gt_solution_key="solution",
            input_question_type_key="problem_type",
            output_reward_key="reward",
        )
        
        # 步骤 3: 基于奖励阈值过滤
        print("\n[Step 3/3] Filtering based on reward threshold...")
        self.score_filter.run(
            storage=self.storage.step(),
            input_score_key="reward",
            output_select_key="select",
        )
        
        # 打印结果摘要
        result_df = self.storage.step().read("dataframe")
        self._print_results_summary(result_df)

if __name__ == "__main__":
    # 如有需要，设置可见 GPU
    # os.environ["CUDA_VISIBLE_DEVICES"] = "0"
    test = VideoCOTQATest()
    test.run()
```
