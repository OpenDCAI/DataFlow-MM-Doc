---
title: Speech Recognition and Cleaning Pipeline
icon: material-symbols:speech-to-text
createTime: 2025/11/17 14:38:19
permalink: /en/mm_guide/4qyvw1fp/
---


## Speech Recognition and Cleaning Pipeline
This pipeline is used to process input audio through the following steps:
- ASR (Automatic Speech Recognition): Uses Whisper (local vLLM Serving or OpenAI API Serving) to generate transcription text.
- Text normalization & cleaning: Normalizes the transcription output (e.g., English casing / punctuation handling), with optional punctuation removal.
- CTC forced alignment evaluation / filtering: Uses a CTC forced aligner to align the audio with the transcription, producing word/segment-level timestamps and alignment confidence scores, which can be used for quality evaluation or filtering.

## Step 1: Install Environment
See[ Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Import Required Packages
```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import (
    PromptedAQAGenerator,
    TextNormalizer,
    CTCForcedAlignmentFilter,
    CTCForcedAlignmentSampleEvaluator,
)
from dataflow.serving import LocalModelVLMServing_vllm, APIVLMServing_openai
from dataflow.prompts.audio import WhisperTranscriptionPrompt
```

## Step 3: Fill in the audio path in the following format
```json
{"audio": ["../example_data/audio_asr_pipeline/test.wav"], "conversation": [{"from": "human", "value": "" }]}
```

## Step 4: Put the dataset path into FileStorage using the following format
```python
storage = FileStorage(
    first_entry_file_name="../example_data/audio_asr_pipeline/sample_data.jsonl",
    cache_path="./cache",
    file_name_prefix="audio_asr_pipeline",
    cache_type="jsonl",
)
```

## Step 5: Define the model serving (local serving or API serving)
```python
serving = LocalModelVLMServing_vllm(
    hf_model_name_or_path="openai/whisper-large-v3",
    hf_cache_dir="./dataflow_cache",
    vllm_tensor_parallel_size=2,
    vllm_temperature=0.3,
    vllm_top_p=0.9,
    vllm_max_model_len=448,
    vllm_gpu_memory_utilization=0.9
)

# self.serving = APIVLMServing_openai(
#     api_url="http://127.0.0.1:8091/v1",  # api_url for locally deployed model
#     max_workers=3,
#     model_name="Qwen/Qwen3-Omni-30B-A3B-Instruct",
# )
```

Step 6: Initialize the PromptedAQAGenerator operator
```python
# For Whisper models, use WhisperTranscriptionPrompt to generate the prompt
prompted_generator = PromptedAQAGenerator(
    vlm_serving=self.serving,
    system_prompt=WhisperTranscriptionPrompt().generate_prompt(language="english", task="transcribe", with_timestamps=False)
)
```

## Step 7: Initialize the text normalization operator
```python
text_normalizer = TextNormalizer(
    language="en",
    remove_puncs=True,
)
```

## Step 8: Initialize the CTC forced alignment evaluation or filtering operator
```python
# If you want to use the filtering operator, choose CTCForcedAlignmentFilter
# filter = CTCForcedAlignmentFilter(
#     model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
#     device=["cuda:3"],
#     num_workers=1,
#     sampling_rate=16000,
#     language="en",
#     micro_batch_size=16,
#     chinese_to_pinyin=False,
#     threshold=0.1,
#     threshold_mode="min",
#     romanize=True,
# )


evaluator = CTCForcedAlignmentSampleEvaluator(
    model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
    device=["cuda:3"],
    num_workers=1,
    sampling_rate=16000,
    language="en",
    micro_batch_size=16,
    chinese_to_pinyin=False,
    romanize=True,
)
```

## Step 9: Run the pipeline operators in order
```python
prompted_generator.run(
    storage=storage.step(),
    input_audio_key="audio",
    input_conversation_key="conversation",
    output_answer_key="transcript"
)

text_normalizer.run(
    storage=storage.step(),
    input_text_key="transcript",
)

# filter.run(
#     storage=storage.step(),
#     input_audio_key="audio",
#     input_conversation_key="transcript",
# )
# filter.close()

evaluator.run(
storage=storage.step(),
input_audio_key="audio",
input_conversation_key="transcript",
output_answer_key="forced_alignment_results",
)
evaluator.close()
```

## Synthetic data example
```json
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it","forced_alignment_results":{"alignment":[{"start":0.063,"end":0.147,"text":"and","score":0.9554548212},{"start":0.273,"end":0.462,"text":"says","score":0.9719064832},{"start":0.609,"end":0.735,"text":"how","score":0.9212982873},{"start":0.798,"end":0.84,"text":"do","score":0.9939799858},{"start":1.029,"end":1.029,"text":"i","score":null},{"start":1.113,"end":1.26,"text":"get","score":0.9985639263},{"start":1.365,"end":1.428,"text":"to","score":0.9945560943},{"start":1.554,"end":1.974,"text":"dublin","score":0.9609149893},{"start":2.856,"end":2.94,"text":"and","score":0.9309501759},{"start":2.982,"end":3.045,"text":"the","score":0.7141059392},{"start":3.192,"end":3.465,"text":"answer","score":0.5938632981},{"start":3.507,"end":3.633,"text":"that","score":0.9633214426},{"start":3.717,"end":4.011,"text":"comes","score":0.9843271526},{"start":4.116,"end":4.389,"text":"back","score":0.9842618417},{"start":4.515,"end":4.662,"text":"is","score":0.9815290374},{"start":5.25,"end":5.376,"text":"well","score":0.047969851},{"start":5.502,"end":5.502,"text":"i","score":null},{"start":5.544,"end":5.67,"text":"would","score":0.8428627272},{"start":5.754,"end":5.817,"text":"not","score":0.123845133},{"start":5.88,"end":6.153,"text":"start","score":0.9789600127},{"start":6.216,"end":6.363,"text":"from","score":0.9000720539},{"start":6.468,"end":6.657,"text":"here","score":0.9283110266},{"start":6.783,"end":7.035,"text":"sonny","score":0.8839239278},{"start":9.807,"end":9.975,"text":"that","score":0.7547208776},{"start":10.038,"end":10.122,"text":"is","score":0.8797863669},{"start":10.185,"end":10.248,"text":"to","score":0.8244834454},{"start":10.353,"end":10.542,"text":"say","score":0.9471999446},{"start":11.025,"end":11.34,"text":"much","score":0.9940719048},{"start":11.634,"end":11.802,"text":"of","score":0.9950778359},{"start":11.991,"end":12.621,"text":"political","score":0.9989232361},{"start":12.81,"end":13.629,"text":"philosophy","score":0.9465096714},{"start":14.217,"end":14.805,"text":"develops","score":0.9432990222},{"start":15.057,"end":15.666,"text":"theories","score":0.9267864129},{"start":17.136,"end":17.304,"text":"that","score":0.8086037475},{"start":17.43,"end":17.682,"text":"take","score":0.9565847912},{"start":17.829,"end":17.913,"text":"no","score":0.956001711},{"start":18.081,"end":18.648,"text":"account","score":0.9546385136},{"start":19.425,"end":19.656,"text":"of","score":0.8420175488},{"start":21.42,"end":21.567,"text":"where","score":0.7551332315},{"start":21.63,"end":21.693,"text":"we","score":0.9166198867},{"start":21.903,"end":22.323,"text":"actually","score":0.9312994611},{"start":22.512,"end":22.701,"text":"are","score":0.9616599245},{"start":22.89,"end":22.974,"text":"and","score":0.4025359219},{"start":23.079,"end":23.31,"text":"how","score":0.9633893459},{"start":23.436,"end":23.499,"text":"the","score":0.7716538814},{"start":23.625,"end":24.045,"text":"theories","score":0.9761697651},{"start":24.15,"end":24.36,"text":"that","score":0.9068021914},{"start":24.486,"end":24.78,"text":"people","score":0.9219708612},{"start":24.948,"end":25.2,"text":"argue","score":0.9620480049},{"start":25.242,"end":25.515,"text":"about","score":0.9651158228},{"start":25.641,"end":25.704,"text":"in","score":0.9931364561},{"start":25.767,"end":25.83,"text":"the","score":0.8166649179},{"start":25.956,"end":26.439,"text":"journals","score":0.9695284503},{"start":26.544,"end":26.607,"text":"and","score":0.9435737354},{"start":26.67,"end":26.712,"text":"in","score":0.778872343},{"start":26.754,"end":26.796,"text":"the","score":0.8787819404},{"start":26.88,"end":27.384,"text":"literature","score":0.928246194},{"start":27.804,"end":28.077,"text":"actually","score":0.9179609355},{"start":28.119,"end":28.266,"text":"could","score":0.8717020111},{"start":28.329,"end":28.392,"text":"be","score":0.9910494216},{"start":28.602,"end":29.169,"text":"implemented","score":0.9847475907},{"start":29.232,"end":29.274,"text":"in","score":0.9814222521},{"start":29.337,"end":29.379,"text":"the","score":0.8807633297},{"start":29.442,"end":29.736,"text":"world","score":0.9051810523},{"start":30.156,"end":30.24,"text":"if","score":0.7553217096},{"start":30.45,"end":30.471,"text":"it","score":0.0156467184}],"error":null}}
```