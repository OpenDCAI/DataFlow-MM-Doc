---
title: Video Chain-of-Thought QA Pipeline
createTime: 2025/07/16 16:30:00
permalink: /en/mm_guide/video_cotqa_pipeline/
icon: mdi:thought-bubble
---

# Video Chain-of-Thought QA Pipeline

## 1. Overview

The **Video Chain-of-Thought QA Pipeline** generates high-quality video QA data through step-by-step reasoning, and evaluates and filters the generated answers, suitable for complex video understanding tasks requiring reasoning, high-quality QA dataset construction, and model training data curation.

We support the following use cases:

- Video reasoning QA dataset construction
- Complex video understanding task evaluation
- High-quality training data curation
- Chain-of-thought reasoning capability training

The main stages of the pipeline include:

1. **Prompt Building**: Use `VideoCOTQAGeneratorPrompt` template to build chain-of-thought QA prompts.
2. **CoT QA Generation**: Use `PromptedVQAGenerator` and VLM models to generate responses with `<think>` and `<answer>` tags.
3. **Response Processing**: Extract thinking process and final answer to generate structured output.
4. **Answer Evaluation**: Evaluate the quality of generated answers and calculate reward scores.
5. **Quality Filtering**: Filter low-quality samples based on reward scores and retain high-quality data.

---

## 2. Quick Start

### Step 1: Create a new DataFlow workspace
```bash
mkdir run_dataflow_mm
cd run_dataflow_mm
```

### Step 2: Initialize DataFlow-MM
```bash
dataflowmm init
```
You will see:
```bash
run_dataflow_mm/gpu_pipelines/video_cotqa_pipeline.py  
```

### Step 3: Configure model path and filter threshold

In `video_cotqa_pipeline.py`, configure the VLM model path, prompt template, and score threshold:

```python
# VLM model configuration
self.vlm_serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-VL-7B-Instruct",  # Modify to your model path
    hf_cache_dir='./dataflow_cache',
    vllm_tensor_parallel_size=1,
    vllm_temperature=1.0,
    vllm_top_p=0.95,
    vllm_max_tokens=2048,
    vllm_max_model_len=51200,
    vllm_gpu_memory_utilization=0.9,
)

# Initialize operators
self.prompted_vqa_generator = PromptedVQAGenerator(
    serving=self.vlm_serving,
    system_prompt="You are a helpful assistant."
)
self.prompt_template = VideoCOTQAGeneratorPrompt()

# Score filter configuration
self.score_filter = ScoreFilter(
    min_score=0.6,  # Minimum reward score threshold
)
```

### Step 4: One-click run
```bash
python gpu_pipelines/video_cotqa_pipeline.py
```

::: tip API Version
If you prefer to use an API service instead of a local model, you can use the API version of the pipeline:
```bash
python api_pipelines/video_cotqa_api_pipeline.py
```
The API version works similarly to the local version; you just need to configure the API Key and service URL. See `api_pipelines/video_cotqa_api_pipeline.py` for configuration details.
:::

You can adjust the score threshold and evaluation strategy based on your needs. Below we introduce each step in the pipeline and parameter configuration in detail.

---

## 3. Data Flow and Pipeline Logic

### 1. **Input Data**

The pipeline input includes the following fields:

* **video**: List of video file paths, e.g., `["path/to/video.mp4"]`
* **image** (optional): List of image file paths
* **problem_type**: Question type (e.g., "multiple choice", "free-form", "numerical", etc.)
* **problem**: Question content
* **options**: List of options (used for multiple choice questions, empty list for other types)
* **data_type**: Data type ("video" or "image")
* **solution**: Ground truth answer (formatted as `<answer>...</answer>`)

Inputs can be stored in designated files (such as `json` or `jsonl`) and managed and read via the `FileStorage` object:

```python
self.storage = FileStorage(
    first_entry_file_name="./dataflow/example/video_cot_qa/sample_data.json",
    cache_path="./cache",
    file_name_prefix="video_cotqa_test",
    cache_type="json",
)
```

**Input Data Example**:

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

### 2. **CoT QA Generation (PromptedVQAGenerator + VideoCOTQAGeneratorPrompt)**

The first step uses **PromptedVQAGenerator** combined with **VideoCOTQAGeneratorPrompt** to generate answers with reasoning processes.

**Functionality:**

* Use `VideoCOTQAGeneratorPrompt` template to build chain-of-thought QA prompts
* Add question type-specific suffixes (multiple choice, free-form, etc.)
* Use VLM models to generate responses with `<think>...</think>` and `<answer>...</answer>` tags
* Extract thinking process and final answer to generate structured output

