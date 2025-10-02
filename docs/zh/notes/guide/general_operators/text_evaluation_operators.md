---
title: 通用文本数据评估算子
createTime: 2025/06/09 11:43:42
permalink: /zh/guide/text_evaluation_operators/
---



# 文本数据评估指标
## 文本质量评估
打分器分为以下四种类型，每种打分器会给出一个或多个分数。

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">类型</th>
      <th class="tg-0pky">数量</th>
      <th class="tg-0pky">描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">APIcaller</td>
      <td class="tg-0pky">3</td>
      <td class="tg-0pky">调用API打分</td>
    </tr>
    <tr>
      <td class="tg-0pky">Diversity</td>
      <td class="tg-0pky">2</td>
      <td class="tg-0pky">计算整个数据集的多样性得分</td>
    </tr>
    <tr>
      <td class="tg-0pky">Models</td>
      <td class="tg-0pky">12</td>
      <td class="tg-0pky">基于模型、分类器打分</td>
    </tr>
    <tr>
      <td class="tg-0pky">Statistics</td>
      <td class="tg-0pky">3</td>
      <td class="tg-0pky">统计学指标打分</td>
    </tr>
  </tbody>
</table>

关于数据类型：【文本】表示接受单一字段字符串输入，可适用于预训练或微调数据。【指令】表示仅适用于微调数据多字段格式输入。

开源的算子种类是十分受限的，为了获得更好的数据质量，填补开源缺失的数据评估方法，我们精心设计并**自研**了新的算子集，其标记含义如下：

- 🚀 **自主创新**：核心算法原创研发，填补现有算法空白或是进一步提升性能，突破当下性能瓶颈。
- ✨ **开源首发**：首次将该算子集成到社区主流框架中，方便更多开发者使用，实现开源共享。


### 打分器列表

