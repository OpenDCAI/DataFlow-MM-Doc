---
title: General Generate Operators
createTime: 2025/06/24 21:49:55
permalink: /en/guide/text_generate_operators/
---

# Text Data Generation
Currently, Dataflow integrates five text data generators, covering various formats such as pretraining document data, SFT-format data, and multi-turn dialogues.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Applicable Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">PretrainGenerator</td>
      <td class="tg-0pky">Pretrain</td>
      <td class="tg-0pky">Synthesize phi-4 question and answer data pairs using pre trained document data, and retell the document in QA format</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2401.16380">Paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SFTGeneratorSeed</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">Synthesize SFT format QA data pairs based on seed documents and return original information</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">CondorGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">Two-stage synthesis of SFT-format data from scratch based on preset knowledge tree labels (recommend increasing label variety if generating more than 5000 samples)</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2501.12273">paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptedGenerator</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">Generate data based on user-defined prompts</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
          <td class="tg-0pky">ConsistentChatGenerator</td>
          <td class="tg-0pky">Multi-turn Dialogue</td>
          <td class="tg-0pky">Two-stage synthesis of multi-turn dialogue data from scratch based on preset topics and human intents (recommend increasing label variety if generating more than 9000 samples)</td>
          <td class="tg-0pky"><a href="https://arxiv.org/pdf/2506.03558">paper</a></td>
    </tr>


  </tbody>
</table>

## Operator Interface Usage Instructions

Specifically, for operators that specify storage paths or call models, we provide encapsulated **model interfaces** and **storage object interfaces**. You can predefine model API parameters for operators in the following way:

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

You can predefine storage parameters for operators in the following way:

```python
from dataflow.utils.storage import FileStorage

 self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

The `api_llm_serving` and `self.storage` used in the following text are the interface objects defined here. Complete usage examples can be found in `test/test_general_text.py`.

For parameter passing, the constructor of operator objects mainly passes information related to operator configuration, which can be configured once and called multiple times; while the `X.run()` function passes `key` information related to IO. Details can be seen in the operator description examples below.


## Detailed Operator Descriptions

### 1. PretrainGenerator✨

**Function Description:** This operator is specifically designed to generate pretraining format multi-turn dialogue Q&A data based on given document content. It converts raw document content into dialogue format data suitable for language model pretraining by calling large language models to reorganize and express document content.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (required, must implement LLMServingABC interface)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`: Input document content field name (default: "raw_content")
  - `output_key`: Output generated content field name (default: "generated_content")

**Key Features:**

- Supports content conversion for multiple document formats
- Automatically generates dialogue format data suitable for pretraining
- Maintains integrity of core information from original documents
- Supports batch processing of large-scale document data

**Usage Example:**

```python
from dataflow.prompts.general_text import PretrainGeneratorPrompt

pretrain_gen = PretrainGenerator(
          llm_serving=api_llm_serving
          )
result = pretrain_gen.run(
          storage=self.storage.step(),
          input_key="raw_content",
          output_key="generated_content"
          )
```


### 2. SFTGeneratorSeed✨

**Function Description:** This operator generates supervised fine-tuning format Q&A data based on given document content and supports user-defined content generation requirements. It extracts information from raw documents to generate instruction-response pairs in SFT format, particularly suitable for building high-quality supervised fine-tuning datasets.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (required, must implement LLMServingABC interface)
  - `custom_prompt`: User-defined custom prompt (required, defines specific requirements for generated content)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`: Input document content field name (default: "raw_content")

**Key Features:**

- Supports user-defined content generation requirements
- Automatically extracts and parses JSON format instruction-response pairs
- Preserves original document content for traceability
- Intelligently filters invalid generation results
- Supports long text generation up to 4096 tokens

**Output Format:**

- DataFrame containing 'instruction', 'output', and 'raw_content' fields
- Returns list containing 'instruction' and 'output' field names

**Usage Example:**

```python
from dataflow.prompts.general_text import SFTGeneratorSeedPrompt

sft_gen = SFTGeneratorSeed(
          llm_serving=api_llm_serving,
          custom_prompt="Please generate educational Q&A pairs based on document content"
          )
result_keys = sft_gen.run(
          storage=self.storage.step(),
          input_key="raw_content"
          )
