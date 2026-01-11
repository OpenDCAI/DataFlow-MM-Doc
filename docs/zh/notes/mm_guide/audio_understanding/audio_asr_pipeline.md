---
title: 语音识别与清洗流水线
icon: material-symbols:speech-to-text
createTime: 2025/11/17 13:38:14
permalink: /zh/mm_guide/brqv2ysg/
---

## 语音识别与清洗流水线

## 第一步: 安装环境
见[Audio环境安装](./install_audio_understanding.md)

## 第二步: 导入相关包
```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0,1,2,3,4,5,6,7'  # 设置可见的GPU设备

from dataflow.utils.storage import FileStorage
from dataflow.operators.core_audio import (
    SileroVADGenerator,
    MergeChunksRowGenerator,
    PromptedAQAGenerator,                
    # CTCForcedAlignmentFilter,                         # 如果是过滤而非评估, 则导入过滤算子
    CTCForcedAlignmentSampleEvaluator,
)
from dataflow.serving import LocalModelVLMServing_vllm
from dataflow.prompts.whisper_prompt_generator import WhisperTranscriptionPrompt
```

## 第三步: 定义pipeline
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
            repo_or_dir="snakers4/silero-vad",                      # 加载模型路径
            source="github",                                        # 从github加载权重, 也可以从本地加载权重, 此时source字段填写为local
            device=['cuda:2'],                                      # 可以加载模型的GPU列表 
            num_workers=2,                                          # num_workers为进程数, 每个进程启动一个模型, 平均分配在device列表中的每个设备上
        )
        
        self.merger = MergeChunksRowGenerator(num_workers=2)

        self.prompted_generator = PromptedAQAGenerator(
            vlm_serving=self.serving,
            system_prompt=WhisperTranscriptionPrompt().generate_prompt(language="german", task="transcribe", with_timestamps=False),
        )

        # self.filter = CTCForcedAlignmentFilter(
        #     model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
        #     device=["cuda:3"],
        #     num_workers=1,
        # )

        self.evaluator = CTCForcedAlignmentSampleEvaluator(
            model_path="MahmoudAshraf/mms-300m-1130-forced-aligner",
            device=["cuda:3"],                                      # 可以加载模型的GPU列表 
            num_workers=2,                                          # num_workers为进程数, 每个进程启动一个模型, 平均分配在device列表中的每个设备上
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

        self.silero_vad_generator.close()     # 关闭多进程

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

## 第四步: pipeline运行
```python
if __name__ == "__main__":
    pipeline = Pipeline()
    pipeline.forward()
```