#### APIcaller
<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">评估维度</th>
      <th class="tg-0pky">数据类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">取值范围</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">AlpagasusScorer✨</td>
      <td class="tg-0pky">内容准确性与有效性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">通过调用 GPT 评估指令的质量，返回一个质量得分，得分越高表明指令的质量越高。</td>
      <td class="tg-0pky">[0, 5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2307.08701">paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PerspectiveScorer✨</td>
      <td class="tg-0pky">安全性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">使用 PerspectiveAPI 评估文本的毒性，返回毒性概率，得分越高表明文本毒性越高。</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky"><a href="https://perspectiveapi.com/">API</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">TreeinstructScore✨</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">通过生成语法树的节点数来衡量指令复杂性，节点越多表示指令越复杂。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2308.05696">paper</a></td>
    </tr>
  </tbody>
</table>

#### Diversity
<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">评估维度</th>
      <th class="tg-0pky">数据类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">取值范围</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">Task2VecScorer✨</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">评估数据集的多样性，使用 Task2Vec 方法，高分表示数据集具有较高的多样性。</td>
      <td class="tg-0pky">[0.0525±3.41E-4, 0.4037±1.932E-5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2306.13840">paper</a><br><a href="https://github.com/alycialee/beyond-scale-language-data-diversity">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">VendiScorer</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">通过计算 VendiScore 来评估数据集的多样性，得分越高表示多样性越高。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2210.02410">paper</a><br><a href="https://github.com/vertaix/Vendi-Score">code</a></td>
    </tr>
  </tbody>
</table>

#### Models
<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">评估维度</th>
      <th class="tg-0pky">数据类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">取值范围</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">DebertaV3Scorer✨</td>
      <td class="tg-0pky">内容准确性与有效性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">基于 Nvidia Deberta V3 模型的质量分类器，用于评估文本质量。</td>
      <td class="tg-0pky">{Low, Medium, High}</td>
      <td class="tg-0pky"><a href="https://huggingface.co/nvidia/quality-classifier-deberta">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">FineWebEduScorer✨</td>
      <td class="tg-0pky">教育价值</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">用于评估文本教育价值的分类器，高分表示文本具有较高的教育价值。</td>
      <td class="tg-0pky">[0, 5]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2406.17557">paper</a><br><a href="https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">InstagScorer✨</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">通过返回标签的数量来评估指令的内容多样性，标签越多表示内容多样性越大。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2308.07074">paper</a><br><a href="https://huggingface.co/OFA-Sys/InsTagger">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PerplexityScorer</td>
      <td class="tg-0pky">流畅性与可理解性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">基于 Kenlm 模型计算文本的困惑度，困惑度越低，文本的流畅性和可理解性越高。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://aclanthology.org/W11-2123.pdf">paper</a><br><a href="https://huggingface.co/edugp/kenlm/tree/main">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">QuratingScorer✨</td>
      <td class="tg-0pky">内容准确性与有效性、教育价值</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">通过 Qurating 模型评估文本的质量，得分越高表示质量越高。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2402.09739">paper</a><br><a href="https://github.com/princeton-nlp/QuRating">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PairQualScorer🚀</td>
      <td class="tg-0pky">教育价值</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">通过 PairQual 模型评估文本的质量，基于bge模型，支持中英双语，使用gpt对文本成对比较打分后训练而成。得分越高表示质量越高。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><br><a href="https://huggingface.co/zks2856/PairQual-Scorer-zh">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PresidioScorer✨</td>
      <td class="tg-0pky">安全性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">使用Microsoft Presidio模型，识别文本中的私人实体（PII）如信用卡号、姓名、位置等。打分器返回PII信息个数。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://github.com/microsoft/presidio">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SuperfilteringScorer✨</td>
      <td class="tg-0pky">流畅性与可理解性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">使用 Superfiltering 方法评估指令的跟随难度，得分越高表示指令越难跟随。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2402.00530">paper</a><br><a href="https://github.com/tianyi-lab/Superfiltering">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">TextbookScorer✨</td>
      <td class="tg-0pky">教育价值</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">基于 FastText 分类器的课本质量分类器，用于评估文本的教育价值。</td>
      <td class="tg-0pky">[0, 2]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2306.11644">paper</a><br><a href="https://huggingface.co/kenhktsui/llm-data-textbook-quality-fasttext-classifier-v2">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">DeitaQualityScorer✨</td>
      <td class="tg-0pky">内容准确性与有效性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">基于 Llama 模型的 Deita 指令质量评估器，高分表示指令质量较高。</td>
      <td class="tg-0pky">[1,6]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2312.15685">paper</a><br><a href="https://huggingface.co/hkust-nlp/deita-quality-scorer">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">DeitaComplexityScorer✨</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">基于 Llama 模型的 Deita 指令复杂性评估器，高分表示指令复杂性较高。</td>
      <td class="tg-0pky">[1,6]</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2312.15685">paper</a><br><a href="https://huggingface.co/hkust-nlp/deita-complexity-scorer">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">RMScorer✨</td>
      <td class="tg-0pky">流畅性与可理解性</td>
      <td class="tg-0pky">指令</td>
      <td class="tg-0pky">基于人类价值判断的奖励模型reward-model-deberta-v3-large-v2质量评分器。高分代表质量较高。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://huggingface.co/OpenAssistant/reward-model-deberta-v3-large-v2">code</a></td>
    </tr>
  </tbody>
</table>

#### Statistics
<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">评估维度</th>
      <th class="tg-0pky">数据类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">取值范围</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">LangkitScorer</td>
      <td class="tg-0pky">文本结构, 流畅性与可理解性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">使用Langkit工具包计算文本的统计信息，如字数、句子数、音节数等，帮助评估文本的结构复杂性和可读性。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://github.com/whylabs/langkit">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">LexicalDiversityScorer✨</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">使用MTLD和HDD方法计算词汇多样性评分，高分代表更丰富的词汇使用，反映文本的多样性和复杂性。</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky"><a href="https://link.springer.com/article/10.3758/BRM.42.2.381">paper</a><br><a href="https://github.com/jennafrens/lexical_diversity/tree/master">code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">NgramScorer</td>
      <td class="tg-0pky">多样性与复杂性</td>
      <td class="tg-0pky">文本</td>
      <td class="tg-0pky">计算文本中n-gram的重复比例，用以衡量文本的重复度，得分越高表示文本中重复的n-gram比例越低。</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

### 质量评估体系

为提供更精准的数据质量评估，我们根据现有的分类器构架了一套质量评估体系。具体到每个打分器的输出分数指标，包括以下6个维度。

#### 1. 文本结构 (Text Structure)
- **LangkitScorer**: LangkitSentenceCountScore, LangkitCharacterCountScore, LangkitLetterCountScore, LangkitSyllableCountScore, LangkitPolysyllableCountScore, LangkitMonosyllableCountScore, LangkitLexiconCountScore, LangkitDifficultWordsScore

#### 2. 多样性与复杂性 (Diversity & Complexity)
- **LexicalDiversityScorer**: LexicalDiversityMTLDScore, LexicalDiversityHD-DScore
- **NgramScorer**: NgramScore
- **InstagScorer**: InstagScore
- **TreeinstructScorer**: TreeinstructScore
- **Task2VecScorer**: Task2VecDiversityScore (ConfidenceInterval)
- **VendiScorer**: N-gramsVendiScore, BERTVendiScore, SimCSEVendiScore
- **DeitaComplexityScorer:** DeitaComplexityScore


#### 3. 流畅性与可理解性 (Fluency & Understandability)
- **LangkitScorer**: LangkitFleschReadingEaseScore, LangkitAutomatedReadabilityIndexScore, LangkitAggregateReadingLevelScore
- **PerplexityScorer**: PerplexityScore
- **QuratingScorer**: QuratingWritingStyleScore
- **SuperfilteringScorer**: SuperfilteringScore
- **RMScorer**: RMScore

#### 4. 安全性 (Safety)
- **PerspectiveScorer**: PerspectiveScore
- **PresidioScorer**: PresidioScore

#### 5. 教育价值 (Educational Value)
- **TextbookScorer**: TextbookScore
- **FineWebEduScorer**: FineWebEduScore
- **QuratingScorer**: QuratingEducationalValueScore
- **PairQualScorer**: PairQualScore

#### 6. 内容准确性与有效性 (Content Accuracy & Effectiveness)
- **QuratingScorer**: QuratingRequiredExpertiseScore, QuratingFactsAndTriviaScore
- **DebertaV3Scorer**: DebertaV3Score
- **AlpagasusScorer**: AlpagasusScore
- **DeitaQualityScorer**: DeitaQualityScore

### 基准值

为更好的提供数据质量参考，我们根据数据类型从目前认为较高质量的[Fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)和[alpaca-cleaned](https://huggingface.co/datasets/yahma/alpaca-cleaned)数据集中分别随机选取了5k条数据，并测试了部分打分器的基准值。

<table class="tg"><thead>
  <tr>
    <th class="tg-0pky">打分器名称</th>
    <th class="tg-0pky">分数指标名称</th>
    <th class="tg-0pky">简介</th>
    <th class="tg-0pky">均值</th>
    <th class="tg-0pky">方差</th>
    <th class="tg-0pky">最大值</th>
    <th class="tg-0pky">最小值</th>
  </tr></thead>
<tbody>
  <tr>
    <td class="tg-0pky" rowspan="1">PerspectiveScorer</td>
    <td class="tg-0pky">PerspectiveScore</td>
    <td class="tg-0pky">评估文本的毒性，是否含有潜在的侮辱性或不当言论。<b>分数越高毒性越大。</b></td>
    <td class="tg-0pky">0.0426</td>
    <td class="tg-0pky">0.0025</td>
    <td class="tg-0pky">0.2610</td>
    <td class="tg-0pky">0.0026</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="2">LexicalDiversityScorer</td>
    <td class="tg-0pky">LexicalDiversityMTLDScore</td>
    <td class="tg-0pky">测量文本的词汇多样性。<b>分数越高词汇多样性越大。</b></td>
    <td class="tg-0pky">100.5990</td>
    <td class="tg-0pky">1625.1318</td>
    <td class="tg-0pky">1165.7164</td>
    <td class="tg-0pky">14.8439</td>
  </tr>
  <tr>
    <td class="tg-0pky">LexicalDiversityHD-DScore</td>
    <td class="tg-0pky">用于衡量文本的词汇多样性，基于离散分布计算。<b>分数越高词汇多样性越大。</b></td>
    <td class="tg-0pky">0.8487</td>
    <td class="tg-0pky">0.0014</td>
    <td class="tg-0pky">0.9873</td>
    <td class="tg-0pky">0.5570</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">NgramScorer</td>
    <td class="tg-0pky">NgramScore</td>
    <td class="tg-0pky">计算文本中n-gram的重复比例，用以衡量文本的重复度。<b>分数越高N-gram重复性越低。</b></td>
    <td class="tg-0pky">0.9938</td>
    <td class="tg-0pky">0.0002</td>
    <td class="tg-0pky">1.0</td>
    <td class="tg-0pky">0.8285</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="11">LangkitScorer</td>
    <td class="tg-0pky">LangkitFleschReadingEaseScore</td>
    <td class="tg-0pky">衡量文本的Flesch可读性。<b>得分越高表示越易读。</b></td>
    <td class="tg-0pky">55.1870</td>
    <td class="tg-0pky">324.8975</td>
    <td class="tg-0pky">106.37</td>
    <td class="tg-0pky">-144.75</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitAutomatedReadabilityIndexScore</td>
    <td class="tg-0pky">自动可读性指标，基于句子长度和词汇难度。<b>得分越高表示越难读。</b></td>
    <td class="tg-0pky">11.7727</td>
    <td class="tg-0pky">19.4117</td>
    <td class="tg-0pky">98.2</td>
    <td class="tg-0pky">0.9</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitAggregateReadingLevelScore</td>
    <td class="tg-0pky">综合文本的阅读难度评分。<b>得分越高表示越难读。</b></td>
    <td class="tg-0pky">11.2332</td>
    <td class="tg-0pky">13.6816</td>
    <td class="tg-0pky">77.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitSyllableCountScore</td>
    <td class="tg-0pky">统计文本中音节的总数。<b>得分越高音节数量越大。</b></td>
    <td class="tg-0pky">815.3852</td>
    <td class="tg-0pky">2299853.7272</td>
    <td class="tg-0pky">43237</td>
    <td class="tg-0pky">32</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitLexiconCountScore</td>
    <td class="tg-0pky">统计文本中词汇的总数。<b>得分越高词汇数量越大。</b></td>
    <td class="tg-0pky">524.178</td>
    <td class="tg-0pky">1061058.5875</td>
    <td class="tg-0pky">33033</td>
    <td class="tg-0pky">23</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitSentenceCountScore</td>
    <td class="tg-0pky">统计文本中的句子数量。<b>得分越高句子数量越大。</b></td>
    <td class="tg-0pky">28.9664</td>
    <td class="tg-0pky">3618.2549</td>
    <td class="tg-0pky">2193</td>
    <td class="tg-0pky">1</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitCharacterCountScore</td>
    <td class="tg-0pky">统计文本中的字符数量。<b>得分越高字符数量越大。</b></td>
    <td class="tg-0pky">2610.2462</td>
    <td class="tg-0pky">23580442.8820</td>
    <td class="tg-0pky">139807</td>
    <td class="tg-0pky">118</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitLetterCountScore</td>
    <td class="tg-0pky">统计文本中的字母数量。<b>得分越高字母数量越大。</b></td>
    <td class="tg-0pky">2513.4572</td>
    <td class="tg-0pky">21890120.2030</td>
    <td class="tg-0pky">134507</td>
    <td class="tg-0pky">109</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitPolysyllableCountScore</td>
    <td class="tg-0pky">统计多音节单词的数量。<b>得分越高多音节词数量越大。</b></td>
    <td class="tg-0pky">78.8834</td>
    <td class="tg-0pky">18918.1990</td>
    <td class="tg-0pky">3261</td>
    <td class="tg-0pky">0</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitMonosyllableCountScore</td>
    <td class="tg-0pky">统计单音节单词的数量，通常与文本的简易度相关。<b>得分越高单音节词数量越大。</b></td>
    <td class="tg-0pky">334.6674</td>
    <td class="tg-0pky">503285.5160</td>
    <td class="tg-0pky">25133</td>
    <td class="tg-0pky">13</td>
  </tr>
  <tr>
    <td class="tg-0pky">LangkitDifficultWordsScore</td>
    <td class="tg-0pky">统计文本中难词的数量。<b>得分越高难词数量越大。</b></td>
    <td class="tg-0pky">93.4112</td>
    <td class="tg-0pky">14401.2789</td>
    <td class="tg-0pky">2366</td>
    <td class="tg-0pky">4</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">TextbookScorer</td>
    <td class="tg-0pky">TextbookScore</td>
    <td class="tg-0pky">测试文本是否符合教科书标准。<b>得分越高文本越接近理想教材。</b></td>
    <td class="tg-0pky">0.9255</td>
    <td class="tg-0pky">0.1779</td>
    <td class="tg-0pky">1.9867</td>
    <td class="tg-0pky">0.0001</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">FineWebEduScorer</td>
    <td class="tg-0pky">FineWebEduScore</td>
    <td class="tg-0pky">测量文本的教育价值。<b>得分越高文本教育价值越大。</b></td>
    <td class="tg-0pky">1.1901</td>
    <td class="tg-0pky">0.4924</td>
    <td class="tg-0pky">4.6827</td>
    <td class="tg-0pky">-0.6319</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">DebertaV3Scorer</td>
    <td class="tg-0pky">DebertaV3Score</td>
    <td class="tg-0pky">使用DebertaV3模型进行的文本评估。<b>评估质量得分按高、中、低分类。</b></td>
    <td class="tg-0pky">Medium: 3180 次</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">High: 1412 次</td>
    <td class="tg-0pky">Low: 408 次</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">PerplexityScorer</td>
    <td class="tg-0pky">PerplexityScore</td>
    <td class="tg-0pky">衡量文本的困惑度。<b>得分越高模型困惑度越大。</b></td>
    <td class="tg-0pky">564.3942</td>
    <td class="tg-0pky">165893.5542</td>
    <td class="tg-0pky">8271.0</td>
    <td class="tg-0pky">13.9</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="4">QuratingScorer</td>
    <td class="tg-0pky">QuratingWritingStyleScore</td>
    <td class="tg-0pky">评估文本的写作风格是否良好。<b>得分越高文本写作风格越好。</b></td>
    <td class="tg-0pky">0.6453</td>
    <td class="tg-0pky">6.7949</td>
    <td class="tg-0pky">8.375</td>
    <td class="tg-0pky">-7.3474</td>
  </tr>
  <tr>
    <td class="tg-0pky">QuratingRequiredExpertiseScore</td>
    <td class="tg-0pky">衡量文本需要的专业知识水平。<b>得分越高文本越需要专业知识。</b></td>
    <td class="tg-0pky">-0.4661</td>
    <td class="tg-0pky">7.0458</td>
    <td class="tg-0pky">9.0</td>
    <td class="tg-0pky">-8.25</td>
  </tr>
  <tr>
    <td class="tg-0pky">QuratingFactsAndTriviaScore</td>
    <td class="tg-0pky">测试文本是否包含事实和趣闻。<b>得分越高文本包含的事实和趣闻越多。</b></td>
    <td class="tg-0pky">0.1889</td>
    <td class="tg-0pky">4.5678</td>
    <td class="tg-0pky">7.4688</td>
    <td class="tg-0pky">-6.0993</td>
  </tr>
  <tr>
    <td class="tg-0pky">QuratingEducationalValueScore</td>
    <td class="tg-0pky">衡量文本的教育价值。<b>得分越高文本教育价值越大。</b></td>
    <td class="tg-0pky">1.2946</td>
    <td class="tg-0pky">11.2196</td>
    <td class="tg-0pky">11.5625</td>
    <td class="tg-0pky">-8.7843</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">InstagScorer</td>
    <td class="tg-0pky">InstagScore</td>
    <td class="tg-0pky">通过返回标签的数量来评估指令的内容多样性。<b>得分越高内容多样性越大。</b></td>
    <td class="tg-0pky">2.304</td>
    <td class="tg-0pky">2.9396</td>
    <td class="tg-0pky">11</td>
    <td class="tg-0pky">1</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">SuperfilteringScorer</td>
    <td class="tg-0pky">SuperfilteringScore</td>
    <td class="tg-0pky">使用 Superfiltering 方法评估指令的跟随难度。<b>得分越高指令跟随难度越大。</b></td>
    <td class="tg-0pky">1.3223</td>
    <td class="tg-0pky">836.0302</td>
    <td class="tg-0pky">1978.6534</td>
    <td class="tg-0pky">0.0011</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">DeitaQualityScorer</td>
    <td class="tg-0pky">DeitaQualityScore</td>
    <td class="tg-0pky">基于 Llama 模型的 Deita 指令质量评估器。<b>得分越高指令质量越好。</b></td>
    <td class="tg-0pky">3.5629</td>
    <td class="tg-0pky">0.9247</td>
    <td class="tg-0pky">5.5309</td>
    <td class="tg-0pky">1.0840</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">DeitaComplexityScorer</td>
    <td class="tg-0pky">DeitaComplexityScore</td>
    <td class="tg-0pky">基于 Llama 模型的 Deita 指令复杂性评估器。<b>得分越高指令复杂性越大。</b></td>
    <td class="tg-0pky">1.4936</td>
    <td class="tg-0pky">0.2086</td>
    <td class="tg-0pky">3.3207</td>
    <td class="tg-0pky">1.0001</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="3">VendiScorer</td>
    <td class="tg-0pky">N-grams_VendiScore</td>
    <td class="tg-0pky">基于N-grams嵌入评估文本多样性得分。<b>得分越高数据集多样性越大。</b></td>
    <td class="tg-0pky">1832.96</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
  </tr>
  <tr>
    <td class="tg-0pky">BERT_VendiScore</td>
    <td class="tg-0pky">基于BERT嵌入评估文本多样性得分。<b>得分越高数据集多样性越大。</b></td>
    <td class="tg-0pky">1.83</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
  </tr>
  <tr>
    <td class="tg-0pky">SimCSE_VendiScore</td>
    <td class="tg-0pky">基于SimCSE嵌入计算文本多样性得分。<b>得分越高数据集多样性越大。</b></td>
    <td class="tg-0pky">68.94</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">Task2VecScorer</td>
    <td class="tg-0pky">Task2VecScore</td>
    <td class="tg-0pky">使用Task2Vec多样性系数评估数据集多样性。<b>得分越高数据集多样性越大。</b></td>
    <td class="tg-0pky">0.0673</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
    <td class="tg-0pky">-</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">AlpagasusScorer</td>
    <td class="tg-0pky">AlpagasusScore</td>
    <td class="tg-0pky">调用ChatGPT评估指令质量得分。<b>得分越高指令质量越好。</b></td>
    <td class="tg-0pky">4.172</td>
    <td class="tg-0pky">0.2164</td>
    <td class="tg-0pky">5.0</td>
    <td class="tg-0pky">2.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">TreeinstructScorer</td>
    <td class="tg-0pky">TreeinstructScore</td>
    <td class="tg-0pky">调用ChatGPT评估指令语义复杂度。<b>得分越高指令语义复杂度越高。</b></td>
    <td class="tg-0pky">6.494</td>
    <td class="tg-0pky">9.7540</td>
    <td class="tg-0pky">63.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">PresidioScorer</td>
    <td class="tg-0pky">PresidioScore</td>
    <td class="tg-0pky">使用Presidio评估PII个数。<b>得分越高文本含义PII信息越多。</b></td>
    <td class="tg-0pky">21.4008</td>
    <td class="tg-0pky">2915.3542</td>
    <td class="tg-0pky">1786.0</td>
    <td class="tg-0pky">0.0</td>
  </tr>
  <tr>
    <td class="tg-0pky" rowspan="1">RMScorer</td>
    <td class="tg-0pky">RMScore</td>
    <td class="tg-0pky">使用基于人类价值的奖励模型评估SFT数据质量<b>得分越高数据质量越高。</b></td>
    <td class="tg-0pky">3.1537</td>
    <td class="tg-0pky">9.9461</td>
    <td class="tg-0pky">8.6803</td>
    <td class="tg-0pky">-4.9680</td>
  </tr>
</tbody>
</table>

## 算子接口调用说明

特别地，对于指定存储路径等或是调用模型的算子，我们提供了封装后的**模型接口**以及**存储对象接口**，可以通过以下方式为算子进行模型API参数预定义：

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

可以通过以下方式为算子进行存储参数预定义：

```python
from dataflow.utils.storage import FileStorage

 self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

后文使用的`api_llm_serving`以及`self.storage`即为此处已定义的接口对象，完整调用示例可参考`test/test_text_evaluation.py`。

对于传参，算子对象的构造函数主要传递与算子配置相关的信息，配置后可以一配置多调用；而`X.run()`函数传递与IO相关的`key`信息，详细可见后文算子说明示例。


## 详细算子说明

### APIcaller算子

#### 1. AlpagasusScorer✨

**功能描述：** 该算子通过调用GPT评估指令的质量，返回一个质量得分，得分越高表明指令的质量越高。基于Alpagasus方法，专门用于评估指令数据的质量和有效性。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（必需，需实现LLMServingABC接口）
  - `dimension`：评估维度（默认："quality"）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令字段名
  - `input_input_key`：输入文本字段名
  - `input_output_key`：输出文本字段名
  - `output_key`：输出得分字段名（默认："AlpagasusScore"）

**主要特性：**

- 基于GPT的智能质量评估
- 支持自定义评估维度
- 自动解析评分结果
- 适用于指令微调数据质量评估

**使用示例：**

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

**功能描述：** 该算子使用PerspectiveAPI评估文本的毒性，返回毒性概率，得分越高表明文本毒性越高。专门用于检测文本中的有害内容和不当言论。

**输入参数：**

- `__init__()`
  - `serving`：Perspective API服务对象
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："PerspectiveScore"）

**主要特性：**

- 基于Google Perspective API的毒性检测
- 自动处理文本长度限制（最大20KB）
- 支持批量处理
- 返回0-1范围的毒性概率

**使用示例：**

```python
perspective_scorer = PerspectiveScorer(serving=perspective_api_serving)
perspective_scorer.run(
          storage=self.storage.step(),
          input_key="text",
          output_key="PerspectiveScore"
          )
```

#### 3. TreeinstructScore✨

**功能描述：** 该算子通过生成语法树的节点数来衡量指令复杂性，节点越多表示指令越复杂。基于语法分析的方法评估指令的结构复杂度。

**输入参数：**

- `__init__()`
  - 无需特殊参数
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令字段名
  - `output_key`：输出得分字段名（默认："TreeinstructScore"）

**主要特性：**

- 基于语法树分析的复杂度评估
- 自动解析指令语法结构
- 量化指令复杂性
- 适用于指令多样性分析

**使用示例：**

```python
treeinstruct_scorer = TreeinstructScore()
treeinstruct_scorer.run(
          storage=self.storage.step(),
          input_instruction_key="instruction",
          output_key="TreeinstructScore"
          )
```


### Diversity算子

#### 1. Task2VecScorer✨

**功能描述：** 该算子评估数据集的多样性，使用Task2Vec方法，高分表示数据集具有较高的多样性。基于任务嵌入的方法来计算数据集间的相似性和多样性。

**输入参数：**

- `__init__()`
  - 无需特殊参数
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名

**主要特性：**

- 基于Task2Vec方法的多样性评估
- 计算置信区间
- 适用于任务级别的多样性分析
- 开源首发算法

**使用示例：**

```python
task2vec_scorer = Task2VecScorer()
result = task2vec_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```

#### 2. VendiScorer

**功能描述：** 该算子通过计算VendiScore来评估数据集的多样性，使用BERT和SimCSE模型生成嵌入并计算分数。VendiScore是一种基于核矩阵特征值的多样性度量方法，能够有效评估数据集的丰富性和覆盖范围。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名

**主要特性：**

- 多模型评估：同时使用BERT、SimCSE和N-gram方法
- 基于嵌入的多样性计算
- 适用于整个数据集的多样性评估
- 支持GPU加速计算

**输出格式：**

- `N-gramsVendiScore`：基于N-gram的多样性得分
- `BERTVendiScore`：基于BERT的多样性得分
- `SimCSEVendiScore`：基于SimCSE的多样性得分

**使用示例：**

```python
vendi_scorer = VendiScorer(device="cuda")
result = vendi_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```


### Models算子


#### 1. DebertaV3Scorer✨

**功能描述：** 基于Nvidia Deberta V3模型的质量分类器，用于评估文本质量。该算子将文本分类为高（High）、中（Medium）、低（Low）三个质量等级，适用于大规模文本质量筛选。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：32）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："DebertaV3Score"）

**主要特性：**

- 基于DeBERTa-v3-large模型的高精度文本质量分类
- 三级质量分类：High、Medium、Low
- 支持批量处理，提高处理效率
- GPU加速计算
- 适用于多种文本类型的质量评估

**评估维度：** 内容准确性与有效性

**数据类型：** 文本

**取值范围：** \{Low, Medium, High\}

**使用示例：**

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

**功能描述：** 用于评估文本教育价值的分类器，基于FineWeb-Edu数据集训练。该算子能够识别具有教育意义的文本内容，为教育资源筛选和课程内容开发提供支持。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：32）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："FineWebEduScore"）

**主要特性：**

- 专门针对教育价值评估设计
- 基于大规模教育文本数据训练
- 0-5分的细粒度评分
- 支持多语言文本评估
- 高效的批量处理能力

**评估维度：** 教育价值

**数据类型：** 文本

**取值范围：** [0, 5]

**使用示例：**

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

**功能描述：** 通过返回标签的数量来评估指令的内容多样性，标签越多表示内容多样性越大。该算子基于InsTagger模型，能够自动识别指令中涉及的不同主题和任务类型。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：16）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令字段名（默认："instruction"）
  - `output_key`：输出得分字段名（默认："InstagScore"）

**主要特性：**

- 基于InsTagger模型的多标签分类
- 自动识别指令涉及的任务类型和主题
- 量化指令内容的多样性
- 支持复杂指令的细粒度分析
- 适用于指令数据集的多样性评估

**评估维度：** 多样性与复杂性

**数据类型：** 指令

**取值范围：** 正整数（标签数量）

**使用示例：**

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

**功能描述：** 基于Kenlm模型计算文本的困惑度，困惑度越低，文本的流畅性和可理解性越高。该算子使用统计语言模型评估文本的自然度和语言质量。

**输入参数：**

- `__init__()`
  - `model_path`：Kenlm模型路径（默认：预设模型路径）
  - `language`：语言类型（默认："en"）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："PerplexityScore"）

**主要特性：**

- 基于n-gram统计语言模型
- 快速计算文本困惑度
- 支持多种语言
- 内存占用小，计算效率高
- 适用于大规模文本流畅性评估

**评估维度：** 流畅性与可理解性

**数据类型：** 文本

**取值范围：** 正数（困惑度值，越小越好）

**使用示例：**

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

**功能描述：** 通过Qurating模型评估文本的质量，得分越高表示质量越高。该算子基于多维度评估框架，能够从写作风格、教育价值、专业知识要求等多个角度评估文本质量。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：16）
  - `max_length`：最大序列长度（默认：512）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："QuratingScore"）

**主要特性：**

- 多维度文本质量评估
- 基于大规模高质量文本训练
- 支持长文本处理
- 提供细粒度的质量评分
- 适用于学术和专业文本评估

**评估维度：** 内容准确性与有效性、教育价值

**数据类型：** 文本

**取值范围：** 连续数值（越高越好）

**输出指标：**
- `QuratingWritingStyleScore`：写作风格评分
- `QuratingEducationalValueScore`：教育价值评分
- `QuratingRequiredExpertiseScore`：专业知识要求评分
- `QuratingFactsAndTriviaScore`：事实和知识评分

**使用示例：**

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

**功能描述：** 通过PairQual模型评估文本的质量，基于bge模型，支持中英双语，使用GPT对文本成对比较打分后训练而成。这是一个自主创新的算子，专门针对中英文文本质量评估进行了优化。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：32）
  - `language`：语言类型（默认："auto"，自动检测）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："PairQualScore"）

**主要特性：**

- 基于BGE模型的双语质量评估
- 使用GPT成对比较数据训练
- 支持中英文双语评估
- 自主创新算法
- 高精度的质量判断能力

**评估维度：** 教育价值

**数据类型：** 文本

**取值范围：** 连续数值（越高越好）

**使用示例：**

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

**功能描述：** 使用Microsoft Presidio模型，识别文本中的私人实体（PII）如信用卡号、姓名、位置等。打分器返回PII信息个数，用于评估文本的隐私安全性。

**输入参数：**

- `__init__()`
  - `language`：语言类型（默认："en"）
  - `entities`：要检测的实体类型列表（默认：["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "LOCATION"]）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："PresidioScore"）

**主要特性：**

- 基于Microsoft Presidio的PII检测
- 支持多种个人信息类型识别
- 可自定义检测的实体类型
- 支持多语言文本处理
- 高精度的隐私信息识别

**评估维度：** 安全性

**数据类型：** 文本

**取值范围：** 非负整数（PII实体数量）

**检测的PII类型：**
- PERSON：人名
- EMAIL_ADDRESS：邮箱地址
- PHONE_NUMBER：电话号码
- CREDIT_CARD：信用卡号
- LOCATION：地理位置
- 其他可配置类型

**使用示例：**

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

**功能描述：** 使用Superfiltering方法评估指令的跟随难度，得分越高表示指令越难跟随。该算子基于指令复杂性分析，帮助识别需要高级推理能力的指令。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：16）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令字段名（默认："instruction"）
  - `input_output_key`：输出字段名（默认："output"）
  - `output_key`：输出得分字段名（默认："SuperfilteringScore"）

**主要特性：**

- 基于Superfiltering方法的难度评估
- 评估指令的跟随复杂度
- 识别需要高级推理的指令
- 支持指令-响应对分析
- 适用于指令数据质量筛选

**评估维度：** 流畅性与可理解性

**数据类型：** 指令

**取值范围：** 连续数值（越高表示越难跟随）

**使用示例：**

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

**功能描述：** 基于FastText分类器的课本质量分类器，用于评估文本的教育价值。该算子专门针对教育内容设计，能够识别具有课本质量的文本。

**输入参数：**

- `__init__()`
  - `model_path`：FastText模型路径（默认：预设模型路径）
  - `threshold`：分类阈值（默认：0.5）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："TextbookScore"）

**主要特性：**

- 基于FastText的高效文本分类
- 专门针对教育内容优化
- 快速的推理速度
- 低内存占用
- 适用于大规模教育文本筛选

**评估维度：** 教育价值

**数据类型：** 文本

**取值范围：** [0, 2]

**分类标准：**
- 0：非教育内容
- 1：一般教育内容
- 2：高质量教育内容

**使用示例：**

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

**功能描述：** 基于Llama模型的Deita指令质量评估器，高分表示指令质量较高。该算子通过生成1-6分的质量评分来评估指令质量，特别适用于指令微调数据的质量筛选。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `max_length`：最大序列长度（默认：512）
  - `batch_size`：批处理大小（默认：8）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令文本字段名（默认："instruction"）
  - `input_output_key`：输出文本字段名（默认："output"）
  - `output_key`：输出得分字段名（默认："DeitaQualityScore"）

**主要特性：**

- 基于Llama模型的专业质量评估
- 1-6分的细粒度评分
- 使用softmax概率分布计算最终得分
- 支持批量处理和GPU加速
- 专门针对指令-响应对优化

**评估维度：** 内容准确性与有效性

**数据类型：** 指令

**取值范围：** [1, 6]

**评分标准：**
- 1分：质量很差，指令不清晰或响应不相关
- 2分：质量较差，存在明显问题
- 3分：质量一般，基本可用但有改进空间
- 4分：质量良好，指令清晰且响应合适
- 5分：质量很好，高质量的指令-响应对
- 6分：质量优秀，完美的指令-响应对

**使用示例：**

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

**功能描述：** 基于Llama模型的Deita指令复杂性评估器，高分表示指令复杂性较高。该算子评估指令的认知复杂度和执行难度，帮助识别具有挑战性的指令。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `max_length`：最大序列长度（默认：512）
  - `batch_size`：批处理大小（默认：8）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令文本字段名（默认："instruction"）
  - `input_output_key`：输出文本字段名（默认："output"）
  - `output_key`：输出得分字段名（默认："DeitaComplexityScore"）

**主要特性：**

- 基于Llama模型的复杂性评估
- 1-6分的复杂度评分
- 评估指令的认知负荷
- 识别需要高级推理的指令
- 支持指令数据集的难度分层

**评估维度：** 多样性与复杂性

**数据类型：** 指令

**取值范围：** [1, 6]

**复杂度标准：**
- 1分：非常简单，基础操作
- 2分：简单，直接任务
- 3分：中等，需要一定思考
- 4分：复杂，需要多步推理
- 5分：很复杂，需要高级推理
- 6分：极其复杂，需要专业知识

**使用示例：**

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

**功能描述：** 基于人类价值判断的奖励模型reward-model-deberta-v3-large-v2质量评分器。高分代表质量较高。该算子使用经过人类反馈训练的奖励模型来评估文本质量。

**输入参数：**

- `__init__()`
  - `device`：计算设备（默认："cuda"）
  - `model_cache_dir`：模型缓存目录（默认："./dataflow_cache"）
  - `batch_size`：批处理大小（默认：16）
  - `max_length`：最大序列长度（默认：512）
- `run()`
  - `storage`：存储接口对象
  - `input_instruction_key`：指令字段名（默认："instruction"）
  - `input_output_key`：输出字段名（默认："output"）
  - `output_key`：输出得分字段名（默认："RMScore"）

**主要特性：**

- 基于人类反馈训练的奖励模型
- 反映人类价值判断和偏好
- 适用于对话和指令响应评估
- 高精度的质量判断
- 支持多轮对话评估

**评估维度：** 流畅性与可理解性

**数据类型：** 指令

**取值范围：** 连续数值（越高表示质量越好）

**评估标准：**
- 考虑响应的有用性
- 评估内容的安全性
- 判断回答的准确性
- 衡量表达的清晰度

**使用示例：**

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


### Statistics算子

#### 1. LexicalDiversityScorer✨

**功能描述：** 该算子使用MTLD（词汇多样性测量）和HDD（移动平均类型-标记比）方法计算文本词汇多样性，评估文本的词汇丰富度和表达多样性。

**输入参数：**

- `__init__()`
  - 无需特殊参数
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名

**主要特性：**

- **MTLD方法**：通过计算维持特定TTR阈值所需的单词数量来评估词汇多样性
- **HDD方法**：基于样本的词汇丰富度估计，使用超几何分布计算
- 自动处理标点符号和大小写
- 支持不同长度文本的适应性评估

**输入要求：**

- MTLD评估：文本长度需大于50个单词
- HDD评估：文本长度需在50-1000个单词之间

**输出格式：**

- `LexicalDiversityMTLDScore`：MTLD多样性得分（值越高表示多样性越好）
- `LexicalDiversityHD-DScore`：HDD多样性得分（值越高表示多样性越好）

**使用示例：**

```python
lexical_scorer = LexicalDiversityScorer()
lexical_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```

#### 2. LangkitScorer

**功能描述：** 该算子使用Langkit工具包计算文本的统计信息，如字数、句子数、音节数等，帮助评估文本的结构复杂性和可读性。

**输入参数：**

- `__init__()`
  - 无需特殊参数
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名

**主要特性：**

- 全面的文本统计分析
- 多维度可读性评估
- 包含Flesch可读性评分
- 自动化可读性指标计算

**输出指标：**

- 文本结构：句子数、字符数、字母数、词汇数
- 复杂性：音节数、多音节词数、单音节词数、难词数
- 可读性：Flesch可读性评分、自动可读性指标、综合阅读难度

**使用示例：**

```python
langkit_scorer = LangkitScorer()
langkit_scorer.run(
          storage=self.storage.step(),
          input_key="text"
          )
```

#### 3. NgramScorer

**功能描述：** 该算子计算文本中n-gram的重复比例，用以衡量文本的重复度，得分越高表示文本中重复的n-gram比例越低。

**输入参数：**

- `__init__()`
  - `n`：n-gram的长度（默认：3）
- `run()`
  - `storage`：存储接口对象
  - `input_key`：输入文本字段名
  - `output_key`：输出得分字段名（默认："NgramScore"）

**主要特性：**

- 基于n-gram的重复度分析
- 可配置n-gram长度
- 量化文本多样性
- 计算效率高

**使用示例：**

```python
ngram_scorer = NgramScorer(n=3)
ngram_scorer.run(
          storage=self.storage.step(),
          input_key="text",
          output_key="NgramScore"
          )
```

## 生成文本质量评估

Dataflow集成了三种生成文本质量评估方法，用于评估生成文本和参考文本之间的相似性。

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">打分器名称</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">取值范围</th>
      <th class="tg-0pky">值解释</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">BLEU Scorer</td>
      <td class="tg-0pky">基于 n-gram 匹配的精确度计算，将生成文本中的 n-gram 与参考文本中的 n-gram 进行匹配并计算精确度</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">值越大，表示生成文本与参考文本的匹配程度越高</td>
    </tr>
    <tr>
      <td class="tg-0pky">CIDEr Scorer</td>
      <td class="tg-0pky">利用 TF-IDF 加权的 n-gram 统计，将生成文本的描述与参考描述进行相似性比较</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">值越大，表示生成文本与参考文本在内容上越一致</td>
    </tr>
    <tr>
      <td class="tg-0pky">BertScorer</td>
      <td class="tg-0pky">使用 Bert 模型计算生成文本与参考文本的词向量相似性，输出精确度、召回率和 F1 分数</td>
      <td class="tg-0pky">[0, 1]</td>
      <td class="tg-0pky">值越大，表示生成文本与参考文本在语义上越相似</td>
    </tr>
  </tbody>
</table>
