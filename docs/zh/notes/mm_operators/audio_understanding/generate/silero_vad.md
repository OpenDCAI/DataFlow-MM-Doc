---
title: SileroVAD语音片段识别算子
createTime: 2025/10/14 14:42:14
# icon: material-symbols:voice-selection-sharp
permalink: /zh/mm_operators/lecs721p/
---

## 📘-概述
```SileroVADGenerator``` 是一个语音活动检测（VAD）算子，用于在音频中识别语音活动区域。

## ```__init__```函数
```python
def __init__(self, 
    repo_or_dir: str = "snakers4/silero-vad", 
    source: str = "github",
    device: Union[str, List[str]] = "cuda",
    num_workers: int = 1,
    threshold: float = 0.5,
    sampling_rate: int = 16000,
    min_speech_duration_s: float = 0.25,
    max_speech_duration_s: float = float('inf'),
    min_silence_duration_s: float = 0.1,
    speech_pad_s: float = 0.03,
    return_seconds: bool = False,
    **kwargs,
)
```

## `init`参数说明
| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `repo_or_dir` | `str` | `snakers4/silero-vad` | 模型的存储仓库或本地仓库。 |
| `source` | `str` | `github` | 模型的来源，可选值为 `github` 或 `local`。 |
| `device` | `Union[str, List[str]]` | `cuda` | 模型运行的设备，可选值为 `cuda` 或 `cpu`，也可以选择传入列表，如`["cuda:0", "cuda:1"]`，表示在多个GPU上初始化多个模型并行运行。 |
| `num_workers` | `int` | `1` | 算子并行数，初始化`num_workers`个模型，依次分配在`device`参数指定的设备上。当`num_workers`初始化数量大于设备数量时，会自动在每个设备上初始化多个模型并发运行。如：指定设备为`["cuda:0", "cuda:1"]`，`num_workers`为4，则会在`cuda:0`上初始化两个模型，在`cuda:1`上初始化两个模型。 |
| `threshold` | `float` | `0.5` | 语音活动检测阈值，用于判断是否为语音活动区域 |
| `sampling_rate` | `int` | `16000` | 音频采样率，必须为16000 |
| `min_speech_duration_s` | `float` | `0.25` | 语音段最短时长（秒）。短于此的段会被丢弃。 |
| `max_speech_duration_s` | `float` | `float('inf')` | 语音段最长时长（秒）。长于此的段会被截断。超过时会尝试在最近的足够长静音处切分；若没有：`use_min_cut=True`：在后半段寻找概率最小帧切分；`use_min_cut=False`：在当前位置硬切。| 
| `min_silence_duration_s` | `float` | `0.1` | 静音段最短时长（秒）。短于此的静音会被合并。 |
| `speech_pad_s` | `float` | `0.03` | 语音段左右padding时长（秒）。相邻两端静音过短时，对语音段进行padding，避免语音片段过密切分。 |
| `return_seconds` | `bool` | `False` | `True`：返回的 `start/end` 用秒表示；`False`：用采样点表示。 |

kwargs: 额外 VAD 参数。
| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `time_resolution` | `int` | `1` | 时间分辨率（秒）。当要求以秒为单位时，语音坐标的时间分辨率 |
| `neg_threshold` | `Optional[float]` | `None` | 负阈值，表示退出语音状态的阈值。`None` 时自动设为 `max(threshold - 0.15, 0.01)`。较低可减少抖动，较高会更敏感地结束语音段。 |
| `min_silence_at_max_speech` | `float`| `0.098` | 当语音活动区域超过`max_speech_duration_s`时，允许的最大静音时长（秒）。当语音段过长（超过 `max_speech_duration_s`）时，程序会先尝试静音切分。 |
| `use_max_poss_sil_at_max_speech` | `bool` | `True` | 达到 `max_speech_duration_s` 时，若存在多个候选静音，是否选择最长的那个作为切分点 |

注意：Silero VAD模型使用Github仓库的权重加载，而非huggingface仓库。

## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    input_audio_key: str = "audio",
    output_answer_key: str = "timestamps",           
)
```
执行算子主逻辑，从存储中读取输入 DataFrame，调用 Silero VAD 模型生成语音片段时间戳，并将结果写回存储。


参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **必填** | 输入输出数据存储 |
| `input_audio_key` | `str` | `audio` | 输入音频数据路径的键名 |
| `output_answer_key` | `str` | `timestamps` | 输出语音片段时间戳列表的键名 |


## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import SileroVADGenerator

class SileroVADGeneratorEval:
    def __init__(self):
        self.storage = FileStorage(
            first_entry_file_name="../example_data/audio_voice_activity_detection_pipeline/sample_data.jsonl",
            cache_path="./cache",
            file_name_prefix="silero_vad",
            cache_type="jsonl",
        )

        self.silero_vad_generator = SileroVADGenerator(
            repo_or_dir="snakers4/silero-vad",
            source="github",
            device=['cuda:0'],
            num_workers=1,
            threshold=0.5,
            sampling_rate=16000,
            min_speech_duration_s=0.25,
            max_speech_duration_s=float('inf'),
            min_silence_duration_s=0.1,
            speech_pad_s=0.03,
            return_seconds=True,
            # 以下为kwargs参数
            time_resolution=1,
            neg_threshold=None,
            min_silence_at_max_speech=98,
            use_max_poss_sil_at_max_speech=True,
        )
    
    def forward(self):
        self.silero_vad_generator.run(
            storage=self.storage.step(),
            input_audio_key='audio',
            output_answer_key='timestamps',
        )

    
if __name__ == "__main__":
    pipline = SileroVADGeneratorEval()
    pipline.forward()
```

### 🧾 默认输出格式（Output Format）
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `timestamps` | `list[dict]` | 语音片段时间戳列表，每个元素为一个字典，包含 `start` 和 `end` 键，分别表示语音片段的开始时间和结束时间（秒） |


示例输入:
```jsonl
{"audio": ["../example_data/audio_voice_activity_detection_pipeline/test.wav"], "conversation": [{"from": "human", "value": "" }]}
```

示例输出:
```jsonl
{"audio":["..\/example_data\/audio_voice_activity_detection_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"timestamps":[{"start":0.0,"end":2.0},{"start":2.7,"end":4.7},{"start":5.0,"end":6.9},{"start":9.3,"end":13.3},{"start":13.5,"end":15.1},{"start":15.3,"end":15.9},{"start":16.3,"end":17.9},{"start":18.4,"end":19.6},{"start":20.3,"end":32.6},{"start":32.7,"end":35.6},{"start":35.7,"end":37.6},{"start":38.0,"end":38.9},{"start":39.9,"end":43.3},{"start":43.6,"end":44.6},{"start":45.0,"end":46.8},{"start":48.8,"end":50.0},{"start":51.1,"end":54.2},{"start":54.5,"end":57.4},{"start":57.5,"end":59.6}]}
```