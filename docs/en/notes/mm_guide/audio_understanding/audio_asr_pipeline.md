---
title: Speech Recognition and Cleaning Pipeline
icon: material-symbols:speech-to-text
createTime: 2025/11/17 14:38:19
permalink: /en/mm_guide/4qyvw1fp/
---


## Speech Recognition and Cleaning Pipeline

## Step 1: Install Environment
See[ Audio Environment Installation](./install_audio_understanding.md)

## Step 2: Import Relevant Packages
```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0,1,2,3,4,5,6,7'  # Set visible GPU devices

from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import (
    SileroVADGenerator,
    MergeChunksRowGenerator,
    PromptedAQAGenerator,
    # CTCForcedAlignmentFilter,                             # Import this for filtering instead of evaluation
    CTCForcedAlignmentSampleEvaluator,
)
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.prompts.whisper_prompt_generator import WhisperTranscriptionPrompt
```

## Step 3: Define the Pipeline
```python
class Pipeline:
    def __init__(self):
        self.storage = FileStorage(
            first_entry_file_name="./dataflow/example/audio_asr_pipeline/sample_data_local.jsonl",
            cache_path="./cache",
            file_name_prefix="audio_asr_pipeline",
            cache_type="jsonl",
        )

        self.serving = LocalModelVLMServing_vllm(
            hf_model_name_or_path="openai/whisper-large-v3",
            hf_cache_dir="./dataflow_cache",
            vllm_tensor_parallel_size=2,
            vllm_temperature=0.6,
            vllm_top_p=0.9,
            vllm_max_tokens=512,
            vllm_max_model_len=448,
            vllm_gpu_memory_utilization=0.9
        )

        self.silero_vad_generator = SileroVADGenerator(
            repo_or_dir="snakers4/silero-vad",                      # Model loading path
            source="github",                                        # Load weights from GitHub, or set "local" to load from local path
            device=['cuda:2'],                                      # GPUs that the model can be loaded on 
            num_workers=2,                                          # Process count; each process loads one model instance
        )
        
        self.merger = MergeChunksRowGenerator(num_workers=2)

        self.prompted_generator = PromptedAQAGenerator(
            vlm_serving=self.serving,
            system_prompt=WhisperTranscriptionPrompt().generate_prompt(language="german", task="transcribe", with_timestamps=False),
        )

        # self.filter = CTCForcedAlignFilter(
        #     model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
        #     device=["cuda:3"],
        #     num_workers=1,
        # )

        self.evaluator = CTCForcedAlignmentSampleEvaluator(
            model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
            device=["cuda:3"],                                      # GPUs that the model can be loaded on
            num_workers=2,                                          # Process count; each process loads one model instance
        )

    def forward(self):
        self.silero_vad_generator.run(
            storage=self.storage.step(),
            input_audio_key='audio',
            output_answer_key='timestamps',
            threshold=0.5,
            use_min_cut=True,
            sampling_rate=16000,
            max_speech_duration_s=30.0,
            min_silence_duration_s=0.1,
            speech_pad_s=0.03,
            return_seconds=True,
            time_resolution=1,
            neg_threshold=0.35,
            min_silence_at_max_speech=0.098,
            use_max_poss_sil_at_max_speech=True
        )

        self.silero_vad_generator.close()     # Close multiprocessing

        self.merger.run(
            storage=self.storage.step(),
            dst_folder="./cache",
            input_audio_key="audio",
            input_timestamps_key="timestamps",
            timestamp_type="time", 
            max_audio_duration=30.0,
            hop_size_samples=512, 
            sampling_rate=16000,
        )

        self.merger.close()

        self.prompted_generator.run(
            storage=self.storage.step(),
            input_audio_key="audio",
            input_conversation_key="conversation",
            output_answer_key="transcript"
        )

        # self.filter.run(
        #     storage=self.storage.step(),
        #     input_audio_key="audio",
        #     input_conversation_key="transcript",
        #     sampling_rate=16000,
        #     language="de",
        #     micro_batch_size=16,
        #     chinese_to_pinyin=False,
        #     retain_word_level_alignment=True,
        #     threshold=0.1,
        #     threshold_mode="min",
        #     romanize=True,
        # )
        # self.filter.close()

        self.evaluator.run(
            storage=self.storage.step(),
            input_audio_key="audio",
            input_conversation_key="transcript",
            sampling_rate=16000,
            language="de",
            micro_batch_size=16,
            chinese_to_pinyin=False,
            retain_word_level_alignment=True,
            romanize=True,
        )

        self.evaluator.close()
```

## Step 4: Run the Pipeline
```python
if __name__ == "__main__":
    pipeline = Pipeline()
    pipeline.forward()

```