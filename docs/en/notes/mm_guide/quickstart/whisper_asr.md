---
title: Use Whisper for Speech Transcription or Translation
createTime: 2025/07/15 21:32:12
icon: material-symbols-light:interpreter-mode
permalink: /en/mm_guide/p55dq1rm/
---

## Use Whisper for Speech Transcription or Translation

## Step 1: Prepare the DataFlow environment
```bash
conda create -n myvenv python=3.12
pip install open-dataflow
pip install open-dataflow[vllm]
```

## Step 2: Install the DataFlow audio module
```bash
pip install open-dataflow[audio]
```

## Step 3: Launch the local model service
How to Call the Local Model Service:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/whisper-large-v3", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=None,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 4: Fill in the audio path in the specified format and prepare the data that needs audio transcription or translation.
```jsonl
{"audio": ["your_audio_path"]}
```

## Step 5: Set the data path in FileStorage using the format below.
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

## Step 6: Initialize the WhisperTranscriptionGenerator operator.
```python
generator = WhisperTranscriptionGenerator(self.llm_serving)
```

## Step 7: Run the operator
Speech Transcription
```python
generator.run(
    storage=self.storage.step(), 
    task="transcribe",              # The current task is speech transcription
    language="mandarin",            # The language in the speech (default: english)
    use_no_time_stamps=True,        # Use timestamp-free output format (default: True)
    output_key="transcription"      # The key under which the result will be stored in the output dataframe
)
```

Speech Translation, translate the language in the speech into English.
```python
generator.run(
    storage=self.storage.step(), 
    task="translate",               # The current task is speech translation
    language="mandarin",            # The language in the speech (default: english)
    use_no_time_stamps=True,        # Use timestamp-free output format (default: True)
    output_key="transcription"      # The key under which the result will be stored in the output dataframe
)
```