---
title: AIGC 图像生成与评估
createTime: 2025/07/15 22:38:45
permalink: /zh/mm_guide/5ub4phag/
icon: basil:lightning-alt-outline
---

# Text-to-Image数据合成流水线

## 1. 概述
**Text-to-Image数据合成流水线**的核心目标是提供最基本的图片获取方式。根据每一个样例提供的图片提示词生成图片，为后续进一步的图片处理提供支持。目前支持两种方式：
- **本地GPU模型**：使用FLUX等本地部署的模型进行文本到图片生成
- **云端API模型**：使用Google Gemini(Nano banana)等云端API进行文本到图片生成

### 支持应用场景

- **文本到图片生成**
  - 根据输入文本生成目标图片
  - 特点：用户获取需要图片最简单的方式

### 支持的模型

**本地GPU模型**：
- FLUX.1-dev

**云端API模型**：
- OpenAI格式：`dall-e-2`, `dall-e-3`, `gpt-image-1`
- Gemini格式：`gemini-2.5-flash-image`, `gemini-3-pro-image-preview` 等

## 2. 快速开始

### 第一步 安装Dataflow-MM环境
```bash
cd ./Dataflow-MM
conda create -n Dataflow-MM python=3.12
pip install -e .
```
接着进行初始化
```bash
dataflowmm init
cd gpu_pipelines/  # 本地GPU模型使用此目录
# 或
cd api_pipelines/  # 云端API模型使用此目录
```

### 第二步 文生图数据准备
我们使用`jsonl`文件来记录数据，下面是一个简单的输入数据样例：
```jsonl
{"conversations": [{"content": "a fox darting between snow-covered pines at dusk", "role": "user"}]}
{"conversations": [{"content": "a kite surfer riding emerald waves under a cloudy sky", "role": "user"}]}
```

数据加载需要定义`FileStorage`:
```python
storage = FileStorage(
   first_entry_file_name="<Your jsonl file path>",
   cache_path="./cache_local/<Your task name>",
   file_name_prefix="dataflow_cache_step",
   cache_type="jsonl"
  )
```

### 第三步 定义文本到图片生成serving

#### 方式一：本地GPU模型
使用本地部署的FLUX模型进行文本到图片生成：
```python
from dataflow.operators.core_vision import PromptedImageGenerator
from dataflow.serving.local_image_gen_serving import LocalImageGenServing
from dataflow.utils.storage import FileStorage
from dataflow.io import ImageIO

t2i_serving = LocalImageGenServing(
    image_io=ImageIO(save_path=os.path.join(storage.cache_path, "images")),
    batch_size=4,
    hf_model_name_or_path="black-forest-labs/FLUX.1-dev",  # 或模型在本地的路径
    hf_cache_dir="./cache_local",
    hf_local_dir="./ckpt/models/",
    diffuser_num_inference_steps=20,
    diffuser_image_height=512,
    diffuser_image_width=512,
)

text_to_image_generator = PromptedImageGenerator(
    t2i_serving=t2i_serving,
    save_interval=10
)
```

#### 方式二：云端API模型
使用云端API进行文本到图片生成（需要设置API密钥）：
```python
import os
from dataflow.operators.core_vision import PromptedImageGenerator
from dataflow.serving.api_image_gen_serving import APIImageGenServing
from dataflow.utils.storage import FileStorage
from dataflow.io import ImageIO

# 设置API密钥（必需）
os.environ["DF_API_KEY"] = "<your_api_key>"
# 可选：设置API基础URL，如果不设置会根据api_format自动选择
# os.environ["DF_BASE_URL"] = "https://api.openai.com/v1"  # OpenAI格式
# os.environ["DF_BASE_URL"] = "https://generativelanguage.googleapis.com"  # Gemini格式

t2i_serving = APIImageGenServing(
    api_url=os.environ.get("DF_BASE_URL", "https://generativelanguage.googleapis.com"),
    image_io=ImageIO(save_path=os.path.join(storage.cache_path, "images")),
    Image_gen_task="text2image",
    batch_size=4,
    api_format="gemini",  # 或"openai"
    model_name="gemini-3-pro-image-preview",  # 根据api_format选择对应模型
    api_key=os.environ["DF_API_KEY"],
)

text_to_image_generator = PromptedImageGenerator(
    t2i_serving=t2i_serving,
    save_interval=10
)
```

运行文本到图片生成器：
```python
text_to_image_generator.run(
    storage=storage.step(),
    input_conversation_key="conversations",
    output_image_key="images",
)
```

### 第四步 运行流水线

#### 本地GPU模型
```bash
cd gpu_pipelines/
python text_to_image_generation_pipeline.py
```

#### 云端API模型
```bash
cd api_pipelines/
export DF_API_KEY=<your_api_key>
export DF_BASE_URL=<your_base_url>
python text_to_image_generation_api_pipeline.py \
    --api_format gemini \
    --model_name gemini-3-pro-image-preview \
    --batch_size 4
```

或者使用OpenAI格式：
```bash
python text_to_image_generation_api_pipeline.py \
    --api_format openai \
    --model_name dall-e-3 \
    --batch_size 4
```

## 3. 输出数据
- **格式**：`jsonl` 
- **字段说明**：
  - `conversations`: 包含图片生成描述
  - `images`: 包含被生成的图片
