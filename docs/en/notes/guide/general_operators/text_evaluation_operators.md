---
title: General Data Evaluation Operators
createTime: 2025/06/09 11:43:25
permalink: /en/guide/text_evaluation_operators/
---

# Text Data Evaluation Metrics

## Text quality evaluation

Scorers are divided into the following four types, each scorer provides one or more scores.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Type</th>
      <th class="tg-0pky">Count</th>
      <th class="tg-0pky">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">APIcaller</td>
      <td class="tg-0pky">3</td>
      <td class="tg-0pky">Call API for scoring</td>
    </tr>
    <tr>
      <td class="tg-0pky">Diversity</td>
      <td class="tg-0pky">2</td>
      <td class="tg-0pky">Compute diversity score of the entire dataset</td>
    </tr>
    <tr>
      <td class="tg-0pky">Models</td>
      <td class="tg-0pky">12</td>
      <td class="tg-0pky">Model or classifier-based scoring</td>
    </tr>
    <tr>
      <td class="tg-0pky">Statistics</td>
      <td class="tg-0pky">3</td>
      <td class="tg-0pky">Statistical metric scoring</td>
    </tr>
  </tbody>
</table>

Regarding data types: **[Text]** indicates accepting single-field string input, suitable for pre-training or fine-tuning data. **[Instruction]** indicates only suitable for fine-tuning data with multi-field format input.

The types of open-source operators are quite limited. In order to achieve better data processing quality and fill the gap in data evaluation methods missing in open-source, we have meticulously designed and self-developed a new set of operators. The meanings of the labels are as follows:

🚀 Independent Innovation: Core algorithms are original developments, filling gaps in existing algorithms or further improving performance, breaking through current performance bottlenecks.

✨ Open Source Premiere: This operator is integrated into the mainstream community framework for the first time, making it easier for more developers to use and achieve open-source sharing.

### List of Scorers

