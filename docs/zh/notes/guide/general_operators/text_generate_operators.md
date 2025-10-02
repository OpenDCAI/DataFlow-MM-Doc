---
title: 通用文本数据合成算子
createTime: 2025/06/24 21:49:55
permalink: /zh/guide/lo3cyadt/
---

# 文本数据合成

目前Dataflow集成了五种基础文本数据合成器，涉及预训练文档数据、SFT格式数据、多轮对话等不同格式。

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">适用类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">PretrainGenerator</td>
      <td class="tg-0pky">预训练</td>
      <td class="tg-0pky">使用预训练文档数据合成类phi-4问答数据对，使用QA格式复述文档</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2401.16380">Paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SFTGeneratorSeed</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">根据种子文档合成SFT格式QA数据对，并返回原文信息</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">CondorGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">根据预置知识树标签，两阶段从0合成SFT格式数据（合成数量大于5000时建议增加标签数量）</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2501.12273">paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptedGenerator</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">根据用户自定义prompt进行数据生成</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">ConsistentChatGenerator</td>
      <td class="tg-0pky">多轮对话</td>
      <td class="tg-0pky">根据预置主题和人类意图，两阶段从0合成多轮对话格式数据（合成数量大于9000时建议增加标签数量）</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2506.03558">paper</a></td>
    </tr>
  </tbody>
</table>

## 算子接口调用说明

特别地，对于指定存储路径等或是调用模型的算子，我们提供了封装后的**模型接口**以及**存储对象接口**，可以通过以下方式为算子进行模型API参数预定义：

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```
可以通过以下方式为算子进行存储参数预定义：

```python
from dataflow.utils.storage import FileStorage

 self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

后文使用的`api_llm_serving`以及`self.storage`即为此处已定义的接口对象，完整调用示例可参考`test/test_general_text.py`。

对于传参，算子对象的构造函数主要传递与算子配置相关的信息，配置后可以一配置多调用；而`X.run()`函数传递与IO相关的`key`信息，详细可见后文算子说明示例。


## 详细算子说明

### 1. PretrainGenerator✨

**功能描述：** 该算子专门用于基于给定文档内容，生成预训练格式的多轮对话问答数据。将原始文档内容转换为适合语言模型预训练的对话格式数据，通过调用大语言模型进行文档内容的重新组织和表达。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现LLMServingABC接口）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入文档内容字段名（默认："raw_content"）
  - `output_key`：输出生成内容字段名（默认："generated_content"）

**主要特性：**

- 支持多种文档格式的内容转换
- 自动生成适合预训练的对话格式数据
- 保持原始文档的核心信息完整性
- 支持批量处理大规模文档数据

**使用示例：**

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

**功能描述：** 该算子基于给定文档内容，生成监督微调格式的问答数据，并支持用户自定义生成内容要求。从原始文档中提取信息，生成符合SFT格式的指令-响应对，特别适用于构建高质量的监督微调数据集。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现LLMServingABC接口）
  - `custom_prompt`：用户自定义提示词（必需，定义生成内容的具体要求）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入文档内容字段名（默认："raw_content"）

**主要特性：**

- 支持用户自定义生成内容要求
- 自动提取和解析JSON格式的指令-响应对
- 保留原始文档内容用于追溯
- 智能过滤无效生成结果
- 支持最大4096 tokens的长文本生成

**输出格式：**

- 包含'instruction'、'output'和'raw_content'字段的DataFrame
- 返回包含'instruction'和'output'字段名的列表

**使用示例：**

```python
from dataflow.prompts.general_text import SFTGeneratorSeedPrompt

sft_gen = SFTGeneratorSeed(
          llm_serving=api_llm_serving,
          custom_prompt="请基于文档内容生成教学问答对"
          )
result_keys = sft_gen.run(
          storage=self.storage.step(),
          input_key="raw_content"
          )
```


### 3. CondorGenerator✨🚀

**功能描述：** 该算子基于预置知识树标签，通过两阶段流程从零合成SFT格式数据。第一阶段根据随机选择的主题、领域和主题标签生成不同难度级别（Easy、Medium、Hard）的问题，第二阶段为每个问题生成对应的详细答案。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现LLMServingABC接口）
  - `num_samples`：生成样本总数（默认：15，建议小于5000以保证数据质量）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）

**主要特性：**

