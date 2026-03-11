---
title: "Attention Is All You Need 论文笔记"
date: 2026-03-12
paperTitle: "Attention Is All You Need"
authors: ["Vaswani et al."]
venue: "NeurIPS"
year: 2017
summary: "提出 Transformer 架构，完全基于 attention 机制，抛弃 RNN/CNN，在机器翻译任务上达到 SOTA，并成为此后几乎所有大语言模型的基础架构。"
tags: [transformer, attention, NLP]
lang: zh
cover: "/blog/covers/paper-abstract.svg"
coverAlt: "分层几何形状，象征注意力机制的多层堆叠与深度结构"
draft: false
---

## 论文信息

- **标题**：Attention Is All You Need
- **作者**：Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin
- **发表**：NeurIPS 2017
- **引用量**：~130,000+ （截至 2026）

## 核心问题

在 Transformer 出现之前，序列建模的主流方法是 RNN（LSTM/GRU）。RNN 的核心局限：

1. **顺序计算**：必须从左到右逐步处理，无法并行，训练慢
2. **长距离依赖**：信息需要经过很多步才能传播，梯度消失问题
3. **信息瓶颈**：序列被压缩进固定大小的 hidden state

Attention 机制早已存在（作为 RNN 的补充），这篇论文的问题是：**能否完全去掉 RNN，只用 attention 来做序列建模？**

## 核心创新

### Self-Attention 机制

给定输入序列，每个位置的表示由**所有其他位置的加权平均**得到：

```
Attention(Q, K, V) = softmax(QK^T / √d_k) · V
```

- **Q（Query）**：当前位置"想查询什么"
- **K（Key）**：每个位置"能提供什么信息"
- **V（Value）**：每个位置"实际携带的内容"
- **√d_k**：缩放因子，防止点积数值过大导致 softmax 梯度消失

**直觉**：每个词对其他词打分（Q·K），分数决定借鉴多少信息（·V）。

### Multi-Head Attention

并行运行多组 attention，每组关注不同的"语言关系"：

```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W_O
where head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)
```

类比：一个人读句子时，同时在关注语法关系、语义关系、指代关系——multi-head 让模型也能同时关注多种关系。

### Positional Encoding

纯 attention 对位置无感知（置换不变）。论文用正弦余弦函数注入位置信息：

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

选择这个设计的原因：不同频率的正弦波能表示位置的相对关系，且对任意长度序列泛化。

### 整体架构

```
Encoder: [Input Embedding + PE] → N × [Multi-Head Attn → FFN]
Decoder: [Output Embedding + PE] → N × [Masked MHA → Cross-Attn → FFN]
```

关键细节：
- **残差连接 + Layer Norm**：每个子层后都有 `LayerNorm(x + Sublayer(x))`
- **FFN**：两层线性变换 + ReLU，在每个位置独立运行
- **Masked Attention**：Decoder 在训练时屏蔽未来位置，保证自回归性

## 实验结果

在 WMT 2014 英德翻译任务：
- **BLEU 28.4**，超过所有之前模型（包括集成模型）
- 训练时间：8 块 P100 训练 3.5 天

在 WMT 2014 英法翻译任务：
- **BLEU 41.0**，新 SOTA
- 训练成本约为同类最优模型的 1/4

## 关键洞察

### 计算复杂度对比

| 层类型 | 每层复杂度 | 顺序操作数 | 最大路径长度 |
|--------|-----------|-----------|------------|
| Self-Attention | O(n²·d) | O(1) | O(1) |
| RNN | O(n·d²) | O(n) | O(n) |
| CNN (k=kernel) | O(k·n·d²) | O(1) | O(log_k n) |

Self-Attention 的最大路径长度是 O(1)——任意两个位置只需要一步 attention 就能直接交互，而 RNN 需要 O(n) 步。这是它解决长距离依赖的根本原因。

### Attention 可解释性

Attention 权重可以可视化，能看出模型学到了一些有意义的关系（指代消解、句法依存）。但需要注意：**attention 权重 ≠ 特征重要性**，这是常见误解。

## Brainstorm：延伸思考

### 这篇论文改变了什么

这篇论文的影响远超当初预期。在 NLP 之外：
- **Vision Transformer（ViT）**：将 patch 视为 token，attention 用于图像
- **多模态模型**：跨模态的 cross-attention（图文、语音文本）
- **强化学习**：Decision Transformer 将 RL 问题当序列建模
- **蛋白质结构**：AlphaFold 的核心也是 attention

**关键洞察**：Transformer 不只是"更好的序列模型"，而是一个通用的"集合函数近似器"——给定一组元素，计算它们之间的关系并更新表示。

### 没有解决的问题

1. **二次复杂度**：序列长度 n 带来 O(n²) 的 attention 计算，长文档很贵。后续工作（Longformer, FlashAttention, Linear Attention）在尝试解决
2. **位置编码**：正弦 PE 在超长序列上泛化不好，现在 RoPE、ALiBi 等方案更主流
3. **样本效率**：Transformer 需要大量数据，小数据场景不如 CNN 稳定

### 一个值得追问的问题

论文标题叫"Attention Is All You Need"，但现实中：
- FFN 层占了 Transformer 约 2/3 的参数
- 有研究表明 FFN 可以视为"键值记忆"（key-value memory）
- 实际上 Transformer = Attention（关系建模）+ FFN（知识存储）

**"All You Need" 可能是个过于 bold 的标题**——但它确实是很好的营销，让论文更容易被记住。

## 理解检验

如果你真的理解了 Transformer，应该能回答这些问题：

1. 为什么 Decoder 的 self-attention 要 mask 未来位置？训练时和推理时分别如何处理？
2. Multi-head attention 的不同 head 会学到什么？它们一定会学到不同的东西吗？
3. 去掉 positional encoding，模型还能训练吗？会有什么效果？
4. FFN 中的 `d_ff = 4 * d_model` 是如何确定的？有理论依据吗？

## 相关阅读

- [BERT (Devlin et al., 2019)](https://arxiv.org/abs/1810.04805) — 双向 Transformer Encoder
- [GPT (Radford et al., 2018)](https://openai.com/research/language-unsupervised) — 自回归 Transformer Decoder
- [FlashAttention (Dao et al., 2022)](https://arxiv.org/abs/2205.14135) — IO-aware attention 加速
- [RoPE (Su et al., 2021)](https://arxiv.org/abs/2104.09864) — 旋转位置编码
