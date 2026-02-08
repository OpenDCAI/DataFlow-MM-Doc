---
title: CTC Forced Alignment Evaluation Operator
createTime: 2025/10/14 18:41:28
permalink: /en/mm_operators/2ag2dfa2/
---


## 📘-概述
```CTCForcedAlignmentSampleEvaluator``` is an evaluation operator used to assess speech recognition results based on CTC forced alignment.

## ```__init__```
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
    romanize=True,
)
```

## `init` Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `model_path` | `str` | `MahmoudAshraf/mms-300m-1130-forced-aligner` | The path to the pre-trained CTC forced aligner model. |
| `device` | `Union[str, List[str]]` | `cuda` | The device(s) on which the model runs. Options: "cuda" or "cpu", or a list such as `["cuda:0", "cuda:1"]` to initialize multiple models on multiple GPUs for parallel execution. |
| `num_workers` | `int` | `1` | Degree of operator parallelism. Initializes `num_workers` models and assigns them to the devices specified by device. If `num_workers` exceeds the number of devices, multiple models will be initialized per device for concurrent execution. For example, with `device=["cuda:0", "cuda:1"]` and `num_workers=4`, two models will be initialized on `cuda:0` and two on `cuda:1`. |
| `sampling_rate` | `int` | `16000` | Audio sampling rate, default `16000`. |
| `language` | `str` | `en`| Audio language, default is `en`. |
| `micro_batch_size` | `int` | `16` | When the audio is too long, the model will split the audio data into multiple segments, and `micro_batch_size` represents the batch size for each inference, default is 16. |
| `chinese_to_pinyin` | `bool` | `False` | Whether to convert Chinese characters to Pinyin, default `False`. |
| `romanize` | `bool` | `True` | Whether to romanize characters, default `True`. |

## `run`
```python
def run(
    self, 
    storage: DataFlowStorage,
    input_audio_key: str = "audio",
    input_conversation_key: str = "conversation",
    output_answer_key='forced_alignment_results',
)
```
Executes the main logic of the operator: performs forced alignment on the input audio and conversation text and returns the alignment results.

Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `storage` | `DataFlowStorage` | **Required** | The data storage instance used to store input and output data. |
| `input_audio_key` | `str` | `audio` | The key name for audio data in the input data, default is `audio`. |
| `input_conversation_key` | `str` | `conversation` | The key name of the conversation data in the input, default is `conversation`. |
| `output_answer_key` | `str` | `forced_alignment_results` | The key name for the alignment results in the output data, default is `forced_alignment_results`. |

## 🧠 Example Usage

```python
from dataflow.operators.core_audio import CTCForcedAlignmentSampleEvaluator
from dataflow.operators.conversations import Conversation2Message
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.utils.storage import FileStorage

class ForcedAlignEval():
    def __init__(self):
        self.storage = FileStorage(
            # See audio_asr_pipeline step 2 to step 3 for an example
            first_entry_file_name="/path/to/your/cache/audio_asr_pipeline/audio_asr_pipeline_step2.jsonl",
            cache_path="./cache",
            file_name_prefix="forced_alignment",
            cache_type="jsonl",
        )

        self.aligner = CTCForcedAlignmentSampleEvaluator(
            model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
            device="cuda",
            language="en",      
            micro_batch_size=16,
            chinese_to_pinyin=False,
            retain_word_level_alignment=True,
        )
    
    def forward(self):
        self.aligner.run(
            storage=self.storage.step(),
            input_audio_key='audio',
            input_conversation_key='conversation',
            output_answer_key="forced_alignment_results",
        )

if __name__ == "__main__":
    eval = ForcedAlignEval()
    eval.forward()
```

### 🧾 Default Output Format

| Field | Type | Description |
| :--- | :--- | :--- |
| `forced_alignment_results` | `dict` | Forced alignment results, where `spans` represents frame-level character alignment degrees, and `word_timestamps` represents word-level timestamp alignment results. |
| `error` | `Optional[str]` | 	If an error occurs during alignment score computation, the error message is stored in this field. If no error occurs, `error` is `null`. |

Example Input:
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```