- 两阶段生成流程确保问答质量
- 支持三个难度级别的问题生成
- 基于预置知识树标签保证内容多样性
- 自动解析和格式化生成结果
- 智能错误处理和日志记录

**生成流程：**

1. **问题生成阶段**：根据随机选择的topic、domain、theme生成三个难度级别的问题
2. **答案生成阶段**：为每个有效问题生成对应的详细答案
3. **数据整理阶段**：将问题和答案组织成标准SFT格式

**输出格式：**

- 包含'difficulty'、'instruction'和'output'字段的DataFrame
- difficulty字段标识问题难度级别（Easy/Medium/Hard）

**使用示例：**

```python
from dataflow.prompts.general_text import CondorPrompt

condor_gen = CondorGenerator(
          llm_serving=api_llm_serving,
          num_samples=150  # 将生成约150个问答对
          )
result_df = condor_gen.run(
          storage=self.storage.step()
          )
```

**注意事项：**

- 当生成数量大于5000时，建议在`dataflow.prompts.general_text.CondorPrompt`中增加标签数量以提高数据丰富性
- 算子会自动处理解析失败的响应，确保输出数据的有效性


### 4. PromptedGenerator✨

**功能描述：** 该算子基于用户提供的提示词（prompt）生成数据，结合系统提示词和输入内容生成符合要求的输出文本。提供了最大的灵活性，允许用户完全自定义生成逻辑和输出格式。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现LLMServingABC接口）
  - `system_prompt`：系统提示词，定义模型行为（默认："You are a helpful agent."）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入内容字段名（默认："raw_content"）
  - `output_key`：输出生成内容字段名（默认："generated_content"）

**主要特性：**

- 完全自定义的提示词控制
- 灵活的输入输出字段配置
- 支持任意格式的文本生成任务
- 简单直接的系统提示词与输入内容组合
- 批量处理能力

**工作原理：**

1. 将系统提示词与输入内容直接拼接
2. 调用LLM生成对应的输出内容
3. 将生成结果添加到指定的输出字段

**使用示例：**

```python
prompted_gen = PromptedGenerator(
          llm_serving=api_llm_serving,
          system_prompt="你是一个专业的文档摘要生成器，请为以下内容生成简洁的摘要："
          )
result_key = prompted_gen.run(
          storage=self.storage.step(),
          input_key="raw_content",
          output_key="summary"
          )
```

### 5. ConsistentChatGenerator ✨

**功能描述：**  
该算子基于预置主题和人类意图，通过两阶段流程从零合成多轮对话格式数据。第一阶段生成特定主题和意图下的多轮用户提问，第二阶段为每轮问题生成对应回复。适用于构建一致性强、类别明确的大规模对话语料。

**输入参数：**

- `__init__()`  
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现 LLMServingABC 接口）  
  - `num_dialogs_per_intent`：每个意图生成的对话数量（默认：20，建议不超过1000）  
  - `num_turns_per_dialog`：每个对话包含的轮次数量（默认：6）  
  - `temperature`：生成温度，控制采样随机性（默认：0.9）  

- `run()`  
  - `storage`：存储接口对象（默认：前文预设值）

**主要特性：**

- 预置主题与意图组合，覆盖多领域场景  
- 两阶段生成：先生成用户问题，再生成对应回答  
- 自动清洗格式错误及无效结果  
- 支持大规模批量合成（推荐数量 < 9000，超过建议扩展主题标签）  
- 生成标准的多轮对话格式，适配常见 SFT 训练任务

**输出格式：**

- 包含 `category` 和 `conversation` 字段的 DataFrame  
- `conversation` 字段为多轮问答组成的对话列表，每轮对话结构为：  
  ```json
  [
    {"role": "user", "value": "问题"},
    {"role": "assistant", "value": "回答"},
    ...
  ]

**使用示例：**
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

**注意事项：**

当合成对话的数量超过 9000 条时，建议在 ConsistentChatPrompt 中扩展 topic_dict，以提升生成对话的多样性和覆盖范围。为了保证输出数据的质量，算子会自动跳过格式不合规或无法解析的生成结果，确保最终得到的对话结构清晰、内容合理。在生成多轮对话的过程中，该算子会对每条对话调用两次 LLM 接口（一次生成用户提问，一次生成助手回答），因此需要确保所使用的 LLM 服务稳定、响应迅速。