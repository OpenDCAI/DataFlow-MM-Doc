---
title: Function Calling Data Synthesis Pipeline
icon: solar:flash-drive-outline
createTime: 2025/07/16 17:36:23
permalink: /en/guide/e6kz1s79/
---

# Function Calling Data Synthesis Pipeline

## 1. Overview

The **Function Calling Data Synthesis Pipeline** aims to expand the diversity of existing text datasets by synthesizing multi-turn conversational data with function/tool calls. This provides richer training data for optimizing models on downstream tasks. The pipeline primarily includes steps such as extracting and generating real-world task scenarios, generating and validating tasks, generating functions, and generating multi-agent multi-turn conversations, ultimately producing a conversation dataset for function calling scenarios.

The main process of the pipeline is based on the data synthesis steps proposed in the paper [BUTTON](https://arxiv.org/abs/2410.12952), including:

1.  **Scenario Extraction**: Extracts real-world task scenario information from conversational data and provides a brief description.
2.  **Task Generation, Expansion, and Validation**: Generates atomic tasks based on the extracted scenario information, organizes the atomic tasks into more complex composite tasks, and finally validates the feasibility of the tasks.
3.  **Function Generation**: Generates the necessary function calls based on the composite tasks and their atomic subtasks.
4.  **Multi-agent Multi-turn Conversation Generation**: Generates multi-turn conversational data based on the tasks and their function calls.

## 2. Data Flow and Pipeline Logic

### 1. **Input Data**

The input data for the pipeline needs to include conversational data, such as the data corresponding to the "chat" keyword in the example:

```json
{
    "system": "SYSTEM: You are a helpful assistant with access to the following functions. Use them if required -\n{\n    \"name\": \"get_exchange_rate\",\n    \"description\": \"Get the exchange rate between two currencies\",\n    \"parameters\": {\n        \"type\": \"object\",\n        \"properties\": {\n            \"base_currency\": {\n                \"type\": \"string\",\n                \"description\": \"The currency to convert from\"\n            },\n            \"target_currency\": {\n                \"type\": \"string\",\n                \"description\": \"The currency to convert to\"\n            }\n        },\n        \"required\": [\n            \"base_currency\",\n            \"target_currency\"\n        ]\n    }\n}\n",
    "chat": "USER: Can you book a flight for me from New York to London?\n\n\nASSISTANT: I'm sorry, but I don't have the capability to book flights. My current function allows me to get the exchange rate between two currencies. If you need help with that, feel free to ask! <|endoftext|>\n\n\n"
}
```

This input data can be stored in a specified file (e.g., `json`, `jsonl`) and managed and read by a `FileStorage` object. The example loads the default data path, but the path can be modified as needed for custom data and cache paths in actual use cases:

```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/FuncCallPipeline/chat_data.jsonl",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 2. **Scenario Extracting and Expanding**

#### 2.1 **Scenario Extracting**

The first step of the pipeline is to extract the scenario information of the conversation from the conversational data using the **Scenario Extractor** (`ScenarioExtractor`).

**Functionality:**

  * Extracts conversational scenario information.

**Input**: Raw conversational data
**Output**: A brief conversational scenario

```python
scenario_extractor = ScenarioExtractor(
    llm_serving=self.llm_serving
    )
```

#### 2.2 **Scenario Expanding**

The pipeline provides an optional step: expanding existing scenarios into new ones using the **Scenario Expander** (`ScenarioExpander`).

**Functionality:**

  * Expands conversational scenarios.

**Input**: Original conversational scenario
**Output**: New conversational scenarios

```python
scenario_expander = ScenarioExpander(
    llm_serving=self.llm_serving
    )
```

### 3. **Task Generating, Expanding and Validation**

#### 3.1 **Atomic Task Generating**

The second step of the pipeline is to generate corresponding atomic tasks based on the scenario topic using the **Atomic Task Generator** (`AtomTaskGenerator`).

**Functionality:**

  * Generates atomic tasks corresponding to the scenario.

**Input**: Conversational scenario
**Output**: Corresponding atomic tasks

```python
atom_task_generator = AtomTaskGenerator(
    llm_serving=self.llm_serving
    )
```

#### 3.2 **Sequential Task Generating**

The third step of the pipeline is to generate a successor task for the previously generated atomic task and combine them into a complex task using the **Sequential Task Generator** (`SequentialTaskGenerator`).

**Functionality:**

  * Generates successor tasks and complex composite tasks.

**Input**: Atomic tasks
**Output**: Subsequent atomic tasks, composite tasks

```python
sequential_task_generator = SequentialTaskGenerator(
    llm_serving=self.llm_serving
    )
```

#### 3.3 **Composition Task Filtering**

The fourth step of the pipeline is to validate the completeness of the composite tasks and their subtasks and filter out those that do not meet the requirements using the **Composition Task Filter** (`CompositionTaskFilter`).

**Functionality:**

  * Validates the completeness of composite tasks.

**Input**: Original composite tasks
**Output**: Valid composite tasks

```python
composition_task_filter = CompositionTaskFilter(
    llm_serving=self.llm_serving
    )
```

### 4. **Function Generating**

#### 4.1 **Task Requirement Function Generating**

The fifth step of the pipeline is to generate the required function tools based on the input composite tasks using the **Function Generator** (`FunctionGenerator`).

**Functionality:**

  * Generates the function tools required for the tasks.

**Input**: Composite tasks
**Output**: Required function tools for the tasks

```python
function_generator = FunctionGenerator(
    llm_serving=self.llm_serving
    )
```

### 5. **Multi-turn Conversation Generating**

#### 5.1 **Multi-agent Multi-turn Conversation Generating**

The final step of the pipeline is to generate multi-turn conversations by three agents—User, Assistant, and Tool—based on the input tasks and function tools, using the **Multi-turn Conversation Generator** (`MultiTurnConversationGenerator`).

**Functionality:**

  * Generates multi-turn conversational data that includes function tool calls.

**Input**: Composite tasks and function tools
**Output**: Multi-turn conversations

```python
multi_turn_conversations_generator = MultiTurnConversationGenerator(
    llm_serving=self.llm_serving
    )
```

## 3. How to Run

You can create a new working directory outside the `DataFlow` project path, for example, `workspace`, and run `dataflow init` inside it. This command will copy the pipelines and example data into your working directory. Then, navigate to the `api_pipelines/` path to execute the pipelines.

```bash
cd workspace
dataflow init
cd api_pipelines/
python func_call_synthesis.py 
```

## 4. Pipeline Example

An example pipeline is provided below, demonstrating how to use multiple operators for inference data processing. This example shows how to initialize a function calling data synthesis pipeline and execute each step sequentially.

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