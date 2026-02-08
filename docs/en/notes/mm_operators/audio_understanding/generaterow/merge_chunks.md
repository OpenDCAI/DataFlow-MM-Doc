---
title: Timestamp-Based Audio Split & Merge Operator
createTime: 2025/10/14 18:26:49
permalink: /en/mm_operators/qlblfsr2/
---


## 📘 Overview
`TimestampChunkRowGenerator` is an operator that splits or merges audio segments based on timestamps.

## ```__init__```
```python
def __init__(
    self, 
    dst_folder: str,
    timestamp_unit: Literal["frame", "second"] = "second",
    mode: Literal["merge", "split"] = "split",
    max_audio_duration: float = float('inf'),
    hop_size_samples: int = 512,
    sampling_rate: int = 16000,
    num_workers: int = 1,
):
```

## init Parameters
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `num_workers` | `int` | `1` | Number of worker threads for parallel processing |
| `dst_folder` | `str` | **Required** | The path to the output audio folder where merged audio files will be saved. |
| `timestamp_unit` | `Literal["frame", "second"]` | `"second"` | The type of speech activity timestamps: `frame` indicates frame indices, and `second` indicates timestamps in seconds. |
| `mode` | `Literal["merge", "split"]` | `"split"` | Whether to split only or split then merge. `split` means only split the audio; `merge` means merge split segments afterward (the merged segment duration will not exceed `max_audio_duration`). |
| `max_audio_duration` | `float` | `float('inf')` | Maximum audio duration in seconds. |
| `hop_size_samples` | `int` | `512` | Only applicable when `timestamp_unit="frame"`. The hop size in samples used to convert frame indices to seconds. |
| `sampling_rate` | `int` | `16000` | Audio sampling rate in Hz. |

## `run`
```python
def run(self,
    storage: DataFlowStorage,
    input_audio_key: str = "audio",
    input_timestamps_key: str = "timestamps",
):
```
Executes the main logic of the operator. It reads the input DataFrame from storage, merges audio segments according to speech timestamps, and saves the resulting audio files into the specified output directory.

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **Required** | The storage instance used for reading input data and writing output data. |
| `input_audio_key` | `str` | `"audio"` | The key name for the input audio data in the DataFrame. |
| `input_timestamps_key` | `str` | `"timestamps"` | The key name for accessing speech activity timestamps in the input DataFrame. |


## 🧠 Example Usage

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import MergeChunksRowGenerator

class TestMergeChunksByTimestamps:
    def __init__(self):
        self.storage = FileStorage(
            first_entry_file_name="/path/to/your/cache/audio_voice_activity_detection_pipeline_step2.jsonl",
            cache_path="./cache",
            file_name_prefix="audio_voice_activity_detection_pipeline",
            cache_type="jsonl",
        )

        self.merger = MergeChunksRowGenerator(
            num_workers=1,
            dst_folder="./cache",
            timestamp_unit="time", 
            mode="split",
            max_audio_duration=30,
            hop_size_samples=512,
            sampling_rate=16000,
        )

    def forward(self):
        self.merger.run(
            storage=self.storage.step(),
            input_audio_key="audio",
            input_timestamps_key="timestamps",
        )

if __name__ == "__main__":
    pipeline = TestMergeChunksByTimestamps()
    pipeline.forward()
```

### 🧾 Output Format
| Field | Type | Description |
| :--- | :--- | :--- |
| `audio` | `list[str]` | A list of audio file paths, each representing a merged speech segment. |
| `original_audio_path` | `str` | The file path of the original input audio. |
| `sequence_num` | `int` | The sequence number of the merged audio segment, starting from 1. |


Example Input:
```jsonl
{"audio":["..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"timestamps":[{"start":0.0,"end":2.0},{"start":2.7,"end":4.7},{"start":5.0,"end":6.9},{"start":9.3,"end":13.3},{"start":13.5,"end":15.1},{"start":15.3,"end":15.9},{"start":16.3,"end":17.9},{"start":18.4,"end":19.6},{"start":20.3,"end":32.6},{"start":32.7,"end":35.6},{"start":35.7,"end":37.6},{"start":38.0,"end":38.9},{"start":39.9,"end":43.3},{"start":43.6,"end":44.6},{"start":45.0,"end":46.8},{"start":48.8,"end":50.0},{"start":51.1,"end":54.2},{"start":54.5,"end":57.4},{"start":57.5,"end":59.6}]}
```

Example Output:
```jsonl
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
After execution, the merged audio files will appear in the specified `dst_folder`.