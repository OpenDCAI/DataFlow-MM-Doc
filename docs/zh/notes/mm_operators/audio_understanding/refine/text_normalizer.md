---
title: 文本归一化算子
createTime: 2026/02/08 21:24:44
permalink: /zh/mm_operators/ogguo75m/
---

## 📘-概述
```TextNormalizer``` 是一个文本归一化（Text Normalization）算子，用于对 DataFrame 指定列的文本进行规范化处理。它会根据 language 自动选择不同的归一化器：
- 英文 `en`：使用 `whisper_normalizer.english.EnglishTextNormalizer`
- 中文 `zh`：使用自定义 `TextNorm`（来自 `.cn_tn`，支持多种可选规则）
- 其他语言：使用 `whisper_normalizer.basic.BasicTextNormalizer`
此外可通过 `remove_puncs=True` 在归一化后进一步移除常见中英文标点符号。

## ```__init__```函数
```python
def __init__(
    self,
    language: str = "en",
    remove_puncs: bool = False,
    **kwargs,
):
```

## `init`参数说明
| 参数             | 类型     | 默认值     | 描述                                               |
| -------------- | ------ | ------- | ------------------------------------------------ |
| `language`     | `str`  | `"en"`  | 文本语言标识，用于选择归一化器：`"en"` / `"zh"` / 其他             |
| `remove_puncs` | `bool` | `False` | 是否在归一化后额外移除常见标点（基于内置正则 `PUNCS`）                  |
| `kwargs`       | `dict` | -       | 额外参数，仅在 `language="zh"` 时传给 `TextNorm` 控制中文归一化规则 |

`kwargs`（仅 `language="zh"` 生效）
| 参数               | 类型     | 默认值     | 说明                              |
| ---------------- | ------ | ------- | ------------------------------- |
| `to_banjiao`     | `bool` | `False` | 是否将全角字符转换为半角（取决于 `TextNorm` 实现） |
| `to_upper`       | `bool` | `False` | 是否转为大写                          |
| `to_lower`       | `bool` | `False` | 是否转为小写                          |
| `remove_fillers` | `bool` | `False` | 是否移除口语填充词（如“呃”“嗯”等，取决于实现）       |
| `remove_erhua`   | `bool` | `False` | 是否处理儿化音/儿化后缀（取决于实现）             |
| `check_chars`    | `bool` | `False` | 是否进行字符合法性检查/过滤（取决于实现）           |
| `remove_space`   | `bool` | `False` | 是否移除空格（取决于实现）                   |
| `cc_mode`        | `str`  | `""`    | 中文转换模式（如简繁转换等，取决于实现）            |

## `run`函数
```python
def run(
    self,
    storage: DataFlowStorage,
    input_text_key: str = "text",
):
```
执行算子主逻辑，从存储中读取输入 DataFrame , 对输入文本进行归一化。

参数
| 参数名              | 类型                | 默认值      | 说明                                                    |
| :--------------- | :---------------- | :------- | :---------------------------------------------------- |
| `storage`        | `DataFlowStorage` | **必填**   | DataFlow 数据存储对象，要求其中 `key="dataframe"` 存在一个 DataFrame |
| `input_text_key` | `str`             | `"text"` | 需要归一化的文本列名                                            |

## 🧠 示例用法
```python
from dataflow.utils.storage import FileStorage
from dataflow.operators.core_text import TextNormalizer

class TextNormalizerEval:
    def __init__(self):
        self.storage = FileStorage(
            # 本例可以参考audio_asr_pipline, 输入是audio_asr_pipeline_step1.jsonl, 输出是audio_asr_pipeline_step2.jsonl
            first_entry_file_name="/path/to/your/cache/audio_asr_pipeline_step1.jsonl",
            cache_path="./cache",
            file_name_prefix="text_normalizer",
            cache_type="jsonl",
        )

        self.op = TextNormalizer(
            language="en",
            remove_puncs=True,
            # 以下参数仅对中文 TextNorm 生效, 示例中数据为英文
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

### 🧾 默认输出格式（Output Format）
| 字段                              | 类型              | 说明                         |
| :------------------------------ | :-------------- | :------------------------- |
| `input_text_key` 对应列（默认 `text`） | `list[str]`（逐行） | 归一化后的文本，写回到 DataFrame 的同名列 |


示例输入:
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":" and says how do I get to Dublin? And the answer that comes back is well I wouldn't start from here, Sonny. That is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```

示例输出：
```jsonl
{"audio":["..\/example_data\/audio_asr_pipeline\/test.wav"],"conversation":[{"from":"human","value":""}],"transcript":"and says how do i get to dublin and the answer that comes back is well i would not start from here sonny that is to say much of political philosophy develops theories that take no account of where we actually are and how the theories that people argue about in the journals and in the literature actually could be implemented in the world if it"}
```