#### APIcaller

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Evaluation Dimension</th>
      <th class="tg-0pky">Data Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Value Range</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">AlpagasusScorer✨</td>
      <td class="tg-0pky">Content Accuracy & Effectiveness</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">Evaluates the quality of instructions by calling GPT, returning a quality score. A higher score indicates higher instruction quality.</td>
      <td class="tg-0pky">[0, 5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2307.08701">paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PerspectiveScorer✨</td>
      <td class="tg-0pky">Safety</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Uses PerspectiveAPI to evaluate the toxicity of the text, returning a toxicity probability. A higher score indicates higher text toxicity.</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky"><a href="https://perspectiveapi.com/">API</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">TreeinstructScorer✨</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">Measures instruction complexity by generating the number of nodes in the syntax tree; more nodes indicate more complex instructions.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2308.05696">paper</a></td>
    </tr>
  </tbody>
</table>

#### Diversity

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Evaluation Dimension</th>
      <th class="tg-0pky">Data Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Value Range</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">Task2VecScorer✨</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Evaluates the diversity of the dataset using the Task2Vec method. Higher scores indicate higher dataset diversity.</td>
      <td class="tg-0pky">[0.0525±3.41E-4, 0.4037±1.932E-5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2306.13840">paper</a><br><a href="https://github.com/alycialee/beyond-scale-language-data-diversity">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">VendiScorer</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Evaluates dataset diversity by calculating VendiScore; higher scores indicate higher diversity.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2210.02410">paper</a><br><a href="https://github.com/vertaix/Vendi-Score">code</a></td>
    </tr>
  </tbody>
</table>

#### Models

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Evaluation Dimension</th>
      <th class="tg-0pky">Data Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Value Range</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">DebertaV3Scorer✨</td>
      <td class="tg-0pky">Content Accuracy & Effectiveness</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">A quality classifier based on NVIDIA's DeBERTa V3 model for evaluating text quality.</td>
      <td class="tg-0pky">{Low, Medium, High}</td>
      <td class="tg-0pky"><a href="https://huggingface.co/nvidia/quality-classifier-deberta">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">FineWebEduScorer✨</td>
      <td class="tg-0pky">Educational Value</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">A classifier for evaluating the educational value of text; higher scores indicate higher educational value.</td>
      <td class="tg-0pky">[0, 5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2406.17557">paper</a><br><a href="https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">InstagScorer✨</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">Evaluates instruction content diversity by returning the number of tags; more tags indicate higher content diversity.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2308.07074">paper</a><br><a href="https://huggingface.co/OFA-Sys/InsTagger">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PerplexityScorer</td>
      <td class="tg-0pky">Fluency & Understandability</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Calculates text perplexity using the KenLM model; lower scores indicate higher fluency and understandability.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://aclanthology.org/W11-2123.pdf">paper</a><br><a href="https://huggingface.co/edugp/kenlm/tree/main">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">QuratingScorer✨</td>
      <td class="tg-0pky">Content Accuracy & Effectiveness、 Educational Value</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Evaluates text quality using the Qurating model; higher scores indicate higher quality.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2402.09739">paper</a><br><a href="https://github.com/princeton-nlp/QuRating">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PairQualScorer🚀</td>
      <td class="tg-0pky">Educational Value</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Evaluates the quality of text using the PairQual model, based on the BGE model. It supports both Chinese and English. It is trained by scoring pairwise comparisons of texts using GPT. A higher score indicates better quality.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><br><a href="https://huggingface.co/zks2856/PairQual-Scorer-en">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PresidioScorer✨</td>
      <td class="tg-0pky">Safety</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Using the Microsoft Presidio model, identify private entities (PII) in text such as credit card numbers, names, locations, etc. The scorer returns the number of PII information.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://github.com/microsoft/presidio">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SuperfilteringScorer✨</td>
      <td class="tg-0pky">Fluency & Understandability</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">Evaluates the following difficulty of instructions using the Superfiltering method; higher scores indicate more difficult instructions to follow.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2402.00530">paper</a><br><a href="https://github.com/tianyi-lab/Superfiltering">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">TextbookScorer✨</td>
      <td class="tg-0pky">Educational Value</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">A textbook quality classifier based on FastText, used to evaluate the educational value of text.</td>
      <td class="tg-0pky">[0, 2]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2306.11644">paper</a><br><a href="https://huggingface.co/kenhktsui/llm-data-textbook-quality-fasttext-classifier-v2">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">DeitaQualityScorer✨</td>
      <td class="tg-0pky">Content Accuracy & Effectiveness</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">An instruction quality scorer based on the Llama model; higher scores indicate higher instruction quality.</td>
      <td class="tg-0pky">[1, 6]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2312.15685">paper</a><br><a href="https://huggingface.co/hkust-nlp/deita-quality-scorer">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">DeitaComplexityScorer✨</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Instruction</td>
      <td class="tg-0pky">An instruction complexity scorer based on the Llama model; higher scores indicate higher instruction complexity.</td>
      <td class="tg-0pky">[1,6]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2312.15685">paper</a><br><a href="https://huggingface.co/hkust-nlp/deita-complexity-scorer">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">RMScorer✨</td>
      <td class="tg-0pky">Fluency & Understandability</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">A reward-model-deberta-v3-large-v2 scorer based on human value judgment. High scores represent higher quality.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://huggingface.co/OpenAssistant/reward-model-deberta-v3-large-v2">code</a></td>
    </tr>
  </tbody>
</table>

#### Statistics

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Evaluation Dimension</th>
      <th class="tg-0pky">Data Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Value Range</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">LangkitScorer</td>
      <td class="tg-0pky">Text Structure, Fluency & Understandability</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Calculates statistical information of text using the Langkit toolkit, such as word count, sentence count, syllable count, etc., to help evaluate the structural complexity and readability of the text.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://github.com/whylabs/langkit">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">LexicalDiversityScorer✨</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Calculates lexical diversity scores using MTLD and HD-D methods; higher scores represent richer vocabulary use, reflecting the diversity and complexity of the text.</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://link.springer.com/article/10.3758/BRM.42.2.381">paper</a><br><a href="https://github.com/jennafrens/lexical_diversity/tree/master">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">NgramScorer</td>
      <td class="tg-0pky">Diversity & Complexity</td>
      <td class="tg-0pky">Text</td>
      <td class="tg-0pky">Calculates the repetition ratio of n-grams in the text to measure text repetition; higher scores indicate lower repetition of n-grams in the text.</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

### Quality Evaluation System

To provide more precise data quality evaluation, we have constructed a quality evaluation system based on existing classifiers. Specifically, the output score metrics of each scorer include the following six dimensions.

#### 1. Text Structure

- **LangkitScorer**: LangkitSentenceCountScore, LangkitCharacterCountScore, LangkitLetterCountScore, LangkitSyllableCountScore, LangkitPolysyllableCountScore, LangkitMonosyllableCountScore, LangkitLexiconCountScore, LangkitDifficultWordsScore

#### 2. Diversity & Complexity

- **LexicalDiversityScorer**: LexicalDiversityMTLDScore, LexicalDiversityHD-DScore
- **NgramScorer**: NgramScore
- **InstagScorer**: InstagScore
- **TreeinstructScorer**: TreeinstructScore
- **Task2VecScorer**: Task2VecDiversityScore (ConfidenceInterval)
- **VendiScorer**: N-gramsVendiScore, BERTVendiScore, SimCSEVendiScore
- **DeitaComplexityScorer:** DeitaComplexityScore

#### 3. Fluency & Understandability

- **LangkitScorer**: LangkitFleschReadingEaseScore, LangkitAutomatedReadabilityIndexScore, LangkitAggregateReadingLevelScore
- **PerplexityScorer**: PerplexityScore
- **QuratingScorer**: QuratingWritingStyleScore
- **SuperfilteringScorer**: SuperfilteringScore
- **RMScorer**: RMScore

#### 4. Safety

- **PerspectiveScorer**: PerspectiveScore
- **PresidioScorer**: PresidioScore

#### 5. Educational Value

- **TextbookScorer**: TextbookScore
- **FineWebEduScorer**: FineWebEduScore
- **QuratingScorer**: QuratingEducationalValueScore
- **PairQualScorer**: PairQualScore

#### 6. Content Accuracy & Effectiveness

- **QuratingScorer**: QuratingRequiredExpertiseScore, QuratingFactsAndTriviaScore
- **DebertaV3Scorer**: DebertaV3Score
- **AlpagasusScorer**: AlpagasusScore
- **DeitaScorer**: DeitaScore

### Benchmark Values

To better provide data quality references, we randomly selected 5k data samples from the currently considered high-quality datasets [Fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb) and [alpaca-cleaned](https://huggingface.co/datasets/yahma/alpaca-cleaned) based on data types, and tested the benchmark values of some scorers.

<table class="tg"><thead>
  <tr>
    <th class="tg-0pky">Scorer Name</th>
    <th class="tg-0pky">Score Metric Name</th>
    <th class="tg-0pky">Description</th>
    <th class="tg-0pky">Mean</th>
    <th class="tg-0pky">Variance</th>
    <th class="tg-0pky">Max</th>
    <th class="tg-0pky">Min</th>
  </tr></thead>
<tbody>
  <tr>
    <td class="tg-0pky" rowspan="1">PerspectiveScorer</td>
    <td class="tg-0pky">PerspectiveScore</td>
    <td class="tg-0pky">Evaluates the toxicity of the text, checking for potential insults or inappropriate language. <b>The higher the score, the higher the toxicity</b></td>
    <td class="tg-0pky">0.0426</td>
    <td class="tg-0pky">0.0025</td>
    <td class="tg-0pky">0.2610</td>
    <td class="tg-0pky">0.0026</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="2">LexicalDiversityScorer</td>
    <td class="tg-0pky">LexicalDiversityMTLDScore</td>
    <td class="tg-0pky">Measures the lexical diversity of the text; higher scores indicate more varied vocabulary usage.<b>The higher the score, the higher the lexical diversity</b></td>
    <td class="tg-0pky">100.5990</td>
    <td class="tg-0pky">1625.1318</td>
    <td class="tg-0pky">1165.7164</td>
    <td class="tg-0pky">14.8439</td>
  </tr>
  <tr>
    <td class="tg-0pky">LexicalDiversityHD-DScore</td>
    <td class="tg-0pky">Used to measure the lexical diversity of the text, calculated based on discrete distribution.<b>The higher the score, the higher the lexical diversity</b></td>
    <td class="tg-0pky">0.8487</td>
    <td class="tg-0pky">0.0014</td>
    <td class="tg-0pky">0.9873</td>
    <td class="tg-0pky">0.5570</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">NgramScorer</td>
    <td class="tg-0pky">NgramScore</td>
    <td class="tg-0pky">Calculate the repetition ratio of n-grams in the text to measure the degree of repetition. <b>The higher the score, the lower the n-gram repetition.</b></td>
    <td class="tg-0pky">0.9938</td>
    <td class="tg-0pky">0.0002</td>
    <td class="tg-0pky">1.0</td>
    <td class="tg-0pky">0.8285</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="11">LangkitScorer</td>
    <td class="tg-0pky">LangkitFleschReadingEaseScore</td>
    <td class="tg-0pky">Measures Flesch text readability. <b>The higher the score, the easier readability.</b></td>
    <td class="tg-0pky">55.1870</td>
    <td class="tg-0pky">324.8975</td>
    <td class="tg-0pky">106.37</td>
    <td class="tg-0pky">-144.75</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitAutomatedReadabilityIndexScore</td>
    <td class="tg-0pky">Automated readability index based on sentence length and vocabulary difficulty.<b>The higher the score, the more difficult readability</b></td>
    <td class="tg-0pky">11.7727</td>
    <td class="tg-0pky">19.4117</td>
    <td class="tg-0pky">98.2</td>
    <td class="tg-0pky">0.9</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitAggregateReadingLevelScore</td>
    <td class="tg-0pky">Aggregate reading difficulty score of the text.<b>The higher the score, the more difficult readability</b></td>
    <td class="tg-0pky">11.2332</td>
    <td class="tg-0pky">13.6816</td>
    <td class="tg-0pky">77.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitSyllableCountScore</td>
    <td class="tg-0pky">Counts the total number of syllables in the text. <b>The higher the score, the more syllables there are.</b></td>
    <td class="tg-0pky">815.3852</td>
    <td class="tg-0pky">2299853.7272</td>
    <td class="tg-0pky">43237</td>
    <td class="tg-0pky">32</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitLexiconCountScore</td>
    <td class="tg-0pky">Counts the total number of words in the text. <b>The higher the score, the more words there are.</b></td>
    <td class="tg-0pky">524.178</td>
    <td class="tg-0pky">1061058.5875</td>
    <td class="tg-0pky">33033</td>
    <td class="tg-0pky">23</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitSentenceCountScore</td>
    <td class="tg-0pky">Counts the total number of sentences in the text. <b>The higher the score, the more sentences there are.</b></td>
    <td class="tg-0pky">28.9664</td>
    <td class="tg-0pky">3618.2549</td>
    <td class="tg-0pky">2193</td>
    <td class="tg-0pky">1</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitCharacterCountScore</td>
    <td class="tg-0pky">Counts the total number of characters in the text. <b>The higher the score, the more characters there are.</b></td>
    <td class="tg-0pky">2610.2462</td>
    <td class="tg-0pky">23580442.8820</td>
    <td class="tg-0pky">139807</td>
    <td class="tg-0pky">118</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitLetterCountScore</td>
    <td class="tg-0pky">Counts the total number of letters in the text. <b>The higher the score, the more letters there are.</b></td>
    <td class="tg-0pky">2513.4572</td>
    <td class="tg-0pky">21890120.2030</td>
    <td class="tg-0pky">134507</td>
    <td class="tg-0pky">109</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitPolysyllableCountScore</td>
    <td class="tg-0pky">Counts the number of polysyllabic words in the text. <b>The higher the score, the more polysyllabic words there are.</b></td>
    <td class="tg-0pky">78.8834</td>
    <td class="tg-0pky">18918.1990</td>
    <td class="tg-0pky">3261</td>
    <td class="tg-0pky">0</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitMonosyllableCountScore</td>
    <td class="tg-0pky">Counts the number of monosyllabic words, which are usually related to the text's simplicity. <b>The higher the score, the more monosyllabic words there are.</b></td>
    <td class="tg-0pky">334.6674</td>
    <td class="tg-0pky">503285.5160</td>
    <td class="tg-0pky">25133</td>
    <td class="tg-0pky">13</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitDifficultWordsScore</td>
    <td class="tg-0pky">Counts the number of difficult words in the text. <b>The higher the score, the more difficult words there are.</b></td>
    <td class="tg-0pky">93.4112</td>
    <td class="tg-0pky">14401.2789</td>
    <td class="tg-0pky">2366</td>
    <td class="tg-0pky">4</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">TextbookScorer</td>
      <td class="tg-0pky">TextbookScore</td>
      <td class="tg-0pky">Tests whether the text meets textbook standards. <b>The higher the score, the closer the text is to an ideal textbook.</b></td>
      <td class="tg-0pky">0.9255</td>
      <td class="tg-0pky">0.1779</td>
      <td class="tg-0pky">1.9867</td>
      <td class="tg-0pky">0.0001</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">FineWebEduScorer</td>
      <td class="tg-0pky">FineWebEduScore</td>
      <td class="tg-0pky">Measures the educational value of the text. <b>The higher the score, the greater the educational value.</b></td>
      <td class="tg-0pky">1.1901</td>
      <td class="tg-0pky">0.4924</td>
      <td class="tg-0pky">4.6827</td>
      <td class="tg-0pky">-0.6319</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">DebertaV3Scorer</td>
      <td class="tg-0pky">DebertaV3Score</td>
      <td class="tg-0pky">Text evaluation using the DebertaV3 model. <b>Quality scores are classified as high, medium, or low.</b></td>
      <td class="tg-0pky">Medium: 3180 times</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">High: 1412 times</td>
      <td class="tg-0pky">Low: 408 times</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">PerplexityScorer</td>
      <td class="tg-0pky">PerplexityScore</td>
      <td class="tg-0pky">Measures the perplexity of the text. <b>The higher the score, the greater the model's perplexity.</b></td>
      <td class="tg-0pky">564.3942</td>
      <td class="tg-0pky">165893.5542</td>
      <td class="tg-0pky">8271.0</td>
      <td class="tg-0pky">13.9</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="4">QuratingScorer</td>
      <td class="tg-0pky">QuratingWritingStyleScore</td>
      <td class="tg-0pky">Evaluates the quality of the text's writing style. <b>The higher the score, the better the writing style.</b></td>
      <td class="tg-0pky">0.6453</td>
      <td class="tg-0pky">6.7949</td>
      <td class="tg-0pky">8.375</td>
      <td class="tg-0pky">-7.3474</td>
  </tr>
  <tr>
      <td class="tg-0pky">QuratingRequiredExpertiseScore</td>
      <td class="tg-0pky">Measures the level of expertise required for the text. <b>The higher the score, the more expertise is required.</b></td>
      <td class="tg-0pky">-0.4661</td>
      <td class="tg-0pky">7.0458</td>
      <td class="tg-0pky">9.0</td>
      <td class="tg-0pky">-8.25</td>
  </tr>
  <tr>
      <td class="tg-0pky">QuratingFactsAndTriviaScore</td>
      <td class="tg-0pky">Tests whether the text contains facts and trivia. <b>The higher the score, the more facts and trivia the text contains.</b></td>
      <td class="tg-0pky">0.1889</td>
      <td class="tg-0pky">4.5678</td>
      <td class="tg-0pky">7.4688</td>
      <td class="tg-0pky">-6.0993</td>
  </tr>
  <tr>
      <td class="tg-0pky">QuratingEducationalValueScore</td>
      <td class="tg-0pky">Measures the educational value of the text. <b>The higher the score, the greater the educational value.</b></td>
      <td class="tg-0pky">1.2946</td>
      <td class="tg-0pky">11.2196</td>
      <td class="tg-0pky">11.5625</td>
      <td class="tg-0pky">-8.7843</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">InstagScorer</td>
      <td class="tg-0pky">InstagScore</td>
      <td class="tg-0pky">Evaluates the content diversity by returning the number of tags. <b>The higher the score, the greater the content diversity.</b></td>
      <td class="tg-0pky">2.304</td>
      <td class="tg-0pky">2.9396</td>
      <td class="tg-0pky">11</td>
      <td class="tg-0pky">1</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">SuperfilteringScorer</td>
      <td class="tg-0pky">SuperfilteringScore</td>
      <td class="tg-0pky">Evaluates the instruction-following difficulty using the Superfiltering method. <b>The higher the score, the more difficult it is to follow the instructions.</b></td>
      <td class="tg-0pky">1.3223</td>
      <td class="tg-0pky">836.0302</td>
      <td class="tg-0pky">1978.6534</td>
      <td class="tg-0pky">0.0011</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">DeitaQualityScorer</td>
      <td class="tg-0pky">DeitaQualityScore</td>
      <td class="tg-0pky">Instruction quality evaluation based on the Llama model. <b>The higher the score, the better the quality of the instructions.</b></td>
      <td class="tg-0pky">3.5629</td>
      <td class="tg-0pky">0.9247</td>
      <td class="tg-0pky">5.5309</td>
      <td class="tg-0pky">1.0840</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">DeitaComplexityScorer</td>
      <td class="tg-0pky">DeitaComplexityScore</td>
      <td class="tg-0pky">Instruction complexity evaluation based on the Llama model. <b>The higher the score, the greater the complexity of the instructions.</b></td>
      <td class="tg-0pky">1.4936</td>
      <td class="tg-0pky">0.2086</td>
      <td class="tg-0pky">3.3207</td>
      <td class="tg-0pky">1.0001</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="3">VendiScorer</td>
      <td class="tg-0pky">N-grams_VendiScore</td>
      <td class="tg-0pky">Evaluates text diversity based on N-grams embeddings. <b>The higher the score, the greater the dataset diversity.</b></td>
      <td class="tg-0pky">1832.96</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
  </tr>
  <tr>
      <td class="tg-0pky">BERT_VendiScore</td>
      <td class="tg-0pky">Evaluates text diversity based on BERT embeddings. <b>The higher the score, the greater the dataset diversity.</b></td>
      <td class="tg-0pky">1.83</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
  </tr>
  <tr>
      <td class="tg-0pky">SimCSE_VendiScore</td>
      <td class="tg-0pky">Evaluates text diversity based on SimCSE embeddings. <b>The higher the score, the greater the dataset diversity.</b></td>
      <td class="tg-0pky">68.94</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">Task2VecScorer</td>
      <td class="tg-0pky">Task2VecScore</td>
      <td class="tg-0pky">Evaluates dataset diversity using Task2Vec diversity coefficient. <b>The higher the score, the greater the dataset diversity.</b></td>
      <td class="tg-0pky">0.0673</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">-</td>
  </tr>
  <tr>
      <td class="tg-0pky" rowspan="1">AlpagasusScorer</td>
      <td class="tg-0pky">AlpagasusScore</td>
      <td class="tg-0pky">Evaluates instruction quality using ChatGPT. <b>The higher the score, the better the quality of the instructions.</b></td>
      <td class="tg-0pky">4.172</td>
      <td class="tg-0pky">0.2164</td>
      <td class="tg-0pky">5.0</td>
      <td class="tg-0pky">2.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">TreeinstructScorer</td>
    <td class="tg-0pky">TreeinstructScore</td>
    <td class="tg-0pky">Uses ChatGPT to evaluate the semantic complexity of instructions. <b>The higher the score, the greater the semantic complexity of the instruction.</b></td>
    <td class="tg-0pky">6.494</td>
    <td class="tg-0pky">9.7540</td>
    <td class="tg-0pky">63.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">PresidioScorer</td>
    <td class="tg-0pky">PresidioScore</td>
    <td class="tg-0pky">Uses Presidio to evaluate the number of PII (Personally Identifiable Information) instances. <b>The higher the score, the more PII information is present in the text.</b></td>
    <td class="tg-0pky">21.4008</td>
    <td class="tg-0pky">2915.3542</td>
    <td class="tg-0pky">1786.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">RMScorer</td>
    <td class="tg-0pky">RMScore</td>
    <td class="tg-0pky">Uses a reward model based on human values to evaluate the quality of SFT (Supervised Fine-Tuning) data. <b>The higher the score, the better the data quality.</b></td>
    <td class="tg-0pky">3.1537</td>
    <td class="tg-0pky">9.9461</td>
    <td class="tg-0pky">8.6803</td>
    <td class="tg-0pky">-4.9680</td>
  </tr>
</tbody>
</table>

## Detailed Operator Descriptions

### APIcaller Operators

#### 1. AlpagasusScorer✨

**Function Description:** This operator evaluates instruction quality using GPT, returning a quality score where higher scores indicate better instruction quality. Based on the Alpagasus method, it is specifically designed for evaluating the quality and effectiveness of instruction data.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (required, must implement LLMServingABC interface)
  - `dimension`: Evaluation dimension (default: "quality")
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Field name for instruction
  - `input_input_key`: Field name for input text
  - `input_output_key`: Field name for output text
  - `output_key`: Field name for output score (default: "AlpagasusScore")

**Key Features:**

- GPT-based intelligent quality assessment
- Support for custom evaluation dimensions
- Automatic score parsing
- Suitable for instruction fine-tuning data quality evaluation

**Usage Example:**

```python
alpagasus_scorer = AlpagasusScorer(
          llm_serving=api_llm_serving,
          dimension="quality"
          )
alpagasus_scorer.run(
          storage=self.storage.step(),
          input_instruction_key="instruction",
          input_input_key="input",
          input_output_key="output",
          output_key="AlpagasusScore"
          )
```

#### 2. PerspectiveScorer✨

**Function Description:** This operator assesses text toxicity using PerspectiveAPI, returning toxicity probability where higher scores indicate more toxicity. Specifically designed for detecting harmful content and inappropriate language in text.

**Input Parameters:**

- `__init__()`
  - `serving`: Perspective API serving object
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Field name for input text
  - `output_key`: Field name for output score (default: "PerspectiveScore")

**Key Features:**

- Google Perspective API-based toxicity detection
- Automatic text length limit handling (max 20KB)
- Batch processing support
- Returns 0-1 range toxicity probability

**Usage Example:**

```python
perspective_scorer = PerspectiveScorer(serving=perspective_api_serving)
perspective_scorer.run(
          storage=self.storage.step(),
          input_key="text",
          output_key="PerspectiveScore"
          )
```

#### 3. TreeinstructScore✨

**Function Description:** This operator measures instruction complexity by generating syntax tree node counts; more nodes indicate higher complexity. Based on syntax analysis methods to evaluate the structural complexity of instructions.

**Input Parameters:**

- `__init__()`
  - No special parameters required
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Field name for instruction
  - `output_key`: Field name for output score (default: "TreeinstructScore")

**Key Features:**

- Syntax tree analysis-based complexity evaluation
- Automatic instruction syntax structure parsing
- Quantified instruction complexity
- Suitable for instruction diversity analysis

**Usage Example:**

```python
treeinstruct_scorer = TreeinstructScore()
treeinstruct_scorer.run(
          storage=self.storage.step(),
          input_instruction_key="instruction",
          output_key="TreeinstructScore"
          )
```


### Diversity Operators

#### 1. Task2VecScorer✨

**Function Description:** This operator assesses dataset diversity using the Task2Vec method; higher scores indicate greater diversity. Based on task embedding methods to calculate similarity and diversity between datasets.

**Input Parameters:**

- `__init__()`
  - No special parameters required
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Field name for input text

**Key Features:**

- Task2Vec method-based diversity evaluation
- Confidence interval calculation
- Suitable for task-level diversity analysis
- Open source first algorithm

**Usage Example:**

```python
task2vec_scorer = Task2VecScorer()
result = task2vec_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```

#### 2. VendiScorer

**Function Description:** This operator assesses dataset diversity using VendiScore with embeddings from BERT and SimCSE models. VendiScore is a diversity measurement method based on kernel matrix eigenvalues that can effectively evaluate dataset richness and coverage.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Field name for input text

**Key Features:**

- Multi-model evaluation: Uses BERT, SimCSE, and N-gram methods
- Embedding-based diversity calculation
- Suitable for entire dataset diversity evaluation
- GPU acceleration support

**Output Format:**

- `N-gramsVendiScore`: N-gram-based diversity score
- `BERTVendiScore`: BERT-based diversity score
- `SimCSEVendiScore`: SimCSE-based diversity score

**Usage Example:**

```python
vendi_scorer = VendiScorer(device="cuda")
result = vendi_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```


### Models Operators


#### 1. DebertaV3Scorer✨

**Function Description:** A text quality classifier based on Nvidia Deberta V3 model for evaluating text quality. This operator classifies text into three quality levels: High, Medium, and Low, suitable for large-scale text quality filtering.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 32)
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "DebertaV3Score")

**Key Features:**

- High-precision text quality classification based on DeBERTa-v3-large model
- Three-level quality classification: High, Medium, Low
- Supports batch processing for improved efficiency
- GPU-accelerated computation
- Suitable for quality evaluation of various text types

**Evaluation Dimension:** Content Accuracy & Effectiveness

**Data Type:** Text

**Value Range:** \{Low, Medium, High\}

**Usage Example:**

```python
deberta_scorer = DebertaV3Scorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=32
)
deberta_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="DebertaV3Score"
)
```

#### 2. FineWebEduScorer✨

**Function Description:** A classifier for evaluating the educational value of text, trained on the FineWeb-Edu dataset. This operator can identify educationally meaningful text content, providing support for educational resource filtering and curriculum content development.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 32)
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "FineWebEduScore")