Example Output:
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it","forced_alignment_results":{"alignment":[{"start":0.063,"end":0.147,"text":"and","score":0.9554548212},{"start":0.273,"end":0.462,"text":"says","score":0.9719064832},{"start":0.609,"end":0.735,"text":"how","score":0.9212982873},{"start":0.798,"end":0.84,"text":"do","score":0.9939799858},{"start":1.029,"end":1.029,"text":"i","score":null},{"start":1.113,"end":1.26,"text":"get","score":0.9985639263},{"start":1.365,"end":1.428,"text":"to","score":0.9945560943},{"start":1.554,"end":1.974,"text":"dublin","score":0.9609149893},{"start":2.856,"end":2.94,"text":"and","score":0.9309501759},{"start":2.982,"end":3.045,"text":"the","score":0.7141059392},{"start":3.192,"end":3.465,"text":"answer","score":0.5938632981},{"start":3.507,"end":3.633,"text":"that","score":0.9633214426},{"start":3.717,"end":4.011,"text":"comes","score":0.9843271526},{"start":4.116,"end":4.389,"text":"back","score":0.9842618417},{"start":4.515,"end":4.662,"text":"is","score":0.9815290374},{"start":5.25,"end":5.376,"text":"well","score":0.047969851},{"start":5.502,"end":5.502,"text":"i","score":null},{"start":5.544,"end":5.67,"text":"would","score":0.8428627272},{"start":5.754,"end":5.817,"text":"not","score":0.123845133},{"start":5.88,"end":6.153,"text":"start","score":0.9789600127},{"start":6.216,"end":6.363,"text":"from","score":0.9000720539},{"start":6.468,"end":6.657,"text":"here","score":0.9283110266},{"start":6.783,"end":7.035,"text":"sonny","score":0.8839239278},{"start":9.807,"end":9.975,"text":"that","score":0.7547208776},{"start":10.038,"end":10.122,"text":"is","score":0.8797863669},{"start":10.185,"end":10.248,"text":"to","score":0.8244834454},{"start":10.353,"end":10.542,"text":"say","score":0.9471999446},{"start":11.025,"end":11.34,"text":"much","score":0.9940719048},{"start":11.634,"end":11.802,"text":"of","score":0.9950778359},{"start":11.991,"end":12.621,"text":"political","score":0.9989232361},{"start":12.81,"end":13.629,"text":"philosophy","score":0.9465096714},{"start":14.217,"end":14.805,"text":"develops","score":0.9432990222},{"start":15.057,"end":15.666,"text":"theories","score":0.9267864129},{"start":17.136,"end":17.304,"text":"that","score":0.8086037475},{"start":17.43,"end":17.682,"text":"take","score":0.9565847912},{"start":17.829,"end":17.913,"text":"no","score":0.956001711},{"start":18.081,"end":18.648,"text":"account","score":0.9546385136},{"start":19.425,"end":19.656,"text":"of","score":0.8420175488},{"start":21.42,"end":21.567,"text":"where","score":0.7551332315},{"start":21.63,"end":21.693,"text":"we","score":0.9166198867},{"start":21.903,"end":22.323,"text":"actually","score":0.9312994611},{"start":22.512,"end":22.701,"text":"are","score":0.9616599245},{"start":22.89,"end":22.974,"text":"and","score":0.4025359219},{"start":23.079,"end":23.31,"text":"how","score":0.9633893459},{"start":23.436,"end":23.499,"text":"the","score":0.7716538814},{"start":23.625,"end":24.045,"text":"theories","score":0.9761697651},{"start":24.15,"end":24.36,"text":"that","score":0.9068021914},{"start":24.486,"end":24.78,"text":"people","score":0.9219708612},{"start":24.948,"end":25.2,"text":"argue","score":0.9620480049},{"start":25.242,"end":25.515,"text":"about","score":0.9651158228},{"start":25.641,"end":25.704,"text":"in","score":0.9931364561},{"start":25.767,"end":25.83,"text":"the","score":0.8166649179},{"start":25.956,"end":26.439,"text":"journals","score":0.9695284503},{"start":26.544,"end":26.607,"text":"and","score":0.9435737354},{"start":26.67,"end":26.712,"text":"in","score":0.778872343},{"start":26.754,"end":26.796,"text":"the","score":0.8787819404},{"start":26.88,"end":27.384,"text":"literature","score":0.928246194},{"start":27.804,"end":28.077,"text":"actually","score":0.9179609355},{"start":28.119,"end":28.266,"text":"could","score":0.8717020111},{"start":28.329,"end":28.392,"text":"be","score":0.9910494216},{"start":28.602,"end":29.169,"text":"implemented","score":0.9847475907},{"start":29.232,"end":29.274,"text":"in","score":0.9814222521},{"start":29.337,"end":29.379,"text":"the","score":0.8807633297},{"start":29.442,"end":29.736,"text":"world","score":0.9051810523},{"start":30.156,"end":30.24,"text":"if","score":0.7553217096},{"start":30.45,"end":30.471,"text":"it","score":0.0156467184}],"error":null}}
```