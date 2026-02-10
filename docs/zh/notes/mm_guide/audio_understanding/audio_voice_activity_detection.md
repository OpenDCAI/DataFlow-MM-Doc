---
title: 语音活动检测与切分流水线
createTime: 2025/07/15 21:32:36
icon: material-symbols-light:interpreter-mode
permalink: /zh/mm_guide/dl0jhc6u/
---

## 语音活动检测与切分流水线

该流水线用于对输入音频完成以下处理链路：
- VAD 语音活动检测（Silero VAD）：识别音频中的语音片段区间（start/end 时间戳）；
- 按时间戳切分音频（TimestampChunkRowGenerator）：根据 VAD 结果对音频进行切分（或生成切分后的行），用于后续 ASR、对齐或数据清洗等任务。

## 第一步: 安装环境
见[Audio环境安装](./install_audio_understanding.md)

## 第二步: 导入包
```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import (
    SileroVADGenerator,
    TimestampChunkRowGenerator,
)
```

## 第三步: 按如下格式填写音频路径, 准备需要进行音频转录或翻译的数据
```jsonl
{"audio": ["../example_data/audio_voice_activity_detection_pipeline/test.wav"], "conversation": [{"from": "human", "value": "" }]}
```

## 第四步: 按下述格式将数据路径填入FileStorage中
```python
storage = FileStorage(
    first_entry_file_name="../example_data/audio_voice_activity_detection/sample_data.jsonl",
    cache_path="./cache",
    file_name_prefix="audio_voice_activity_detection",
    cache_type="jsonl",
)
```

## 第五步: 初始化SileroVAD语音活动检测算子
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

## 第六步: 根据时间戳切分音频/生成切分行
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

## 第七步: 执行算子
语音转录文字
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

## 合成数据示例
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