**Key Features:**

- Specifically designed for educational value assessment
- Trained on large-scale educational text data
- Fine-grained scoring from 0-5
- Supports multilingual text evaluation
- Efficient batch processing capability

**Evaluation Dimension:** Educational Value

**Data Type:** Text

**Value Range:** [0, 5]

**Usage Example:**

```python
fineweb_edu_scorer = FineWebEduScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=32
)
fineweb_edu_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="FineWebEduScore"
)
```

#### 3. InstagScorer✨

**Function Description:** Evaluates instruction content diversity by returning the number of tags; more tags indicate greater content diversity. This operator is based on the InsTagger model and can automatically identify different topics and task types involved in instructions.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 16)
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Instruction field name (default: "instruction")
  - `output_key`: Output score field name (default: "InstagScore")

**Key Features:**

- Multi-label classification based on InsTagger model
- Automatically identifies task types and topics involved in instructions
- Quantifies instruction content diversity
- Supports fine-grained analysis of complex instructions
- Suitable for diversity evaluation of instruction datasets

**Evaluation Dimension:** Diversity & Complexity

**Data Type:** Instruction

**Value Range:** Positive integer (number of tags)

**Usage Example:**

```python
instag_scorer = InstagScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=16
)
instag_scorer.run(
    storage=self.storage.step(),
    input_instruction_key="instruction",
    output_key="InstagScore"
)
```

