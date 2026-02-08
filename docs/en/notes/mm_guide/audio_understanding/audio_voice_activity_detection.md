---
title: Voice Activity Detection & Segmentation Pipeline
createTime: 2025/07/15 21:32:36
icon: material-symbols-light:interpreter-mode
permalink: /en/mm_guide/dl0jhc6u/
---

## Voice Activity Detection & Segmentation Pipeline
This pipeline processes input audio through the following steps:
- VAD (Voice Activity Detection) (Silero VAD): Detects speech segments in the audio and outputs speech intervals (start/end timestamps).
- Audio segmentation based on timestamps (TimestampChunkRowGenerator): Splits the audio according to the VAD results (or generates segmented rows), which can be used for downstream tasks such as ASR, alignment, or dataset cleaning.

## Step 1: Install Environment
See [Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Import Relevant Packages
```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import (
    SileroVADGenerator,
    TimestampChunkRowGenerator,
)
```

## Step 3: Fill in the audio path in the following format to prepare data for transcription or translation
```json
{"audio": ["../example_data/audio_voice_activity_detection_pipeline/test.wav"], "conversation": [{"from": "human", "value": "" }]}
```

## Step 4: Put the dataset path into FileStorage using the following format
```python
storage = FileStorage(
    first_entry_file_name="../example_data/audio_voice_activity_detection/sample_data.jsonl",
    cache_path="./cache",
    file_name_prefix="audio_voice_activity_detection",
    cache_type="jsonl",
)
```

## Step 5: Initialize the SileroVAD voice activity detection operator
```python
silero_vad_generator = SileroVADGenerator(
    repo_or_dir="snakers4/silero-vad",
    source="github",
    device=['cuda:0'],
    num_workers=1,
    threshold=0.5,
    sampling_rate=16000,
    max_speech_duration_s=30.0,
    min_silence_duration_s=0.1,
    speech_pad_s=0.03,
    return_seconds=True,
)
```

## Step 6: Split audio / generate segmented rows based on timestamps
```python
timestamp_chunk_row_generator = TimestampChunkRowGenerator(
    dst_folder="./cache",
    timestamp_unit="second",
    mode="split",
    max_audio_duration=30.0,
    hop_size_samples=512,
    sampling_rate=16000,
    num_workers=1,
)
```

## Step 7: Run the operators
```python
silero_vad_generator.run(
    storage=storage.step(),
    input_audio_key='audio',
    output_answer_key='timestamps',
)
silero_vad_generator.close()

timestamp_chunk_row_generator.run(
    storage=storage.step(),
    input_audio_key="audio",
    input_timestamps_key="timestamps",
)
timestamp_chunk_row_generator.close()
```

## Synthetic data example
```json
{"audio":["cache\/test_1.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":1}
{"audio":["cache\/test_2.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":2}
{"audio":["cache\/test_3.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":3}
{"audio":["cache\/test_4.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":4}
{"audio":["cache\/test_5.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":5}
{"audio":["cache\/test_6.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":6}
{"audio":["cache\/test_7.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":7}
{"audio":["cache\/test_8.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":8}
{"audio":["cache\/test_9.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":9}
{"audio":["cache\/test_10.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":10}
{"audio":["cache\/test_11.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":11}
{"audio":["cache\/test_12.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":12}
{"audio":["cache\/test_13.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":13}
{"audio":["cache\/test_14.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":14}
{"audio":["cache\/test_15.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":15}
{"audio":["cache\/test_16.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":16}
{"audio":["cache\/test_17.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":17}
{"audio":["cache\/test_18.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":18}
{"audio":["cache\/test_19.wav"],"original_audio_path":"..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav","sequence_num":19}
```