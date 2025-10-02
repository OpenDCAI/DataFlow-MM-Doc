---
title: 知识库清洗流水线
icon: fa6-regular:bookmark
createTime: 2025/06/16 13:08:42
permalink: /zh/guide/kbcpipeline/
---
# 知识库清洗及QA合成流水线

## 1. 概述

知识库清洗流水线的核心目标是对于用户提供的格式异构、信息噪声高的原始文档，提供**端到端的**信息提取、规范化以及必要元信息的生成服务。这样提取出的数据可以直接用于RAG、预训练，以及众多大模型下游任务。在此基础上，流水线通过滑动窗口的方式，把清洗好的知识转化成一组Multi-Hop QA。根据[MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD)的实验，这种QA格式的知识更有利于RAG准确推理。

知识库清洗支持的文件格式包括**PDF, Markdown, HTML以及爬取URL**对应的网页信息。

流水线的主要流程包括：

1. 信息提取：借助[MinerU](https://github.com/opendatalab/MinerU), [trafilatura](https://github.com/adbar/trafilatura)等工具从原始文档中提取文本信息。
2. 文本分段：借助[chonkie](https://github.com/chonkie-inc/chonkie)将文本切分成片段，支持通过Token，字符，句子等分段方式。
3. 知识清洗：从冗余标签，格式错误，屏蔽隐私信息和违规信息等角度对原始文本信息进行清洗，使文本信息更加清洁可用。
4. QA构建：利用长度为三个句子的滑动窗口，将清洗好的知识库转写成一系列需要多步推理的QA，更有利于RAG准确推理。

## 2. 流水线设计

### 1. 信息提取

流水线第一步是通过FileOrURLToMarkdownConverter从用户原始文档或URL中提取文本知识。此步骤至关重要，它将各种格式的原始文档提取成统一的markdown格式文本，方便后续清洗步骤进行。

> *由于 `MinerU` 主要基于 `SGLang` 进行部署，`open-dataflow[minerU]` 环境主要基于 `Dataflow[SGLang]` 进行处理，文未有基于 `Dataflow[vllm]` 的处理教程。*

```shell
conda create -n dataflow python=3.10
conda activate dataflow
git clone https://github.com/OpenDCAI/DataFlow.git
cd DataFlow
pip install -e .[mineru]
```

本系统中PDF文件的提取基于[MinerU](https://github.com/opendatalab/MinerU),需进行额外配置，用户可通过如下方式配置。

> #### 使用本地模型
>
> 为了在本地运行 `MinerU` 模型，您需要先将它们下载到本地存储。`MinerU` 提供了一个交互式命令行工具来简化此过程。
>
> #### 1. 下载工具指引：
>
> 您可以使用以下命令查看模型下载工具的帮助信息：
>
> ```bash
> mineru-models-download --help
> ```
>
> #### 2. 启动模型下载：
>
> 执行以下命令开始下载过程：
>
> ```bash
> mineru-models-download
> ```
>
> 在下载过程中，您将看到以下交互式提示：
>
> * **选择模型下载源**：
>
>   ```bash
>   Please select the model download source: (huggingface, modelscope) [huggingface]:
>   ```
>
>   *建议您选择 `modelscope` 作为下载源，以获取更优的下载体验。*
> * **选择`MinerU` 版本**：
>
>   `MinerU1`为`pipeline`形式解析，速度较慢，显存要求低。
>   `MinerU2`为`vlm`形式解析，速度较快，显存要求高。
>
>   用户可以按需自由选择想使用的MinerU解析版本然后下载到本地。
>
>   <table>
>     <tbody>
>       <tr>
>         <td>解析后端</td>
>         <td>pipeline</td>
>         <td>vlm-sglang</td>
>       </tr>
>       <tr>
>         <td>操作系统</td>
>         <td>Linux / Windows / macOS</td>
>         <td>Linux / Windows (via WSL2)</td>
>       </tr>
>       <tr>
>         <td>CPU推理支持</td>
>         <td>✅</td>
>         <td colspan="2">❌</td>
>       </tr>
>       <tr>
>         <td>GPU要求</td>
>         <td>Turing及以后架构，6G显存以上或Apple Silicon</td>
>         <td colspan="2">Turing及以后架构，8G显存以上</td>
>       </tr>
>       <tr>
>         <td>内存要求</td>
>         <td colspan="3">最低16G以上，推荐32G以上</td>
>       </tr>
>       <tr>
>         <td>磁盘空间要求</td>
>         <td colspan="3">20G以上，推荐使用SSD</td>
>       </tr>
>       <tr>
>         <td>python版本</td>
>         <td colspan="3">3.10-3.13</td>
>       </tr>
>     </tbody>
>   </table>
>
>   ```bash
>   Please select the model type to download: (pipeline, vlm, all) [all]:
>   ```
>
>   *建议您选择 `vlm` (MinerU2) 版本，因为它提供了更快的解析速度。如果您对显存有严格要求或偏好传统流水线处理，可以选择 `pipeline` (MinerU1)。您也可以选择 `all` 来下载所有可用版本。*
>
> #### 3. 模型路径配置
>
> `mineru.json` 配置文件会在您首次使用 `mineru-models-download` 命令时自动生成。模型下载完成后，其本地路径将会在当前终端窗口显示，并自动写入您用户目录下的 `mineru.json` 文件中，方便后续使用。
>
> #### 4. MinerU环境验证
>
> 最简单的命令行调用方式来进行环境验证:
>
> ```bash
> mineru -p <input_path> -o <output_path> -b <MinerU_Backend> --source local
> ```
>
> * `<input_path>`：本地 PDF/图片文件或目录（`./demo.pdf`或`./image_dir`）
> * `<output_path>`：输出目录
> * `<mineru_backend>`：MinerU 版本的选择接口，使用`MinerU2`，请将 `MinerU_Backend` 参数设置为 `"vlm-sglang-engine"`；使用 `MinerU1`：请将 `MinerU_Backend` 参数设置为 `"pipeline"`。
>
> #### 5. 工具使用
>
> `FileOrURLToMarkdownConverter` 算子提供了 MinerU 版本的选择接口，允许用户根据需求选择合适的后端引擎。
>
> * 如果用户使用 `MinerU1`：请将 `MinerU_Backend` 参数设置为 `"pipeline"`。这将启用传统的流水线处理方式。
> * 如果用户使用 `MinerU2` **(默认推荐)**：请将 `MinerU_Backend` 参数设置为 `"vlm-sglang-engine"`。这将启用基于多模态语言模型的新引擎。
>
> ```bash
> self.knowledge_cleaning_step1 = FileOrURLToMarkdownConverter(
>    intermediate_dir="../example_data/KBCleaningPipeline/raw/",
>    lang="en",
>    mineru_backend="vlm-sglang-engine",
>    raw_file = raw_file,
> )
> ```
>
> 🌟**更多详情**：有关 MinerU 的详细信息，请参考其 GitHub 仓库：[MinerU官方文档](https://github.com/opendatalab/MinerU)。

**输入**：原始文档文件或URL（使用MinerU2） **输出**：提取后的markdown文本

**示例**：

```python
file_to_markdown_converter = FileOrURLToMarkdownConverter(
    intermediate_dir="../example_data/KBCleaningPipeline/raw/",
    lang="en",
    mineru_backend="vlm-sglang-engine",
    raw_file = raw_file,
)
extracted=file_to_markdown_converter.run(
    storage=self.storage,
)
```

### 2. 文本分块

文档被提取之后，文本分块(KBCChunkGenerator)步骤将提取中的长文本切分成块，系统支持通过token, character, sentence, semantic维度进行分块。

**输入**：提取后的Markdown文本 **输出**：分块后的json文件

**示例**：

```python
text_splitter = KBCChunkGenerator(
    split_method="token",
    chunk_size=512,
    tokenizer_name="Qwen/Qwen2.5-7B-Instruct",
)
text_splitter.run(
    storage=self.storage.step(),
    input_file=extracted,
    output_key="raw_content",
)
```

### 3. 知识清洗

文本被切块之后，知识清洗(KBCTextCleaner)专门用于对RAG（检索增强生成）系统中的原始知识内容进行标准化处理。该过程通过大语言模型接口，实现对非结构化知识的智能清洗和格式化，提升知识库的准确性和可读性。

**输入**：分块后的json文件 **输出**：清洗后的json文件

```python
knowledge_cleaner = KBCTextCleaner(
    llm_serving=api_llm_serving,
    lang="en"
)
extracted_path = knowledge_cleaner.run(
  storage=self.storage.step(),
  input_key= "raw_content",
  output_key="cleaned",
)
```

### 4. QA生成

知识被清洗之后，多跳QA合成(KBCMultiHopQAGenerator)专门用于从文本数据中自动生成需要多步推理的问题-答案对。该过程通过大语言模型接口，实现对文本的智能分析和复杂问题构建，适用于构建高质量的多跳问答数据集。根据[MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD)的实验，这种QA格式的知识更有利于RAG准确推理。

**输入**：json格式的普通文本

**输出**：针对每一条文本合成一组多跳问答 输出json格式

**使用示例**：

```python
multi_hop_qa_generator = KBCMultiHopQAGenerator(
    llm_serving=local_llm_serving,
    lang="en"
)
multi_hop_qa_generator.run(
    storage=self.storage.step(),
    input_key="cleaned",
    output_key="MultiHop_QA"
)
```

### 5. 基于Dataflow[vllm]处理教程

> *由于 `MinerU` 基于最新版本 `SGLang` 部署，故 `Dataflow[vllm]` 应当使用最新版本 `vllm` 进行安装。*

```bash
conda create -n dataflow python=3.10
conda activate dataflow
git clone https://github.com/OpenDCAI/DataFlow.git
cd DataFlow
pip install -e .
pip install -U "mineru[all]"
pip install vllm==0.9.2
pip install "numpy>=1.24,<2.0.0"
```

## 3. 运行示例

用户执行下面的脚本可以满足不用的数据需求，注意gpu_pipelines, api_pipelines, cpu_pipelines下面的脚本分别适用于测试机配有GPU，用户配置了API以及其他情况。

> *其中基于 `Dataflow[vllm]` 可以运行 `gpu_pipelines/*_vllm.py` 脚本，基于 `Dataflow[sglang]` 可以运行 `gpu_pipelines/*_sglang.py` 脚本*

- PDF文件知识库清洗构建

  ```shell
  python gpu_pipelines/kbcleaning/kbcleaning_pipeline_pdf_vllm.py 
  python gpu_pipelines/kbcleaningkbcleaning_pipeline_pdf_sglang.py 
  ```
    [kbcleaning_pipeline_pdf_vllm.py](https://github.com/OpenDCAI/DataFlow/blob/main/dataflow/statics/pipelines/gpu_pipelines/kbcleaning/kbcleaning_pipeline_pdf_vllm.py) 
    [kbcleaning_pipeline_pdf_sglang.py ](https://github.com/OpenDCAI/DataFlow/blob/main/dataflow/statics/pipelines/gpu_pipelines/kbcleaning/kbcleaning_pipeline_pdf_sglang.py)

- URL爬取后知识库清洗构建

  ```shell
  python gpu_pipelines/kbcleaning/kbcleaning_pipeline_url_vllm.py 
  python gpu_pipelines/kbcleaning/kbcleaning_pipeline_url_sglang.py 
  ```
    [kbcleaning_pipeline_url_vllm.py](https://github.com/OpenDCAI/DataFlow/blob/main/dataflow/statics/pipelines/gpu_pipelines/kbcleaning/kbcleaning_pipeline_url_vllm.py)
    [kbcleaning_pipeline_url_sglang.py](https://github.com/OpenDCAI/DataFlow/blob/main/dataflow/statics/pipelines/gpu_pipelines/kbcleaning/kbcleaning_pipeline_url_sglang.py)

## 4. 流水线示例

以下给出基于`Dataflow[vllm]`环境配置的示例流水线，演示如何使用多个算子进行知识库清洗。该示例展示了如何初始化一个知识库清洗流水线，并且顺序执行各个提取和清理步骤。

```python
from dataflow.operators.knowledge_cleaning import (
    KBCChunkGenerator,
    FileOrURLToMarkdownConverter,
    KBCTextCleaner,
    KBCMultiHopQAGenerator,
)
from dataflow.utils.storage import FileStorage
from dataflow.serving import APILLMServing_request

class KBCleaningPDF_APIPipeline():
    def __init__(self, url:str=None, raw_file:str=None):

        self.storage = FileStorage(
            first_entry_file_name="../example_data/KBCleaningPipeline/kbc_placeholder.json",
            cache_path="./.cache/api",
            file_name_prefix="pdf_cleaning_step",
            cache_type="json",
        )

        self.llm_serving = APILLMServing_request(
                api_url="https://api.openai.com/v1/chat/completions",
                model_name="gpt-4o",
                max_workers=100
        )

        self.knowledge_cleaning_step1 = FileOrURLToMarkdownConverter(
            intermediate_dir="../example_data/KBCleaningPipeline/raw/",
            lang="en",
            mineru_backend="vlm-sglang-engine",
            raw_file = raw_file,
        )

        self.knowledge_cleaning_step2 = KBCChunkGenerator(
            split_method="token",
            chunk_size=512,
            tokenizer_name="Qwen/Qwen2.5-7B-Instruct",
        )

        self.knowledge_cleaning_step3 = KBCTextCleaner(
            llm_serving=self.llm_serving,
            lang="en"
        )

        self.knowledge_cleaning_step4 = KBCMultiHopQAGenerator(
            llm_serving=self.llm_serving,
            lang="en"
        )

    def forward(self):
        extracted=self.knowledge_cleaning_step1.run(
            storage=self.storage,
        )
        
        self.knowledge_cleaning_step2.run(
            storage=self.storage.step(),
            input_file=extracted,
            output_key="raw_content",
        )

        self.knowledge_cleaning_step3.run(
            storage=self.storage.step(),
            input_key= "raw_content",
            output_key="cleaned",
        )
        self.knowledge_cleaning_step4.run(
            storage=self.storage.step(),
            input_key="cleaned",
            output_key="MultiHop_QA"
        )
        
if __name__ == "__main__":
    model = KBCleaningPDF_APIPipeline(raw_file="../example_data/KBCleaningPipeline/test.pdf")
    model.forward()
```