#### 4. PerplexityScorer

**Function Description:** Calculates text perplexity based on Kenlm model; lower perplexity indicates higher fluency and understandability. This operator uses statistical language models to evaluate text naturalness and language quality.

**Input Parameters:**

- `__init__()`
  - `model_path`: Kenlm model path (default: preset model path)
  - `language`: Language type (default: "en")
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "PerplexityScore")

**Key Features:**

- Based on n-gram statistical language model
- Fast text perplexity calculation
- Supports multiple languages
- Low memory usage with high computational efficiency
- Suitable for large-scale text fluency evaluation

**Evaluation Dimension:** Fluency & Understandability

**Data Type:** Text

**Value Range:** Positive number (perplexity value, lower is better)

**Usage Example:**

```python
perplexity_scorer = PerplexityScorer(
    model_path="./models/kenlm_model.bin",
    language="en"
)
perplexity_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="PerplexityScore"
)
```


#### 5. QuratingScorer✨

**Function Description:** Evaluates text quality through the Qurating model; higher scores indicate better quality. This operator is based on a multi-dimensional evaluation framework and can assess text quality from multiple perspectives including writing style, educational value, and required expertise.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 16)
  - `max_length`: Maximum sequence length (default: 512)
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "QuratingScore")

**Key Features:**

