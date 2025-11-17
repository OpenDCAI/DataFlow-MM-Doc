---
title: Using Whisper for Speech Transcription or Translation
createTime: 2025/07/15 21:32:36
icon: material-symbols-light:interpreter-mode
permalink: /en/mm_guide/dl0jhc6u/
---

## Using Whisper for Speech Transcription or Translation

## Step 1: Install Environment
See [ Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Start the Local Model Service
The method for launching the local model serving service is as follows:
```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="./models/whisper-large-v3", # set to your own model path
    vllm_tensor_parallel_size=2,
    vllm_max_tokens=None,
    vllm_gpu_memory_utilization=0.7
)
```

## Step 3: Prepare the Audio Data for Transcription or Translation
Fill in the audio paths in the following format:
```jsonl
{"audio": ["your_audio_path"]}
```

## Step 4: Add the Data Path to FileStorage
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

## Step 5: Initialize the WhisperTranscriptionGenerator Operator
```python
generator = WhisperTranscriptionGenerator(self.llm_serving)
```

## Step 6: Execute the Operator
Speech Transcription
```python
generator.run(
    storage=self.storage.step(), 
    task="transcribe",              # Indicates that the task is speech transcription
    language="mandarin",            # Spoken language in the audio; default is "english"
    use_no_time_stamps=True,        # Whether to use the no-timestamp format; default is True
    output_key="transcription"      # Key for the output result
)
```

Speech Translation (translate audio content into English)
```python
generator.run(
    storage=self.storage.step(), 
    task="translate",               # Indicates that the task is speech translation
    language="mandarin",            # Spoken language in the audio; default is "english"
    use_no_time_stamps=True,        # Whether to use the no-timestamp format; default is True
    output_key="transcription"      # Key for the output result
)
```