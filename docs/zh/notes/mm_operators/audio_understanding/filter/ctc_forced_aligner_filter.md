---
title: CTC强制对齐过滤算子
createTime: 2025/10/14 17:08:32
# icon: material-symbols:filter-alt
permalink: /zh/mm_operators/i5gi7q3f/
---

## 📘-概述
```CTCForcedAlignmentFilter``` 是一个过滤算子，用于基于 CTC 强制对齐的语音识别结果过滤数据。

## ```__init__```函数
```python
def __init__(
    self,
    model_path: str = "MahmoudAshraf/mms-300m-1130-forced-aligner",
    device: Union[str, List[str]] = "cuda",
    num_workers: int = 1,
    sampling_rate: int = 16000,
    language: str = "en",
    micro_batch_size: int = 16,
    chinese_to_pinyin: bool = False,
    romanize: bool = True,
    threshold: float = 0.8,
    threshold_mode: str = "min",
)
```

## `init`参数说明
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `model_path` | `str` | `MahmoudAshraf/mms-300m-1130-forced-aligner` | 执行生成所用的音频多模态大模型服务实例。 |
| `device` | `Union[str, List[str]]` | `cuda` | 模型运行的设备，可选值为 `cuda` 或 `cpu`，也可以选择传入列表，如["cuda:0", "cuda:1"]，表示在多个GPU上初始化多个模型并行运行。 |
| `num_workers` | `int` | `1` | 算子并行数，初始化`num_workers`个模型，依次分配在device参数指定的设备上。当`num_workers`初始化数量大于设备数量时，会自动在每个设备上初始化多个模型并发运行。如：指定设备为`["cuda:0", "cuda:1"]`，`num_workers`为4，则会在`cuda:0`上初始化两个模型，在`cuda:1`上初始化两个模型。 |
| `sampling_rate` | `int` | `16000` | 音频采样率，默认值为 `16000`。 |
| `language` | `str` | `en` | 音频语言，默认值为 `en`。 |
| `micro_batch_size` | `int` | `16` | 当音频过长时，模型会将音频数据拆分成多个片段，`micro_batch_size`表示一次推理的为片段批次大小，默认值为 `16`。 |
| `chinese_to_pinyin` | `bool` | `False` | 是否将中文字符转换为拼音，默认值为 `False`。 |
| `romanize` | `bool` | `True` | 是否对字符进行罗马化处理，默认值为 `True`。 |
| `threshold` | `float` | `0.8` | 对齐分数阈值，默认值为 `0.8`。 |
| `threshold_mode` | `str` | `min` | 对齐分数阈值模式，可选值为 `min` 或 ``mean`。保留高于阈值`threshold`的样本，默认值为 `min`，表示按照一段时间内的最小对齐分数进行过滤。 `mean`表示按照一段时间内的平均对齐分数进行过滤。 |


## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    input_audio_key: str = "audio",
    input_conversation_key: str = "conversation",
)
```

参数
| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **必填** | 数据存储实例，用于存储输入和输出数据。 |
| `input_audio_key` | `str` |` audio` | 输入数据中音频数据的键名，默认值为 `audio`。 |
| `input_conversation_key` | `str` | `conversation` | 输入数据中对话数据的键名，默认值为 `conversation`。 |
| `output_answer_key` | `str` | `forced_alignment_results` | 输出数据中对齐结果的键名，默认值为 `forced_alignment_results`。 |

## 🧠 示例用法

```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import CTCForcedAlignmentFilter
from dataflow.wrapper import BatchWrapper

class testCTCForcedAlignmentFilter:
    def __init__(self):
        self.storage = FileStorage(
            # 示例可见audio_asr_pipeline中step 2到step 3
            first_entry_file_name="/path/to/your/cache/audio_asr_pipeline/audio_asr_pipeline_step2.jsonl",
            cache_path="./cache",
            file_name_prefix="forced_alignment_filter",
            cache_type="jsonl",
        )
        
        self.filter = CTCForcedAlignmentFilter(
            model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
            device=["cuda:0"],
            num_workers=1,
            sampling_rate=16000,
            language="en",  
            micro_batch_size=16,
            chinese_to_pinyin=False,
            romanize=True,
            threshold=0.8,
            threshold_mode="mean"
        )
    
    def forward(self):
        self.filter.run(
            storage=self.storage.step(),
            input_audio_key='audio',
            input_conversation_key='conversation',    
        )
        self.filter.close()

if __name__ == "__main__":
    pipline = testCTCForcedAlignFilter()
    pipline.forward()
```

### 🧾 默认输出格式（Output Format）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `forced_alignment_results` | `dict` | 强制对齐结果，其中`spans`表示帧级字符对齐程度，`word_timestamps`表示单词级别的时间戳对齐结果。 |
| `error` | `Optional[str]` | 当对齐分数计算过程中出现错误时，会将错误信息存储在该字段中。没有错误时，`error`字段为`null`。 |
| `output_answer_key` | `str` | `forced_alignment_results` | 保留的数据中对齐结果的键名，默认值为 `forced_alignment_results`。 |

保留符合对齐分数阈值的样本。当所有数据都被过滤时，打印`All data has been filtered out!`

