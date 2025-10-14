---
title: MergeChunksByTimestamps
createTime: 2025/10/14 18:26:49
permalink: /en/mm_operators/qlblfsr2/
---


## 📘 Overview
```MergeChunksByTimestamps``` is an operator that merges audio segments based on detected speech activity regions.

## ```__init__```
```python
def __init__(self, num_workers=1):
```

## init Parameters
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| num_workers | int | 1 | Number of worker threads for parallel processing |

## `run`
```python
def run(self,
    storage: DataFlowStorage,
    dst_folder: str,
    input_audio_key: str = "audio",
    input_timestamps_key: str = "timestamps",
    timestamp_type: Literal["frame", "time"] = "time",
    max_audio_duration: float = float('inf'),
    hop_size_samples: int = 512, 
    sampling_rate: int = 16000,
)
```
Executes the main logic of the operator. It reads the input DataFrame from storage, merges audio segments according to speech timestamps, and saves the resulting audio files into the specified output directory.

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **Required** | The storage instance used for reading input data and writing output data. |
| `dst_folder` | `str` | **Required** | The path to the output audio folder where merged audio files will be saved. |
| `input_audio_key` | `str` | `"audio"` | The key name for the input audio data in the DataFrame. |
| `input_timestamps_key` | `str` | `"timestamps"` | The key name for accessing speech activity timestamps in the input DataFrame. |
| `timestamp_type` | `Literal["frame", "time"]` | `"time"` | The type of speech activity timestamps: `frame` indicates frame indices, and `time` indicates timestamps in seconds. |
| `max_audio_duration` | `float` | `float('inf')` | Maximum audio duration in seconds. |
| `hop_size_samples` | `int` | `512` | Only applicable when `timestamp_type="frame"`. The hop size in samples used to convert frame indices to seconds. |
| `sampling_rate` | `int` | `16000` | Audio sampling rate in Hz. |

## 🧠 Example Usage
### 🧾 Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `audio` | `list[str]` | A list of audio file paths, each representing a merged speech segment. |
| `original_audio_path` | `str` | The file path of the original input audio. |
| `sequence_num` | `int` | The sequence number of the merged audio segment, starting from 1. |


Example Input:
```jsonl
{"audio": ["./dataflow/example/silero_vad/test.wav"], "conversation": [{"from": "human", "value": "<audio>" }]}
```

Example Output:
```jsonl
{"audio": ["cache\/test_1.wav"],"original_audio_path":".\/dataflow\/example\/silero_vad\/test.wav","conversation":[{"from":"human","value":"<audio>"}],"sequence_num":1}
{"audio":["cache\/test_2.wav"],"original_audio_path":".\/dataflow\/example\/silero_vad\/test.wav","conversation":[{"from":"human","value":"<audio>"}],"sequence_num":2}
```
After execution, the merged audio files will appear in the specified `dst_folder`.