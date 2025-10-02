---
title: 函数调用数据合成流水线
icon: solar:flash-drive-outline
createTime: 2025/07/16 15:49:39
permalink: /zh/guide/hy4417i0/
---

# 函数调用数据合成流水线

## 1. 概述

**函数调用数据合成流水线**的目标是，通过函数/工具调用多轮对话数据的合成，扩展现有文本数据集的多样性，为模型在下游任务上的优化提供更加丰富的训练数据。流水线主要包含真实任务场景的提取和生成，任务的生成与验证，函数生成，多智能体多轮对话生成等步骤，最后给出针对函数调用场景的对话数据集。

流水线的主要流程参考了论文[BUTTON](https://arxiv.org/abs/2410.12952)中提出的数据合成步骤，包括：

1. **场景提取**: 从对话数据中提取真实任务场景信息，给出简短描述。
2. **任务生成，扩展与验证**: 根据提取出的场景信息生成原子化的任务，并将原子化的任务组织成更加复杂的组合任务，最后对任务的合理性进行验证。
3. **函数生成**: 根据组合任务及其原子化子任务生成所需的函数调用。
4. **多智能体多轮对话生成**: 根据任务及其函数调用生成多轮对话数据。

## 2. 数据流与流水线逻辑

### 1. **输入数据**

流水线的输入数据需要包含对话类数据，如示例中的"chat"关键字对应的数据:

```json
{
    "system": "SYSTEM: You are a helpful assistant with access to the following functions. Use them if required -\n{\n    \"name\": \"get_exchange_rate\",\n    \"description\": \"Get the exchange rate between two currencies\",\n    \"parameters\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"base_currency\": {\n                \"type\": \"string\",\n                \"description\": \"The currency to convert from\"\n            },\n            \"target_currency\": {\n                \"type\": \"string\",\n                \"description\": \"The currency to convert to\"\n            }\n        },\n        \"required\": [\n            \"base_currency\",\n            \"target_currency\"\n        ]\n    }\n}\n",
    "chat": "USER: Can you book a flight for me from New York to London?\n\n\nASSISTANT: I'm sorry, but I don't have the capability to book flights. My current function allows me to get the exchange rate between two currencies. If you need help with that, feel free to ask! <|endoftext|>\n\n\n"
}
```
这些输入数据可以存储在指定的文件（如`json`、`jsonl`）中，并通过`FileStorage`对象进行管理和读取。示例中会载入默认的数据路径，实际使用场景下可以根据需求修改路径以载入自定义的数据和缓存路径：

```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/FuncCallPipeline/chat_data.jsonl",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 2. **场景提取与扩展（Scenario Extracting and Expanding）**

#### 2.1 **场景提取（Scenario Extracting）**

流水线的第一步是通过**场景提取器**（`ScenarioExtractor`）在对话数据中提取对话发生的场景信息。

**功能:**

* 提取对话的场景信息。

**输入**: 原始的对话数据
**输出**: 简短的对话场景

```python
scenario_extractor = ScenarioExtractor(
    llm_serving=self.llm_serving
    )
```

#### 2.2 **场景扩展（Scenario Expanding）**

流水线提供了可选步骤：通过**场景扩展器**（`ScenarioExpander`）扩展已有的场景到新的场景。

**功能:**

* 扩展对话场景。

**输入**: 原始对话场景
**输出**: 新对话场景

```python
scenario_expander = ScenarioExpander(
    llm_serving=self.llm_serving
    )
```

### 3. **任务生成，扩展与验证（Task Generating, Expanding and Validation）**

#### 3.1 **原子化任务生成（Atomic Task Generating）**

流水线的第二步是通过**原子化任务生成器**（`AtomTaskGenerator`）根据场景主题生成对应的原子化任务。

**功能:**

* 生成场景对应的原子化任务。

**输入**: 对话场景
**输出**: 对应的原子化任务

```python
atom_task_generator = AtomTaskGenerator(
    llm_serving=self.llm_serving
    )
```

#### 3.2 **序列任务生成（Sequential Task Generating）**

流水线的第三步是通过**序列任务生成器**（`SequentialTaskGenerator`）根据之前生成的原子化任务生成它的后继任务，并将他们组合成复杂任务。

**功能:**

* 生成后继任务和复杂组合任务。

**输入**: 原子化任务
**输出**: 后继原子化任务，组合任务

```python
sequential_task_generator = SequentialTaskGenerator(
    llm_serving=self.llm_serving
    )
```

#### 3.3 **组合任务过滤（Composition Task Filtering）**

流水线的第四步是通过**组合任务过滤器**（`CompositionTaskFilter`）对组合任务及其子任务的完备性进行验证，并对不符合要求的任务进行过滤。

**功能:**

* 验证组合任务的完备性

**输入**: 原始组合任务
**输出**: 完备的组合任务

```python
composition_task_filter = CompositionTaskFilter(
    llm_serving=self.llm_serving
    )
```

### 4. **函数生成（Function Generating）**

#### 4.1 **任务需求函数生成（Function Generating）**

流水线的第五步是通过**函数生成器**（`FunctionGenerator`）根据输入的组合任务生成所需函数工具。

**功能:**

* 生成场景对应的原子化任务。

**输入**: 组合任务
**输出**: 任务所需函数工具

```python
function_generator = FunctionGenerator(
    llm_serving=self.llm_serving
    )
```

### 5. **多轮对话生成（Multi-turn Conversation Generating）**

#### 5.1 **多智能体多轮对话生成（Multi-agent Multi-turn Conversation Generating）**

流水线的最后一步是通过**多轮对话生成器**（`MultiTurnConversationGenerator`）根据输入的任务和函数工具，生成由用户，助理，工具三个智能体生成的多轮对话。

**功能:**

* 生成包含函数工具调用的多轮对话数据。

**输入**: 组合任务和函数工具
**输出**: 多轮对话

```python
multi_turn_conversations_generator = MultiTurnConversationGenerator(
    llm_serving=self.llm_serving
    )
```

## 3. 运行方式

在`DataFlow`项目路径之外新建工作文件夹，例如`workspace`，并在其中运行`dataflow init`。该操作会将流水线及示例数据复制到工作文件夹中，切换到路径`api_pipelines/`即可执行流水线。

```bash
cd workspace
dataflow init
cd api_pipelines/
python func_call_synthesis.py 
```

## 4. 流水线示例

```python
from dataflow.utils.storage import FileStorage
from dataflow.serving import APILLMServing_request
from dataflow.operators.conversations import (
    ScenarioExtractor,
    ScenarioExpander,
    AtomTaskGenerator,
    SequentialTaskGenerator,
    ParaSeqTaskGenerator,
    CompositionTaskFilter,
    FunctionGenerator,
    MultiTurnConversationGenerator
)

class FuncCallPipeline:
    def __init__(self):

        self.storage = FileStorage(
            first_entry_file_name="../example_data/FuncCallPipeline/chat_data.jsonl",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl",
        )
      
        self.llm_serving = APILLMServing_request(
                api_url="http://123.129.219.111:3000/v1/chat/completions",
                model_name="gpt-4o",
                max_workers=128
        )
        
        self.scenario_extractor = ScenarioExtractor(llm_serving=self.llm_serving)
        self.scenario_expander = ScenarioExpander(llm_serving=self.llm_serving)
        self.atom_task_generator = AtomTaskGenerator(llm_serving=self.llm_serving)
        self.sequential_task_generator = SequentialTaskGenerator(llm_serving=self.llm_serving)
        self.parallel_sequential_stak_generator = ParaSeqTaskGenerator(llm_serving=self.llm_serving)
        self.composition_task_filter = CompositionTaskFilter(llm_serving=self.llm_serving)
        self.function_generator = FunctionGenerator(llm_serving=self.llm_serving)
        self.multi_turn_conversations_generator = MultiTurnConversationGenerator(llm_serving=self.llm_serving)

    def run(self):
       self.scenario_extractor.run(
           self.storage.step(),
           input_chat_key="chat"
       )
       self.atom_task_generator.run(
           self.storage.step(),
           input_scenario_key="scenario"
       )
       self.sequential_task_generator.run(
           self.storage.step(),
           input_task_key="atom_task"
       )
       self.composition_task_filter.run(
           self.storage.step(),
           input_composition_task_key="composition_task",
           input_sub_tasks_keys=["atom_task", "subsequent_task"]
       )
       self.function_generator.run(
           self.storage.step(),
           input_composition_task_key="composition_task",
           input_sub_tasks_keys=["atom_task", "subsequent_task"]
       )
       self.multi_turn_conversations_generator.run(
           self.storage.step(),
           input_task_key="composition_task",
           input_sub_tasks_keys=["atom_task", "subsequent_task"],
           input_functions_key="functions",
        )
    

if __name__ == "__main__":
    pipeline = FuncCallPipeline()
    pipeline.run()
```