- **示例**：
  ```jsonl
  {
    "conversations": [{"content": "The woman is dancing with the prince in a sacred ballroom.", "role": "user"}],
    "images": ["./dataflow/example/text_to_image_generation/images/image3.png"], 
  }
  ```


## 5. 流水线示例

### 示例一：本地GPU模型流水线
下面给出使用本地FLUX模型的文本到图片生成流水线示例：
```python
import os
from pathlib import Path
from dataflow.operators.core_vision import PromptedImageGenerator
from dataflow.serving.local_image_gen_serving import LocalImageGenServing
from dataflow.utils.storage import FileStorage
from dataflow.io import ImageIO


class ImageGenerationPipeline():
    def __init__(self):
        current_file = Path(__file__).resolve()
        project_root = current_file.parent.parent.parent.parent.parent
        
        prompts_file = project_root / "dataflow" / "example" / "image_gen" / "text2image" / "prompts.jsonl"
        
        self.storage = FileStorage(
            first_entry_file_name=str(prompts_file),
            cache_path="./cache_local/text2image_local",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl"
        )

        image_save_path = str(project_root / "cache_local" / "text2image_local")
        
        self.serving = LocalImageGenServing(
            image_io=ImageIO(save_path=image_save_path),
            batch_size=4,
            hf_model_name_or_path="black-forest-labs/FLUX.1-dev",
            hf_cache_dir="./cache_local",
            hf_local_dir="./ckpt/models/",
            diffuser_num_inference_steps=20,
            diffuser_image_height=512,
            diffuser_image_width=512,
        )

        self.text_to_image_generator = PromptedImageGenerator(
            t2i_serving=self.serving,
            save_interval=10
        )
    
    def forward(self):
        self.text_to_image_generator.run(
            storage=self.storage.step(),
            input_conversation_key="conversations",
            output_image_key="images",
        )

if __name__ == "__main__":
    model = ImageGenerationPipeline()
    model.forward()
```

### 示例二：云端API模型流水线
下面给出使用云端API的文本到图片生成流水线示例：
```python
import os
import argparse
from pathlib import Path
from dataflow.operators.core_vision import PromptedImageGenerator
from dataflow.serving.api_image_gen_serving import APIImageGenServing
from dataflow.utils.storage import FileStorage
from dataflow.io import ImageIO


class ImageGenerationAPIPipeline():
    """
    Text to Image Generation API Pipeline
    Supported Models:
        OpenAI format (api_format="openai"): dall-e-2, dall-e-3, gpt-image-1
        Gemini format (api_format="gemini"): gemini-2.5-flash-image, gemini-3-pro-image-preview, etc.
    """
    def __init__(
        self, 
        api_format="gemini",
        model_name="gemini-3-pro-image-preview",
        batch_size=4,
        first_entry_file_name=None,
        cache_path="./cache_local/text2image_api",
    ):
        current_file = Path(__file__).resolve()
        project_root = current_file.parent.parent.parent.parent.parent
        
        if first_entry_file_name is None:
            data_file = project_root / "dataflow" / "example" / "image_gen" / "text2image" / "prompts.jsonl"
            first_entry_file_name = str(data_file)
        
        self.storage = FileStorage(
            first_entry_file_name=first_entry_file_name,
            cache_path=cache_path,
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl"
        )
        
        api_key = os.environ.get("DF_API_KEY")
        api_url = os.environ.get("DF_BASE_URL")
        
        if api_key is None:
            raise ValueError("API key is required. Please set it via environment variable DF_API_KEY")
        
        if api_url is None:
            if api_format == "gemini":
                api_url = "https://generativelanguage.googleapis.com"
            else:
                api_url = "https://api.openai.com/v1"
        
        image_save_path = str(project_root / "cache_local" / "text2image_api")
        
        self.serving = APIImageGenServing(
            api_url=api_url,
            image_io=ImageIO(save_path=image_save_path),
            Image_gen_task="text2image",
            batch_size=batch_size,
            api_format=api_format,
            model_name=model_name,
            api_key=api_key,
        )

        self.text_to_image_generator = PromptedImageGenerator(
            t2i_serving=self.serving,
            save_interval=10
        )
    
    def forward(self):
        self.text_to_image_generator.run(
            storage=self.storage.step(),
            input_conversation_key="conversations",
            output_image_key="images",
        )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud API Image Generation Pipeline")
    parser.add_argument('--api_format', choices=['openai', 'gemini'], default='gemini',
                        help='API format type: openai (OpenAI DALL-E) or gemini (Google Gemini)')
    parser.add_argument('--model_name', type=str, default='gemini-3-pro-image-preview',
                        help='Model name')
    parser.add_argument('--batch_size', type=int, default=4, help='Batch size')
    parser.add_argument('--first_entry_file_name', type=str, default=None,
                        help='Input data file path (default uses example_data)')
    parser.add_argument('--cache_path', type=str, default="./cache_local/text2image_api",
                        help='Cache path')
    args = parser.parse_args()
    
    if not os.environ.get("DF_API_KEY"):
        parser.error("Environment variable DF_API_KEY is not set. Please use export DF_API_KEY=your_api_key to set it")
    
    model = ImageGenerationAPIPipeline(
        api_format=args.api_format,
        model_name=args.model_name,
        batch_size=args.batch_size,
        first_entry_file_name=args.first_entry_file_name,
        cache_path=args.cache_path,
    )
    model.forward()
```