```


### 3. CondorGenerator✨🚀

**Function Description:** This operator generates SFT format data from scratch through a two-stage process based on predefined knowledge tree tags. The first stage generates questions of varying difficulty levels (Easy, Medium, Hard) based on randomly selected topics, domains, and theme tags, while the second stage generates corresponding detailed answers for each question.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (required, must implement LLMServingABC interface)
  - `num_samples`: Total number of samples to generate (default: 15, recommended to be less than 5000 to ensure data quality)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)

**Key Features:**

- Two-stage generation process ensures question-answer quality
- Supports three difficulty levels of question generation
- Ensures content diversity based on predefined knowledge tree tags
- Automatically parses and formats generation results
- Intelligent error handling and logging

**Generation Process:**

1. **Question Generation Stage**: Generates three difficulty levels of questions based on randomly selected topic, domain, and theme
2. **Answer Generation Stage**: Generates corresponding detailed answers for each valid question
3. **Data Organization Stage**: Organizes questions and answers into standard SFT format

**Output Format:**

- DataFrame containing 'difficulty', 'instruction', and 'output' fields
- difficulty field identifies question difficulty level (Easy/Medium/Hard)

**Usage Example:**

```python
from dataflow.prompts.general_text import CondorPrompt

condor_gen = CondorGenerator(
          llm_serving=api_llm_serving,
          num_samples=150  # Will generate approximately 150 Q&A pairs
          )
result_df = condor_gen.run(
          storage=self.storage.step()
          )
```

**Important Notes:**

- When generating more than 5000 samples, it is recommended to increase the number of tags in `dataflow.prompts.general_text.CondorPrompt` to improve data richness
- The operator automatically handles failed parsing responses to ensure output data validity


### 4. PromptedGenerator✨

**Function Description:** This operator generates data based on user-provided prompts, combining system prompts and input content to generate desired output text. It provides maximum flexibility, allowing users to fully customize generation logic and output formats.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (required, must implement LLMServingABC interface)
  - `system_prompt`: System prompt defining model behavior (default: "You are a helpful agent.")
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`: Input content field name (default: "raw_content")
  - `output_key`: Output generated content field name (default: "generated_content")

**Key Features:**

- Fully customizable prompt control
- Flexible input-output field configuration
- Supports arbitrary format text generation tasks
- Simple and direct combination of system prompt and input content
- Batch processing capability

**Working Principle:**

1. Directly concatenates system prompt with input content
2. Calls LLM to generate corresponding output content
3. Adds generation results to specified output field

**Usage Example:**

```python
prompted_gen = PromptedGenerator(
          llm_serving=api_llm_serving,
          system_prompt="You are a professional document summarizer. Please generate a concise summary for the following content:"
          )
result_key = prompted_gen.run(
          storage=self.storage.step(),
          input_key="raw_content",
          output_key="summary"
          )
```

### 5. ConsistentChatGenerator ✨

**Description:**  
This operator synthesizes multi-turn dialogue data from scratch using a two-stage process based on predefined topics and user intents. In the first stage, it generates user queries under a specific topic and intent; in the second stage, it produces assistant replies for each query. It is ideal for constructing large-scale dialogue datasets with strong consistency and clearly defined categories.

**Input Parameters:**

- `__init__()`  
  - `llm_serving`: An instance of an LLM interface implementing the `LLMServingABC` protocol (required)  
  - `num_dialogs_per_intent`: Number of dialogues to generate per intent (default: 20, recommended ≤ 1000)  
  - `num_turns_per_dialog`: Number of turns per dialogue (default: 6)  
  - `temperature`: Sampling temperature controlling generation randomness (default: 0.9)  

- `run()`  
  - `storage`: The storage interface object (default: uses predefined context)

**Key Features:**

- Predefined combinations of topics and intents, covering multiple domains  
- Two-stage generation: user queries first, assistant responses second  
- Auto-cleaning of malformed or invalid generations  
- Supports large-scale synthesis (recommended < 9000 dialogues; extend topic tags for more)  
- Generates standardized multi-turn dialogue format compatible with SFT training

**Output Format:**

- A DataFrame with `category` and `conversation` fields  
- The `conversation` field is a list of multi-turn Q&A items. Each turn follows the structure:  
  ```json
  [
    {"role": "user", "value": "question"},
    {"role": "assistant", "value": "answer"},
    ...
  ]

**Usage Example:**
```python
from dataflow.operators.general_text import ConsistentChatGenerator

consistent_gen = ConsistentChatGenerator(
    llm_serving=api_llm_serving,
    num_dialogs_per_intent=30,
    num_turns_per_dialog=4,
    temperature=0.85
)

result_df = consistent_gen.run(
    storage=self.storage.step()
)
```

**Notes:**

When generating more than 9000 dialogues, it is recommended to expand the topic_dict in ConsistentChatPrompt to improve the diversity and coverage of the generated conversations. To ensure high-quality output, the operator automatically skips any malformed or unparseable generations, maintaining a consistent and reliable dialogue structure. During multi-turn conversation generation, the operator invokes the LLM API twice for each dialogue (once for user questions and once for assistant responses), so a stable and responsive LLM service is essential.