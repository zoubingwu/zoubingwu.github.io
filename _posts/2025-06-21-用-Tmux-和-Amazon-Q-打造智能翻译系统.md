---
layout: post
title: "用 Tmux 和 Amazon Q 快速搭建一个 multi agent 系统"
date:   2025-06-21 21:08:00
tags:
- AI
- Agent
description: "分享一个利用 Tmux 和 Amazon Q 搭建多智能体翻译系统，高效完成大量文档翻译的案例。"
---

最近公司正好有免费的 Amazon Q 可以用，这东西是个 CLI agent，跟 `Codex` 差不多。巧的是，一直有客户抱怨我们的产品缺少中文文档。翻译这活儿，量大又繁琐，正好是 AI 的用武之地，于是我决定让 AI 把这几百篇文档全给翻译了。

### 一开始，事情并不顺利

在大模型时代之前，很多是用 Google Translate API 来做的，但其实坑很多。比如，文档里的代码块不能翻译，很多专有名词得保持一致。

而直接使用 AI 的话，比较头疼的是有些文章特别长，超出了 AI 的 `context window`，得手动切分成小块，再喂给 AI。

我试着先让单个 agent 来处理，写好 `prompt`，让它一篇一篇地翻译。结果它经常会因为 context 和调用工具次数的限制就停下来，需要我输入"继续"才能继续跑。这显然没法接受，我可不想在电脑前当一晚上的人肉"继续"按钮。

### 用 Tmux 让 Agent 自己"卷"起来

我需要一个能自动化的方法。很快，跟 AI 聊完之后发现了 `tmux` 这个神器。利用 `tmux send-keys` 命令，我完全可以模拟键盘输入，自动给 agent 发送"继续"的指令。

既然能自动化一个 agent，那为什么不能搞一堆 agent 一起干活呢？

于是，一个简单的多智能体（multi-agent）系统诞生了。

用 `tmux` 开了多个窗口（pane），每个窗口里都是一个独立的 Amazon Q 实例：
*   1 个 **Dispatcher**：任务分发员，负责告诉其他 agent 要翻译哪个文件。
*   5 个 **Translators**：翻译工，拿到任务就开干。
*   1 个 **Checker**：质检员，检查翻译稿的质量。

它们共享一个 `markdown` 文件作为"任务清单"。翻译工每完成一篇，就在清单上打个勾，然后质检员跟上检查，检查通过再打个勾。

### 核心思路：Prompt 和自动化脚本

这套系统的核心，其实就是清晰的 `prompt` 和一个 `tmux` 启动脚本。

**1. 让 Agent 各司其职的 Prompt**

我为每种 agent 都写了清晰的指令，告诉它们各自的角色和任务。这些 `prompt` 都保存在项目里（[点击查看完整配置](https://github.com/zoubingwu/docs/tree/7fcb3f912aca2eca489647e41030cd68a8013ca6/.amazon_q_context)）。

*   **对翻译工（Sub Agent）**，我会告诉它翻译完成后必须回复我 'Ready for next translation task. Translation complete for [文件名]' 这句话。这个固定的回复非常关键，是判断任务是否完成的信号。参见[这里](https://github.com/zoubingwu/docs/blob/7fcb3f912aca2eca489647e41030cd68a8013ca6/.amazon_q_context/sub_agent.md)

*   **对质检员（Validation Agent）**，我给了一套检查清单："检查翻译稿的格式、术语是否准确、有没有漏掉的段落等等。"，参见[这里](https://github.com/zoubingwu/docs/blob/7fcb3f912aca2eca489647e41030cd68a8013ca6/.amazon_q_context/validation_agent.md)

**2. 自动化的 Tmux 脚本**

我让 AI 帮我写了一个启动脚本 `continuous_translation.sh`（[点击查看完整代码](https://github.com/zoubingwu/docs/blob/7fcb3f912aca2eca489647e41030cd68a8013ca6/continuous_translation.sh)），它的核心就是下面这几行：

```bash
# 为每个 agent 创建一个 tmux pane
tmux new-session -d -s translation_system
# ... 省略了创建多个 pane 的代码

# 为其中一个 agent 分配翻译任务
prompt="...translate this file: example.md..."
tmux send-keys -t $PANE_ID "$prompt" C-m
```
这几行代码会自动创建 `tmux` 环境，并把任务 `prompt` 发送给对应的 agent，让整个流程无需人工干预就能跑起来。还有一个 `stop_translation.sh`（[点击查看完整代码](https://github.com/zoubingwu/docs/blob/7fcb3f912aca2eca489647e41030cd68a8013ca6/stop_translation.sh)）脚本，可以随时优雅地停止所有任务。

### 结果与思考

这套简单的系统跑了一晚上，就搞定了几百篇文档的翻译，效果出乎意料地好。翻译质量很高，只有少数特别长的文章需要人工快速校对一下。

这次实验也让我感受到了多智能体系统的潜力。如果继续优化，比如让 agent 能够自动把长文章分片，再交给其他 agent 处理，效率和自动化程度还能更高。

当然，这么玩 `token` 消耗是巨大的。还好这次用的是公司免费的 Amazon Q，随便造。如果是自己掏钱，我可能会选择 `Gemini API`，它的 `context window` 更大，价格和速度也更有优势。