- Multi-dimensional text quality evaluation
- Trained on large-scale high-quality text
- Supports long text processing
- Provides fine-grained quality scoring
- Suitable for academic and professional text evaluation

**Evaluation Dimension:** Content Accuracy & Effectiveness, Educational Value

**Data Type:** Text

**Value Range:** Continuous values (higher is better)

**Output Metrics:**
- `QuratingWritingStyleScore`: Writing style score
- `QuratingEducationalValueScore`: Educational value score
- `QuratingRequiredExpertiseScore`: Required expertise score
- `QuratingFactsAndTriviaScore`: Facts and knowledge score

**Usage Example:**

```python
qurating_scorer = QuratingScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=16,
    max_length=512
)
qurating_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="QuratingScore"
)
```

#### 6. PairQualScorer🚀

**Function Description:** Evaluates text quality through the PairQual model based on bge model, supporting Chinese and English, trained with GPT pairwise comparison scoring. This is an independently innovative operator specifically optimized for Chinese and English text quality evaluation.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 32)
  - `language`: Language type (default: "auto", auto-detection)
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "PairQualScore")

**Key Features:**

- Bilingual quality evaluation based on BGE model
- Trained with GPT pairwise comparison data
- Supports Chinese and English evaluation
- Independent innovation algorithm
- High-precision quality judgment capability

