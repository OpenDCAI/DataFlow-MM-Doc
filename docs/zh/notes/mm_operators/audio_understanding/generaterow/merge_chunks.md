---
title: 时间戳切分合并算子
createTime: 2025/10/14 15:41:18
# icon: material-symbols:segment
permalink: /zh/mm_operators/84xjbt9g/
---

## 📘-概述
```TimestampChunkRowGenerator``` 是一个按照时间戳切分或合并音频片段的算子。

## ```__init__```函数
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

## `init`参数说明
| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `dst_folder` | `str` | **必填** | 输出音频文件夹路径 |
| `timestamp_unit` | `Literal["frame", "second"]` | `"second"` | 语音活动时间戳的类型，`frame` 表示帧索引，`second` 表示时间戳 |
| `mode` | `Literal["merge", "split"]` | `"split"` | 选择仅根据时间戳或帧索引对音频进行切分或切分完进行合并, `split` 表示仅切分音频, `merge` 表示切分完音频后再合并(不会超过`max_audio_duration`) |
| `max_audio_duration` | `float` | `float('inf')` | 音频合并最大音频时长限制，单位秒 |
| `hop_size_samples` | `int` | `512` | 仅当 `timestamp_unit="frame"` 时有效，用于把帧索引换算为秒。 |
| `sampling_rate` | `int` | `16000` | 音频采样率，单位赫兹 |
| `num_workers` | `int` | `1` | 并行处理的工作线程数 |

## `run`函数
```python
def run(self,
    storage: DataFlowStorage,
    input_audio_key: str = "audio",
    input_timestamps_key: str = "timestamps",
):
```
执行算子主逻辑，从存储中读取输入 DataFrame，按照语音时间戳进行拼接得到语音片段，保存到指定目录下。

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **必填** | 输入输出数据存储 |
| `input_audio_key` | `str` | `"audio"` | 输入音频数据的键名 |
| `input_timestamps_key` | `str` | `"timestamps"` | 输入语音活动时间戳的键名 |


## 🧠 示例用法

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

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `audio` | `list[str]` | 每个语音片段音频文件路径列表，每个元素为一个字符串，指向拼接后的音频文件 |
| `original_audio_path` | `str` | 原始音频文件路径 |
| `sequence_num` | `int` | 语音片段序号，从 1 开始 |

示例输入:
```jsonl
{"audio":["..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"timestamps":[{"start":0.0,"end":2.0},{"start":2.7,"end":4.7},{"start":5.0,"end":6.9},{"start":9.3,"end":13.3},{"start":13.5,"end":15.1},{"start":15.3,"end":15.9},{"start":16.3,"end":17.9},{"start":18.4,"end":19.6},{"start":20.3,"end":32.6},{"start":32.7,"end":35.6},{"start":35.7,"end":37.6},{"start":38.0,"end":38.9},{"start":39.9,"end":43.3},{"start":43.6,"end":44.6},{"start":45.0,"end":46.8},{"start":48.8,"end":50.0},{"start":51.1,"end":54.2},{"start":54.5,"end":57.4},{"start":57.5,"end":59.6}]}
```

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
在`dst_folder`内会出现音频文件。