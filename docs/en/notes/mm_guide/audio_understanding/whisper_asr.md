---
title: 使用Whisper进行语音转录或翻译
createTime: 2025/07/15 21:32:36
icon: material-symbols-light:interpreter-mode
permalink: /en/mm_guide/dl0jhc6u/
---

## 使用Whisper进行语音转录或翻译

## 第一步: 准备Dataflow环境
```bash
conda create -n myvenv python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## 第二步: 安装Dataflow音频模块
```bash
pip install open-dataflow[audio]
```

## 第三步: 启动本地模型服务
本地模型调用服务方法如下:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/whisper-large-v3", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=None,
    vllm_gpu_memory_utilization=0.7
)
```

## 第四步: 按如下格式填写音频路径, 准备需要进行音频转录或翻译的数据
```jsonl
{"audio": ["your_audio_path"]}
```

## 第五步: 按下述格式将数据路径填入FileStorage中
```python
storage = FileStorage(
    first_entry_file_name="your_path",
    cache_path="./cache",
    file_name_prefix="whisper_transcription",
    cache_type="jsonl",
    media_key="audio",
    media_type="audio"
)
```

## 第六步: 初始化WhisperTranscriptionGenerator算子
```python
generator = WhisperTranscriptionGenerator(self.llm_serving)
```

## 第七步: 执行算子
语音转录文字
```python
generator.run(
    storage=self.storage.step(), 
    task="transcribe",              # 表明当前任务是语音转录
    language="mandarin",            # 语音的语言, 默认为"english"
    use_no_time_stamps=True,        # 是否使用无时间戳的输出格式, 默认为True
    output_key="transcription"      # 输出结果的key
)
```

语音翻译, 将语音中的语言翻译为英文
```python
generator.run(
    storage=self.storage.step(), 
    task="translate",               # 表明当前任务是语音翻译
    language="mandarin",            # 语音的语言, 默认为"english"
    use_no_time_stamps=True,        # 是否使用无时间戳的输出格式, 默认为True
    output_key="transcription"      # 输出结果的key
)
```