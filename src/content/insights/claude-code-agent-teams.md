---
title: "用 Agent Teams 并行开发：一次实践分享"
date: 2026-03-12
category: claude-code
summary: "用 Claude Code 的 Agent Teams 功能并行构建这个博客，多个 agent 同时处理 SVG 插图、内容模板和组件开发，体验到了真正意义上的 10x 执行速度。"
tags: [claude-code, agent-teams, 效率]
lang: zh
cover: "/blog/covers/code-patterns.svg"
coverAlt: "电路板几何图案，象征多线程并行的系统架构"
draft: false
---

## 背景

今天要建这个个人博客，任务清单大概长这样：

- 设计 4 套 SVG 封面插图
- 创建 4 篇不同 collection 的 sample 内容
- 确保 frontmatter schema 与 `content.config.ts` 完全对齐
- 保证文件路径和 cover 引用都正确

如果顺序做，每个任务大概 10-15 分钟。如果并行——

## Agent Teams 是什么

Claude Code 的 Agent Teams（或叫 subagents）允许你在一个任务中启动多个并行的 claude 实例，每个实例独立处理一部分工作，最后汇总结果。

关键点：
- 每个 agent 有独立的上下文窗口
- Agent 之间可以通过文件系统共享状态（写文件/读文件）
- 协调逻辑由主 agent 或任务描述负责

## 实际工作流

这次我把任务拆成了几个并行分支：

```
主任务: 构建博客 sample 内容和封面图

├── Agent A: SVG 封面插图
│   ├── daily-reflection.svg  (流动波浪风格)
│   ├── code-patterns.svg     (电路板几何风格)
│   ├── skill-tree.svg        (树形结构风格)
│   └── paper-abstract.svg    (分层深度风格)
│
└── Agent B: Markdown 内容文件
    ├── daily/2026-03-12.md
    ├── insights/claude-code-agent-teams.md
    ├── insights/interview-mode-skill.md
    └── papers/attention-is-all-you-need.md
```

两个 agent 同时开工，各自完成自己的部分，互不依赖。

## 关键经验：任务粒度很重要

并行带来的加速，前提是任务之间**真的相互独立**。

这次踩的小坑：SVG 的 `viewBox` 尺寸要和 markdown 的 `cover` 路径约定保持一致。如果两个 agent 对这个约定的理解不同，最后合并时会出错。

解决方式是在任务描述里**显式写清楚共享约定**：

```markdown
## 共享约定（所有 agent 必须遵守）

- cover 路径格式：/blog/covers/[name].svg
- SVG viewBox：0 0 1200 630
- 色彩 palette：#a88264, #9b7158, #f0ebe3, #e0d5c6, #1a1a1a
```

有了这个锚点，两边各做各的，最后组合完全正确。

## 和顺序执行的对比

| | 顺序执行 | Agent Teams |
|---|---|---|
| 总时间 | ~60 分钟 | ~15 分钟 |
| 上下文压力 | 高（一个窗口塞所有内容）| 低（各自独立） |
| 错误扩散 | 高（一处错影响后续）| 低（模块隔离）|
| 任务协调成本 | 低 | 中（需要写清楚约定）|

效率提升是真实的，但**协调成本不为零**。任务越复杂、依赖关系越多，写清楚约定的代价就越高。

## 适合用 Agent Teams 的场景

- 大量**同构的重复任务**（比如批量生成 10 篇不同主题的文章）
- **天然独立**的模块（前端组件 vs 后端 API vs 文档）
- 需要**多种风格**的创作任务（不同角度的封面图、不同语调的文案）

不适合的场景：

- 任务之间有强依赖关系（A 的输出是 B 的输入）
- 需要全局一致性判断（比如设计系统的视觉风格统一）

## 一个直觉

Agent Teams 本质上是把「一个人做所有事」变成「团队分工」。团队的效率来自分工，但团队的失败往往来自沟通不畅。

所以**在任务描述上多花 5 分钟，往往能节省后期 30 分钟的 debug 时间**。