**Evaluation Dimension:** Educational Value

**Data Type:** Text

**Value Range:** Continuous values (higher is better)

**Usage Example:**

```python
pairqual_scorer = PairQualScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=32,
    language="auto"
)
pairqual_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="PairQualScore"
)
```

#### 7. PresidioScorer✨

**Function Description:** Uses Microsoft Presidio model to identify personally identifiable information (PII) in text such as credit card numbers, names, locations, etc. The scorer returns the count of PII information for evaluating text privacy safety.

**Input Parameters:**

- `__init__()`
  - `language`: Language type (default: "en")
  - `entities`: List of entity types to detect (default: ["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "LOCATION"])
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "PresidioScore")

**Key Features:**

- PII detection based on Microsoft Presidio
- Supports recognition of multiple personal information types
- Customizable entity types for detection
- Supports multilingual text processing
- High-precision privacy information identification

**Evaluation Dimension:** Safety

**Data Type:** Text

**Value Range:** Non-negative integer (number of PII entities)

**Detected PII Types:**
- PERSON: Person names
- EMAIL_ADDRESS: Email addresses
- PHONE_NUMBER: Phone numbers
- CREDIT_CARD: Credit card numbers
- LOCATION: Geographic locations
- Other configurable types

**Usage Example:**

```python
presidio_scorer = PresidioScorer(
    language="en",
    entities=["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "LOCATION"]
)
presidio_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="PresidioScore"
)
```

#### 8. SuperfilteringScorer✨

**Function Description:** Uses Superfiltering method to evaluate instruction following difficulty; higher scores indicate instructions are harder to follow. This operator is based on instruction complexity analysis and helps identify instructions requiring advanced reasoning capabilities.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 16)
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Instruction field name (default: "instruction")
  - `input_output_key`: Output field name (default: "output")
  - `output_key`: Output score field name (default: "SuperfilteringScore")