**Input:** Video, image (optional), question, question type, options  
**Output:** Reasoning process (process), final answer (answer), full response (full_response)

**Operator Initialization**:

```python
self.prompted_vqa_generator = PromptedVQAGenerator(
    serving=self.vlm_serving,
    system_prompt="You are a helpful assistant."
)
self.prompt_template = VideoCOTQAGeneratorPrompt()
```

**Core Processing Flow**:

```python
# 1. Build prompts
def _build_prompts(self, df):
    prompts = []
    for _, row in df.iterrows():
        problem_type = row.get('problem_type', '')
        problem = row.get('problem', '')
        options = row.get('options', [])
        
        # Format question (multiple choice includes options)
        if problem_type == 'multiple choice' and options:
            question = problem + "Options:\n"
            for op in options:
                question += op + "\n"
        else:
            question = problem
        
        # Build prompt using template
        type_template = getattr(self.prompt_template, 'type_template', {})
        type_suffix = type_template.get(problem_type, "")
        prompt = self.prompt_template.build_prompt(Question=question) + type_suffix
        prompts.append(prompt)
    
    return prompts

# 2. Generate responses
self.prompted_vqa_generator.run(
    storage=storage.step(),
    input_image_key="image",
    input_video_key="video",
    input_prompt_key="prompt",
    output_answer_key="_temp_cotqa_response",
)

# 3. Extract <think> and <answer> tag content
def _extract_think(output_str: str) -> str:
    pattern = r'<think>\s*(.*?)\s*</think>'
    match = re.search(pattern, output_str, re.DOTALL)
    return match.group(1).strip() if match else ""

def _extract_answer(text: str) -> str:
    pattern = r'<answer>\s*(.*?)\s*</answer>'
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

# 4. Process responses to generate structured output
answers, processes = self._process_responses(responses)
df["answer"] = answers
df["process"] = processes
df["full_response"] = responses
```

### 3. **Answer Evaluation (GeneralTextAnswerEvaluator)**

The second step of the pipeline is to use the **Answer Evaluator** (`GeneralTextAnswerEvaluator`) to evaluate the quality of generated answers and calculate reward scores.

**Functionality:**

* Compare generated answers with ground truth answers
* Calculate similarity and correctness scores
* Generate reward values for subsequent filtering

**Input:** Generated full response, ground truth answer, question type  
**Output:** Reward score (reward)

**Operator Initialization**:

```python
self.evaluator = GeneralTextAnswerEvaluator(
    use_stemmer=True,  # Use stemmer for text matching
)
```

**Parameter Description**:
- `use_stemmer=True`: Enable stemming to improve text matching robustness

**Operator Run**:

```python
self.evaluator.run(
    storage=self.storage.step(),
    input_model_output_key="full_response",     # Input model output field
    input_gt_solution_key="solution",           # Input ground truth answer field
    input_question_type_key="problem_type",     # Input question type field
    output_reward_key="reward",                 # Output reward score field
)
```

### 4. **Quality Filtering (ScoreFilter)**

The third step of the pipeline is to use the **Score Filter** (`ScoreFilter`) to filter low-quality samples based on reward scores.

**Functionality:**

* Filter low-quality samples based on set threshold
* Mark high-quality data that passes filtering
* Facilitate subsequent data curation and use

**Input:** Reward score  
**Output:** Selection mark (select, boolean)

**Operator Initialization**:

```python
self.score_filter = ScoreFilter(
    min_score=0.6,  # Minimum reward score threshold (between 0-1)
)
```

**Parameter Description**:
- `min_score`: Minimum reward score threshold, samples below this score will be filtered

**Operator Run**:

```python
self.score_filter.run(
    storage=self.storage.step(),
    input_score_key="reward",      # Input score field
    output_select_key="select",    # Output selection mark field
)
```

### 5. **Output Data**

The final output includes:

* **video**: Original video path
* **problem**: Input question
* **problem_type**: Question type (input)
* **options**: List of options (input)
* **data_type**: Data type (input)
* **solution**: Ground truth answer (input)
* **answer**: Generated final answer
* **process**: Reasoning process (chain-of-thought)
* **full_response**: Complete model response
* **reward**: Evaluation reward score
* **select**: Whether it passes quality filtering (boolean)

**Output Data Example**:

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

## 4. Pipeline Example

An example pipeline demonstrating how to use VideoCOTQATest for chain-of-thought QA generation, evaluation, and filtering:

