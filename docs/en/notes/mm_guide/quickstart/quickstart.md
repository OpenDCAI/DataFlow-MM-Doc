---
title: Quick Start
createTime: 2025/06/30 19:19:16
permalink: /en/mm_guide/quickstart/
icon: solar:flag-2-broken
---

# Quick Start
DataFlow employs a "code generation" paradigm similar to that of [`create-react-app`](https://github.com/facebook/create-react-app) or [`vue-cli`](https://cli.vuejs.org/). This means that, through command-line invocation, it automatically generates the necessary scripts and entry Python files. After customizing these files (for example, by changing the dataset, using different large model APIs, or re-tuning operators), you can run the Python file to execute the corresponding functions.

Specifically, after successfully installing DataFlow as described in the previous section, please find an empty working directory to get started with DataFlow. Navigate to this directory and execute:
```shell
dataflow init
```

This command will generate three folders named `cpu`, `api`, and `gpu`, as well as an `example_data` folder for storing default sample data, in your current working directory.

Each of our pre-configured Pipelines is provided in three modes, placed in these three folders respectively. They are categorized based on the resource types required by the operators in the Pipeline, as shown in the table below:

| User Category | Operators that only require CPU | Operators that require a large model API | Operators that require a locally deployed GPU |
|:--------------:|:-------------------------------:|:-----------------------------------------:|:---------------------------------------------:|
|`cpu`| √       |                                 |                                           |
|`api`| √       | √                               |                                           |
|`gpu`| √       | √                               | √                                         |

The **same-named** Pipelines in different folders have an inclusive relationship. Specifically, the Pipeline in the `gpu` folder is the most comprehensive, containing all the functions. Removing the operators that require a locally deployed GPU model results in the Pipeline in the `api` folder. Further removing the operators that require a large model backend results in the Pipeline in the `cpu` folder.

Notably, the `api` Pipeline can be modified to use a locally deployed GPU model (such as Qwen-3, llama, etc.) by changing the `LLMServing` within it. Compared to the `gpu` Pipeline, the operators removed in the `api` Pipeline are mainly those that call unconventional LLM models which cannot be deployed using the `vllm` backend.

Subsequently, by navigating to the corresponding path, you can access the Python files corresponding to our pre-configured Pipelines.

For these files, the default input dataset is stored in the `json` file within the `example_data` folder. You can change the `first_entry_file_name` field in the `storage` class to point it to your raw dataset.
```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/AgenticRAGPipeline/pipeline_small_chunk.json",
    cache_path="./cache_local", # Cache path
    file_name_prefix="dataflow_cache_step", # Prefix for cache file names
    cache_type="json",  # File type for intermediate cache files
)
```

Additionally, you may need to modify the `LLMServing` class according to your device or the `api_url` you possess, in order to use a locally downloaded model or an online large model API.

If you are using the API method, you need to export the `api_key` field to the environment variable. On Linux, this can be done using:

```bash
export api_key=sh-xxxxx
```

On Windows, you can set the environment variable using the following command:

```cmd
set api_key=sh-xxxxx
```

Or in PowerShell:

```powershell
$env:api_key = "sh-xxxxx"
```

After setting this, the program can read the API key from the environment for invocation. Be sure not to expose the key in public code.

Once you have modified the Python script, you can run it to experience DataFlow's comfortable data governance capabilities:
```shell
python reasoning_pipeline.py
```