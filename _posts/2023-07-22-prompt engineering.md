---
layout: post
title: 'prompt engineering'
date: 2023-07-22 19:36:23
tags:
  - ai
  - prompt
description: 'How to write good prompt when using chatgpt'
---

We are always seeing something like "Best 100 instructions for ChatGPT that everyone is looking for!" on twitter, but let's face it, no one can remember 100 prompts and there's absolutely no need to!

When interacting with ChatGPT, the most important thing is to understand the pattern or structure of the prompt, rather than memorizing so many prompts.

## Basic Usage

Simply enter the instruction you want, for example:

- `Please translate the following content into [your_language]:`
- `Please generate a summary of the following content:`
- `Please explain to a 10-year-old what ChatGPT is.`

Most of the basic needs can be met directly, but for slightly better results, you can **specify a role** for GPT. For example:
"You are a professional English translator, please translate the following content into Simplified Chinese:"

### Why specify a role?

Well LLM doesn't aim for success, but rather for imitation. To get good results from it, you need to be specific in your requests. When training a Transformer, it is exposed to various training datasets, which can contain solutions of different quality. By default, the Transformer imitates all the data, including low quality solutions. To improve its performance, you need to guide it towards the correct solution by specifying a role or providing step-by-step prompts. However, be careful not to request an unrealistic level of intelligence as it may result in strange or irrelevant outputs. It's important to find the right balance between specificity and complexity for optimal results.

## Better

Provide one or multiple examples to let GPT output in the format you expect. For example:

You are a professional translator who is good at translating English to Chinese, but please do not translate the English inside the quotation marks.

Example prompt:

```
"Dichroic-Filter" - Separates light into different wavelengths to create a color separation effect.
```

Output:

```
"Dichroic-Filter" - 将光分离成不同的波长以创建颜色分离效果。
```

With examples, most problems can be solved.

## Advanced

Chain thinking (do it in multiple steps) + slow thinking (print out the result of each step)

For some complex reasoning processes, it's easy for GPT to make mistakes if you ask it to give an answer directly. It's best to let GPT do it step by step and print out the intermediate steps.

In OpenAI's official documentation, there is a an [article](https://platform.openai.com/docs/guides/gpt-best-practices/tactic-instruct-the-model-to-work-out-its-own-solution-before-rushing-to-a-conclusion) which gives a good example of using GPT to assist a student as a teacher’s assistant. After receiving a question from a student, instead of giving a correct or incorrect answer, you can:

```
Answer the user's inquiry according to these steps.

Step 1 - First find your own solution to the problem. Don't rely on the student's solution, as it may be incorrect. Use triple quotes (""") to enclose all your work in this step.

Step 2 - Compare your solution with the student's solution and evaluate whether the student's solution is correct. Use triple quotes (""") to enclose all your work in this step.

Step 3 - If the student made a mistake, determine what hint you can give the student without revealing the answer. Use triple quotes (""") to enclose all your work in this step.

Step 4 - If the student made a mistake, provide the hint from the previous step to the student (outside the triple quotes). Instead of writing "Step 4 -...", write "Hint:".
Of course, you can add several examples to this chain thinking model for better results.
```

Finally, here is a template that can be applied to most scenarios without the need to remember the so-called best 100 instructions for GPT, which won't exceed the following scope:

- ✅ Role, skill, personality
- ✅ Goal
- ✅ Specific context, keywords, negative words
- ✅ Input rules
- ✅ Output rules
- ✅ Input and output examples.