示例输入：
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```

示例输出：
保留：
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it","forced_alignment_results":{"alignment":[{"start":0.063,"end":0.147,"text":"and","score":0.9554548212},{"start":0.273,"end":0.462,"text":"says","score":0.9719064832},{"start":0.609,"end":0.735,"text":"how","score":0.9212982873},{"start":0.798,"end":0.84,"text":"do","score":0.9939799858},{"start":1.029,"end":1.029,"text":"i","score":null},{"start":1.113,"end":1.26,"text":"get","score":0.9985639263},{"start":1.365,"end":1.428,"text":"to","score":0.9945560943},{"start":1.554,"end":1.974,"text":"dublin","score":0.9609149893},{"start":2.856,"end":2.94,"text":"and","score":0.9309501759},{"start":2.982,"end":3.045,"text":"the","score":0.7141059392},{"start":3.192,"end":3.465,"text":"answer","score":0.5938632981},{"start":3.507,"end":3.633,"text":"that","score":0.9633214426},{"start":3.717,"end":4.011,"text":"comes","score":0.9843271526},{"start":4.116,"end":4.389,"text":"back","score":0.9842618417},{"start":4.515,"end":4.662,"text":"is","score":0.9815290374},{"start":5.25,"end":5.376,"text":"well","score":0.047969851},{"start":5.502,"end":5.502,"text":"i","score":null},{"start":5.544,"end":5.67,"text":"would","score":0.8428627272},{"start":5.754,"end":5.817,"text":"not","score":0.123845133},{"start":5.88,"end":6.153,"text":"start","score":0.9789600127},{"start":6.216,"end":6.363,"text":"from","score":0.9000720539},{"start":6.468,"end":6.657,"text":"here","score":0.9283110266},{"start":6.783,"end":7.035,"text":"sonny","score":0.8839239278},{"start":9.807,"end":9.975,"text":"that","score":0.7547208776},{"start":10.038,"end":10.122,"text":"is","score":0.8797863669},{"start":10.185,"end":10.248,"text":"to","score":0.8244834454},{"start":10.353,"end":10.542,"text":"say","score":0.9471999446},{"start":11.025,"end":11.34,"text":"much","score":0.9940719048},{"start":11.634,"end":11.802,"text":"of","score":0.9950778359},{"start":11.991,"end":12.621,"text":"political","score":0.9989232361},{"start":12.81,"end":13.629,"text":"philosophy","score":0.9465096714},{"start":14.217,"end":14.805,"text":"develops","score":0.9432990222},{"start":15.057,"end":15.666,"text":"theories","score":0.9267864129},{"start":17.136,"end":17.304,"text":"that","score":0.8086037475},{"start":17.43,"end":17.682,"text":"take","score":0.9565847912},{"start":17.829,"end":17.913,"text":"no","score":0.956001711},{"start":18.081,"end":18.648,"text":"account","score":0.9546385136},{"start":19.425,"end":19.656,"text":"of","score":0.8420175488},{"start":21.42,"end":21.567,"text":"where","score":0.7551332315},{"start":21.63,"end":21.693,"text":"we","score":0.9166198867},{"start":21.903,"end":22.323,"text":"actually","score":0.9312994611},{"start":22.512,"end":22.701,"text":"are","score":0.9616599245},{"start":22.89,"end":22.974,"text":"and","score":0.4025359219},{"start":23.079,"end":23.31,"text":"how","score":0.9633893459},{"start":23.436,"end":23.499,"text":"the","score":0.7716538814},{"start":23.625,"end":24.045,"text":"theories","score":0.9761697651},{"start":24.15,"end":24.36,"text":"that","score":0.9068021914},{"start":24.486,"end":24.78,"text":"people","score":0.9219708612},{"start":24.948,"end":25.2,"text":"argue","score":0.9620480049},{"start":25.242,"end":25.515,"text":"about","score":0.9651158228},{"start":25.641,"end":25.704,"text":"in","score":0.9931364561},{"start":25.767,"end":25.83,"text":"the","score":0.8166649179},{"start":25.956,"end":26.439,"text":"journals","score":0.9695284503},{"start":26.544,"end":26.607,"text":"and","score":0.9435737354},{"start":26.67,"end":26.712,"text":"in","score":0.778872343},{"start":26.754,"end":26.796,"text":"the","score":0.8787819404},{"start":26.88,"end":27.384,"text":"literature","score":0.928246194},{"start":27.804,"end":28.077,"text":"actually","score":0.9179609355},{"start":28.119,"end":28.266,"text":"could","score":0.8717020111},{"start":28.329,"end":28.392,"text":"be","score":0.9910494216},{"start":28.602,"end":29.169,"text":"implemented","score":0.9847475907},{"start":29.232,"end":29.274,"text":"in","score":0.9814222521},{"start":29.337,"end":29.379,"text":"the","score":0.8807633297},{"start":29.442,"end":29.736,"text":"world","score":0.9051810523},{"start":30.156,"end":30.24,"text":"if","score":0.7553217096},{"start":30.45,"end":30.471,"text":"it","score":0.0156467184}],"error":null}}
```

全部被过滤后会打印字符串：
```jsonl
All data has been filtered out!
```