**Key Features:**

- Difficulty evaluation based on Superfiltering method
- Evaluates instruction following complexity
- Identifies instructions requiring advanced reasoning
- Supports instruction-response pair analysis
- Suitable for instruction data quality filtering

**Evaluation Dimension:** Fluency & Understandability

**Data Type:** Instruction

**Value Range:** Continuous values (higher indicates harder to follow)

**Usage Example:**

```python
superfiltering_scorer = SuperfilteringScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=16
)
superfiltering_scorer.run(
    storage=self.storage.step(),
    input_instruction_key="instruction",
    input_output_key="output",
    output_key="SuperfilteringScore"
)
```

#### 9. TextbookScorer✨

**Function Description:** A textbook quality classifier based on FastText classifier for evaluating educational value of text. This operator is specifically designed for educational content and can identify text with textbook quality.

**Input Parameters:**

- `__init__()`
  - `model_path`: FastText model path (default: preset model path)
  - `threshold`: Classification threshold (default: 0.5)
- `run()`
  - `storage`: Storage interface object
  - `input_key`: Input text field name
  - `output_key`: Output score field name (default: "TextbookScore")

**Key Features:**

- Efficient text classification based on FastText
- Specifically optimized for educational content
- Fast inference speed
- Low memory usage
- Suitable for large-scale educational text filtering

**Evaluation Dimension:** Educational Value

**Data Type:** Text

**Value Range:** [0, 2]

**Classification Standards:**
- 0: Non-educational content
- 1: General educational content
- 2: High-quality educational content

**Usage Example:**

```python
textbook_scorer = TextbookScorer(
    model_path="./models/textbook_classifier.bin",
    threshold=0.5
)
textbook_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="TextbookScore"
)
```

#### 10. DeitaQualityScorer✨

**Function Description:** A Llama-based Deita instruction quality evaluator; higher scores indicate better instruction quality. This operator evaluates instruction quality by generating 1-6 quality scores, particularly suitable for quality filtering of instruction fine-tuning data.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `max_length`: Maximum sequence length (default: 512)
  - `batch_size`: Batch processing size (default: 8)
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Instruction text field name (default: "instruction")
  - `input_output_key`: Output text field name (default: "output")
  - `output_key`: Output score field name (default: "DeitaQualityScore")

**Key Features:**

- Professional quality evaluation based on Llama model
- Fine-grained 1-6 scoring
- Uses softmax probability distribution to calculate final score
- Supports batch processing and GPU acceleration
- Specifically optimized for instruction-response pairs

**Evaluation Dimension:** Content Accuracy & Effectiveness

**Data Type:** Instruction

**Value Range:** [1, 6]

**Scoring Standards:**
- 1 point: Very poor quality, unclear instructions or irrelevant responses
- 2 points: Poor quality, obvious problems exist
- 3 points: Average quality, basically usable but with room for improvement
- 4 points: Good quality, clear instructions and appropriate responses
- 5 points: Very good quality, high-quality instruction-response pairs
- 6 points: Excellent quality, perfect instruction-response pairs

**Usage Example:**

```python
deita_quality_scorer = DeitaQualityScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    max_length=512,
    batch_size=8
)
deita_quality_scorer.run(
    storage=self.storage.step(),
    input_instruction_key="instruction",
    input_output_key="output",
    output_key="DeitaQualityScore"
)
```

#### 11. DeitaComplexityScorer✨

**Function Description:** A Llama-based Deita instruction complexity evaluator; higher scores indicate greater instruction complexity. This operator evaluates the cognitive complexity and execution difficulty of instructions, helping identify challenging instructions.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `max_length`: Maximum sequence length (default: 512)
  - `batch_size`: Batch processing size (default: 8)
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Instruction text field name (default: "instruction")
  - `input_output_key`: Output text field name (default: "output")
  - `output_key`: Output score field name (default: "DeitaComplexityScore")

**Key Features:**

- Complexity evaluation based on Llama model
- 1-6 complexity scoring
- Evaluates cognitive load of instructions
- Identifies instructions requiring advanced reasoning
- Supports difficulty stratification of instruction datasets

**Evaluation Dimension:** Diversity & Complexity

**Data Type:** Instruction

**Value Range:** [1, 6]

**Complexity Standards:**
- 1 point: Very simple, basic operations
- 2 points: Simple, direct tasks
- 3 points: Medium, requires some thinking
- 4 points: Complex, requires multi-step reasoning
- 5 points: Very complex, requires advanced reasoning
- 6 points: Extremely complex, requires professional knowledge

**Usage Example:**