```python
from dataflow.operators.core_vision import PromptedVQAGenerator, GeneralTextAnswerEvaluator, ScoreFilter
from dataflow.prompts.video import VideoCOTQAGeneratorPrompt
import re
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage
import os

class VideoCOTQATest:
    def __init__(self):
        # Initialize storage
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

        # Initialize Operators
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
        """Extract content between <think> and </think> tags"""
        pattern = r'<think>\s*(.*?)\s*</think>'
        match = re.search(pattern, output_str, re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    @staticmethod
    def _extract_answer(text: str) -> str:
        """Extract content between <answer> and </answer> tags"""
        pattern = r'<answer>\s*(.*?)\s*</answer>'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    def _build_prompts(self, df):
        """Build one prompt per row using the template and problem information"""
        prompts = []
        for _, row in df.iterrows():
            problem_type = row.get('problem_type', '')
            problem = row.get('problem', '')
            options = row.get('options', [])
            
            # Format question with options if multiple choice
            if problem_type == 'multiple choice' and options:
                question = problem + "Options:\n"
                for op in options:
                    question += op + "\n"
            else:
                question = problem
            
            # Build prompt with type-specific suffix
            type_template = getattr(self.prompt_template, 'type_template', {})
            type_suffix = type_template.get(problem_type, "")
            prompt = self.prompt_template.build_prompt(Question=question) + type_suffix
            prompts.append(prompt)
        
        return prompts
    
    def _process_responses(self, responses):
        """Process CoT QA responses to extract answers and think chains"""
        answers = []
        processes = []
        
        for response in responses:
            # Extract think chain and answer
            think_chain = self._extract_think(response)
            final_ans = self._extract_answer(response)
            
            answers.append(final_ans)
            processes.append(f"<think>{think_chain}</think>" if think_chain else "")
        
        return answers, processes
    
    def _print_results_summary(self, result_df):
        """Print summary of final results"""
        print("\n" + "="*60)
        print("Final Results:")
        print("="*60)
        print(f"Results shape: {result_df.shape}")
        
        if result_df.empty:
            return
        
        print("\nColumns:", result_df.columns.tolist())
        
        # Calculate and display statistics
        if 'reward' in result_df.columns and 'select' in result_df.columns:
            rewards = result_df['reward'].tolist()
            selects = result_df['select'].tolist()
            print(f"\nAverage reward: {sum(rewards)/len(rewards):.4f}")
            print(f"Selected samples: {sum(selects)}/{len(selects)}")
        
        # Print first result samples if available
        print("\nSample results:")
        cols_to_show = ['answer', 'process', 'reward', 'select']
        available_cols = [col for col in cols_to_show if col in result_df.columns]
        print(result_df[available_cols].head())

    def run(self):
        print("Running VideoCOTQAGenerator pipeline...")
        
        # Step 1: Generate CoT QA responses
        print("\n[Step 1/3] Generating CoT QA responses...")
        
        # Load data and build prompts
        storage = self.storage.step()
        df = storage.read("dataframe")
        
        # Build prompts and add to dataframe
        prompts = self._build_prompts(df)
        df["prompt"] = prompts
        storage.write(df)
        
        # Use PromptedVQAGenerator to generate responses
        self.prompted_vqa_generator.run(
            storage=storage.step(),
            input_image_key="image",
            input_video_key="video",
            input_prompt_key="prompt",
            output_answer_key="_temp_cotqa_response",
        )
        
        # Read back the results with responses
        storage.step()
        df = storage.read("dataframe")
        responses = df["_temp_cotqa_response"].tolist()
        
        # Process responses - extract think chain and answer
        answers, processes = self._process_responses(responses)
        
        # Attach extracted answers and processes
        df["answer"] = answers
        df["process"] = processes
        df["full_response"] = responses
        storage.write(df)
                
        # Step 2: Evaluate answers and calculate rewards
        print("\n[Step 2/3] Evaluating answers and calculating rewards...")
        self.evaluator.run(
            storage=self.storage.step(),
            input_model_output_key="full_response",
            input_gt_solution_key="solution",
            input_question_type_key="problem_type",
            output_reward_key="reward",
        )
        
        # Step 3: Filter based on reward threshold
        print("\n[Step 3/3] Filtering based on reward threshold...")
        self.score_filter.run(
            storage=self.storage.step(),
            input_score_key="reward",
            output_select_key="select",
        )
        
        # Print results summary
        result_df = self.storage.step().read("dataframe")
        self._print_results_summary(result_df)

if __name__ == "__main__":
    # Set visible GPUs if necessary
    # os.environ["CUDA_VISIBLE_DEVICES"] = "0"
    test = VideoCOTQATest()
    test.run()
```