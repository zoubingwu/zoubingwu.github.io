---
layout: post
title: "The Night We Became Translation Engines"
date:   2025-07-01 16:04:00
tags:
- AI
- Agent
description: "A story that I use Tmux and Amazon Q to setup a multi agent translation service"
---

## Background

We heard the familiar refrain: "Why isn't our documentation available in Chinese?"

It was a valid complaint, and honestly, we felt it too. Our internal discussions quickly turned into brainstorming sessions. We'd dabbled with Google Translate for our Japanese documentation before, but the quality was... well, let's just say it left a lot to be desired. It felt clunky, sometimes nonsensical, and definitely wasn't inspiring confidence in our product. The idea of manually translating endless pages of technical docs was, frankly, terrifying.

But then a thought sparked: what if we could leverage the power of AI? We'd been experimenting with various large language models, and their capabilities were evolving at an incredible pace. Could we train one to accurately translate our highly specific technical jargon? The potential was huge, not just for Japanese but for expanding into other key markets without the astronomical cost and time commitment of traditional translation services.

## How to

As exciting as the prospect was, we knew AI wasn't a magic bullet. We quickly identified a few hurdles.

- First, there was the notorious context window limit. Our documentation often includes super long articles, detailed reference guides, and changelogs stretching back years. Feeding an entire document into an AI at once just wasn't feasible.
- Then there was the output token limit – even if we could get a massive chunk in, pulling out an equally massive, coherent translation was another challenge.
- And finally, concurrency limits. We couldn't just spin up hundreds of AI instances simultaneously. Trying to translate everything at once would likely hit rate limits and grind the whole operation to a halt.

Quality validation was another major concern. If we translated thousands of pages, there was no way a human team could review every single word. We needed a scalable solution for ensuring accuracy, especially for critical technical instructions. It felt like a multi-faceted puzzle, and we were determined to solve it.

Our initial tests started small.

I tried a single-agent approach using Amazon Q Developer CLI, specifically leveraging the Claude model for its conversational capabilities which seemed promising for nuanced translations. The idea was to feed smaller chunks of text, get the translation, and then somehow stitch it all together. This worked, to an extent, for short, self-contained sections. But it proved inefficient and prone to losing context over larger documents.

That’s when the multi-agent architecture idea clicked.

I envisioned a system where different AI agents would handle specific tasks, much like a well-organized human team.
By asking AI, I learned about tmux and then opted to use it to automate and orchestrate this symphony of AI minds.
Our setup involved

- one 'dispatcher' agent, whose job was to break down the massive documents into manageable chunks and distribute them.
- Then, we had five 'translator' agents working in parallel – enough to maximize our throughput without bumping too hard against concurrency limits. Each translator would take a chunk, process it, and send the translated output back.
- Finally, a single 'checker' agent would review the translations for consistency, grammatical errors, and adherence to our glossary, flagging anything that looked off. This wasn't a full semantic validation, but more of a sanity check to catch obvious blunders.

The beauty of this system was its pipeline nature. Each agent had a clear role, and tmux allowed us to manage these separate processes, monitor their progress, and even restart them if needed, all from a single terminal session. We weren't trying to make one super-AI; we were creating a workflow where specialized AIs collaborated. It was like building a mini assembly line for language, and when it all hummed together, it was surprisingly efficient.

By the time the sun began to peek through the blinds, painting the sky with the hues of dawn, we had a substantial collection of translated documentation.

The overall quality was super good, far surpassing anything we'd seen from generic machine translation services. It wasn't perfect, of course – no automated system is. There were still nuances lost, cultural idioms that didn't quite land, and the occasional awkward phrasing. But considering the speed and scale, it was truly impressive.

We quickly realized that for super long documents, like our sprawling reference guides, we'd still need some dedicated setup. The chunking strategy, while effective, sometimes broke sentences across segments, leading to minor translation anomalies. This was less about the AI's capability and more about the initial parsing of the source document. We also encountered some quirky trivia issues, like how the AI handled URL hashes or certain nuances of MDX syntax. These weren't deal-breakers, but they highlighted areas where we'd need more sophisticated prompt engineering and, perhaps, some post-job scripting to "clean up" the output. It was a clear indication that while the core translation engine was robust, the pre- and post-processing layers still deserved attention to achieve true production readiness.

## Summary

Playing around with this multi-agent setup, especially watching tmux orchestrate the whole thing, was just plain fun. It felt like we were conducting a tiny AI orchestra, each member playing its part to churn out surprisingly high-quality translations. There's a real satisfaction in seeing a complex system you've engineered come together and deliver results, especially when it solves a recurring pain point. It was a testament to how creative application of existing tools can lead to unexpectedly powerful outcomes.

However, after the initial high wore off and we looked at this from a purely practical, production-ready perspective, we had to admit: while the multi-agent tmux hack was ingenious for a "one night" sprint, a more robust and scalable approach for ongoing operations would be to just use the AI APIs directly. Building out a proper chunking strategy within our application code, handling context management, and managing concurrency programmatically would give us far more control. This would allow us to implement robust error handling, retry mechanisms, and more sophisticated post-processing logic for those tricky URL hashes and MDX syntax issues. The tmux setup was an amazing proof of concept and a quick fix in a pinch, demonstrating the possibility of high-quality AI translation. But for continuous integration and enterprise-level deployment, a dedicated API-driven solution with intelligent chunking strategies is definitely the more sustainable and practical path forward. It was a good reminder that sometimes the best "hack" is one that shows you the way to a more structured, scalable engineering solution.

It proved that with some creative thinking, even seemingly insurmountable problems could be tackled head-on. The takeaway was clear: don't be afraid to experiment, even if your initial solution looks a bit like a Rube Goldberg machine. Sometimes, the most ad-hoc solutions can pave the way for understanding what a truly industrial-strength approach might look like. We learned a ton that night, not just about AI translation, but about agile problem-solving and the sheer power of a few determined engineers with a mission.
