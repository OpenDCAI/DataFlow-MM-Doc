---
title: Text Normalization Operator
createTime: 2026/02/08 23:19:44
permalink: /en/mm_operators/17dc9uu8/
---

## 📘-概述
`TextNormalizer` is a text normalization operator used to normalize the text in a specified DataFrame column. It automatically selects different normalizers based on language:
- English `en`: uses `whisper_normalizer.english.EnglishTextNormalizer`
- Chinese `zh`: uses a custom `TextNorm` (from `.cn_tn`, supporting multiple optional rules)
- Other languages: uses `whisper_normalizer.basic.BasicTextNormalizer`
In addition, you can set `remove_puncs=True` to further remove common Chinese/English punctuation after normalization.

## ```__init__```
```python
def __init__(
    self,
    language: str = "en",
    remove_puncs: bool = False,
    **kwargs,
):
```

## init Parameters
| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `language` | `str` | `"en"` | Language identifier used to choose the normalizer: `"en"` / `"zh"` / others |
| `remove_puncs` | `bool` | `False` | Whether to additionally remove common punctuation after normalization (based on the built-in regex `PUNCS`) |
| `kwargs` | `dict` | - | Extra arguments passed to `TextNorm` **only when** `language="zh"` to control Chinese normalization rules |

`kwargs` (effective only when `language="zh"`)
| Parameter        | Type   | Default | Description                                                                                           |
| ---------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------- |
| `to_banjiao`     | `bool` | `False` | Whether to convert full-width characters to half-width (depends on `TextNorm` implementation)         |
| `to_upper`       | `bool` | `False` | Whether to convert to uppercase                                                                       |
| `to_lower`       | `bool` | `False` | Whether to convert to lowercase                                                                       |
| `remove_fillers` | `bool` | `False` | Whether to remove filler words in spoken language (e.g., “uh”, “um”, etc.; depends on implementation) |
| `remove_erhua`   | `bool` | `False` | Whether to handle erhua (rhotic suffixes) / erhua endings (depends on implementation)                 |
| `check_chars`    | `bool` | `False` | Whether to perform character validity checking/filtering (depends on implementation)                  |
| `remove_space`   | `bool` | `False` | Whether to remove spaces (depends on implementation)                                                  |
| `cc_mode`        | `str`  | `""`    | Chinese conversion mode (e.g., Simplified/Traditional conversion; depends on implementation)          |

## `run`
```python
def run(
    self,
    storage: DataFlowStorage,
    input_text_key: str = "text",
):
```
This runs the operator’s main logic: it reads the input DataFrame from storage and normalizes the input text.

Parameters
| Parameter        | Type              | Default      | Description                                                                   |
| :--------------- | :---------------- | :----------- | :---------------------------------------------------------------------------- |
| `storage`        | `DataFlowStorage` | **Required** | DataFlow storage object. It must contain a DataFrame under `key="dataframe"`. |
| `input_text_key` | `str`             | `"text"`     | The name of the text column to normalize.                                     |

## 🧠 Example usage
```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_text import TextNormalizer

class TextNormalizerEval:
    def __init__(self):
        self.storage = FileStorage(
            # For this example, refer to audio_asr_pipeline:
            # input: audio_asr_pipeline_step1.jsonl, output: audio_asr_pipeline_step2.jsonl
            first_entry_file_name="/path/to/your/cache/audio_asr_pipeline_step1.jsonl",
            cache_path="./cache",
            file_name_prefix="text_normalizer",
            cache_type="jsonl",
        )

        self.op = TextNormalizer(
            language="en",
            remove_puncs=True,
            # The following parameters only affect Chinese TextNorm; the sample data here is English
            # to_banjiao=True,
            # to_lower=True,
            # remove_fillers=False,
            # remove_space=False,
            # cc_mode="",
        )

    def forward(self):
        self.op.run(
            storage=self.storage.step(),
            input_text_key="text",
        )

if __name__ == "__main__":
    pipeline = TextNormalizerEval()
    pipeline.forward()

```

## 🧾 Default output format (Output Format)
| Field                                                  | Type                   | Description                                                                 |
| :----------------------------------------------------- | :--------------------- | :-------------------------------------------------------------------------- |
| Column specified by `input_text_key` (default: `text`) | `list[str]` (row-wise) | The normalized text, written back to the same-named column in the DataFrame |

Example input:
```json
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":" and says how do I get to Dublin? And the answer that comes back is well I wouldn't start from here, Sonny. That is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```

Example output:
```json
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```