```python
deita_complexity_scorer = DeitaComplexityScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    max_length=512,
    batch_size=8
)
deita_complexity_scorer.run(
    storage=self.storage.step(),
    input_instruction_key="instruction",
    input_output_key="output",
    output_key="DeitaComplexityScore"
)
```

#### 12. RMScorer✨

**Function Description:** A quality scorer based on human value judgment reward model reward-model-deberta-v3-large-v2. Higher scores represent better quality. This operator uses reward models trained with human feedback to evaluate text quality.

**Input Parameters:**

- `__init__()`
  - `device`: Computing device (default: "cuda")
  - `model_cache_dir`: Model cache directory (default: "./dataflow_cache")
  - `batch_size`: Batch processing size (default: 16)
  - `max_length`: Maximum sequence length (default: 512)
- `run()`
  - `storage`: Storage interface object
  - `input_instruction_key`: Instruction field name (default: "instruction")
  - `input_output_key`: Output field name (default: "output")
  - `output_key`: Output score field name (default: "RMScore")

**Key Features:**

- Reward model trained with human feedback
- Reflects human value judgments and preferences
- Suitable for dialogue and instruction response evaluation
- High-precision quality judgment
- Supports multi-turn dialogue evaluation

**Evaluation Dimension:** Fluency & Understandability

**Data Type:** Instruction

**Value Range:** Continuous values (higher indicates better quality)

**Evaluation Standards:**
- Considers response helpfulness
- Evaluates content safety
- Judges answer accuracy
- Measures expression clarity

**Usage Example:**

```python
rm_scorer = RMScorer(
    device="cuda",
    model_cache_dir="./dataflow_cache",
    batch_size=16,
    max_length=512
)
rm_scorer.run(
    storage=self.storage.step(),
    input_instruction_key="instruction",
    input_output_key="output",
    output_key="RMScore"
)
```

### Statistics Operators

#### 1. LexicalDiversityScorer ✨

**Function Description:**
This operator computes the lexical diversity of a text using the MTLD (Measure of Textual Lexical Diversity) and HDD (Hypergeometric Distribution Diversity) methods to evaluate the richness of vocabulary and expressive variety.

**Input Parameters:**

* `__init__()`

  * No special parameters required.
* `run()`

  * `storage`: Storage interface object
  * `input_key`: Field name of the input text

**Key Features:**

* **MTLD method**: Measures how many words are needed to maintain a specified TTR (type-token ratio) threshold, assessing lexical diversity.
* **HDD method**: Estimates lexical richness based on sampling using hypergeometric distribution.
* Automatically handles punctuation and casing.
* Adaptively evaluates texts of varying lengths.

**Input Requirements:**

* MTLD evaluation: Requires texts longer than 50 words.
* HDD evaluation: Text length should be between 50 and 1000 words.

**Output Format:**

* `LexicalDiversityMTLDScore`: MTLD diversity score (higher = better diversity)
* `LexicalDiversityHD-DScore`: HDD diversity score (higher = better diversity)

**Usage Example:**

```python
lexical_scorer = LexicalDiversityScorer()
lexical_scorer.run(
    storage=self.storage.step(),
    input_key="text"
)
```

---

#### 2. LangkitScorer

**Function Description:**
This operator uses the Langkit toolkit to compute statistical information about a text, such as word count, sentence count, and syllable count, aiding in the assessment of structural complexity and readability.

**Input Parameters:**

* `__init__()`

  * No special parameters required.
* `run()`

  * `storage`: Storage interface object
  * `input_key`: Field name of the input text

**Key Features:**

* Comprehensive statistical analysis of text
* Multi-dimensional readability evaluation
* Includes Flesch readability score
* Automated readability metrics computation

**Output Metrics:**

* Structure: Sentence count, character count, letter count, word count
* Complexity: Syllable count, number of polysyllabic/monosyllabic/difficult words
* Readability: Flesch Reading Ease score, Automated Readability Index, overall reading difficulty

**Usage Example:**

```python
langkit_scorer = LangkitScorer()
langkit_scorer.run(
    storage=self.storage.step(),
    input_key="text"
)
```

---

#### 3. NgramScorer

**Function Description:**
This operator calculates the repetition ratio of n-grams within a text, measuring how repetitive it is. Higher scores indicate lower n-gram repetition.

**Input Parameters:**

* `__init__()`

  * `n`: Length of the n-gram (default: 3)
* `run()`

  * `storage`: Storage interface object
  * `input_key`: Field name of the input text
  * `output_key`: Field name for the output score (default: `"NgramScore"`)

**Key Features:**

* Repetition analysis based on n-grams
* Configurable n-gram length
* Quantifies textual diversity
* High computational efficiency

**Usage Example:**

```python
ngram_scorer = NgramScorer(n=3)
ngram_scorer.run(
    storage=self.storage.step(),
    input_key="text",
    output_key="NgramScore"
)
```

## Generated text evaluation

Dataflow integrates three methods for evaluating the quality of generated text, used to evaluate the similarity between generated text and reference text.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Scorer Name</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Value Range</th>
      <th class="tg-0pky">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">BLEU Scorer</td>
      <td class="tg-0pky">Calculates precision based on n-gram matching by comparing n-grams in generated and reference texts</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">Higher values indicate greater match between generated and reference texts</td>
    </tr>
    <tr>
      <td class="tg-0pky">CIDEr Scorer</td>
      <td class="tg-0pky">Uses TF-IDF weighted n-gram statistics to compare similarity between generated and reference descriptions</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">Higher values indicate stronger content consistency between generated and reference texts</td>
    </tr>
    <tr>
      <td class="tg-0pky">BertScore</td>
      <td class="tg-0pky">Computes similarity of word embeddings between generated and reference texts using BERT</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">Higher values indicate stronger semantic similarity between generated and reference texts</td>
    </tr>
  </tbody>
</table>
