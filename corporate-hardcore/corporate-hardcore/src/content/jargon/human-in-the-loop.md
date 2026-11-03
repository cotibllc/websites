---
title: "Human in the Loop"
date: "2026-12-28"
description: "The practice of having a person review or approve the output of an AI system before it takes effect. In corporate deployment, the human is responsible for every mistake the AI makes and is given about four seconds per item to catch them."
stat: "Average human review time per AI generated item fell from 2 minutes to 11 seconds within the first quarter of rollout"
statSource: "Chuck Morrison's field notes, 2023 to 2026 (three years of AI pilot rollouts, approval queues, and incident reviews)"
quote: "Don't worry, there's always a human in the loop."
quoteContext: "Said at the launch of Synergy Assist's ticket triage feature. The human in the loop was Chuck. He was assigned 340 approvals a day in addition to his existing role. His title did not change."
faqs:
  - question: "What does 'human in the loop' mean?"
    answer: "A design pattern where a person checks, corrects, or approves what an automated system produces before it is used. It is a real safeguard when the person has the time, training, and authority to say no. Chuck Morrison has observed that in most rollouts, the person has one of the three."
  - question: "Who is accountable when an AI makes a mistake with a human in the loop?"
    answer: "The human. The loop exists in part so that accountability has somewhere to go. The last time Synergy Assist routed a ticket to the wrong department, the incident review identified 'reviewer oversight' as the root cause. The reviewer had approved 280 items that day. The review did not mention who set the number."
  - question: "Does a human in the loop slow AI down?"
    answer: "It is supposed to. That is the point of the loop. In practice, the review step is measured as a bottleneck within weeks, and the reviewer is asked to move faster. The loop gets shorter until the human is mostly a timestamp."
  - question: "How can a human in the loop actually work?"
    answer: "Give the reviewer a realistic volume, the authority to reject without justification, and protected time that is not stacked on top of their existing job. Measure the reviewer on errors caught, not items approved. Chuck has seen this done once. It worked. The pilot was considered too slow to scale."
examples:
  - label: "Launch language"
    text: "Synergy Assist drafts the response, and a human in the loop approves it before it goes out. Best of both worlds."
  - label: "Three months later"
    text: "Approval times are trending high. Let's see if we can streamline the human review step."
  - label: "Rare sincere use"
    text: "Reviewers get a cap of 60 items a day and can reject anything without explaining why. If the queue backs up, we slow the AI down, not the people."
---

Chuck Morrison became a human in the loop on a Tuesday. Nobody asked him. The loop was announced at an all hands, and his name was on the slide under "Oversight."

On the first day, he reviewed 40 items from Synergy Assist and corrected 9 of them. On the thirtieth day, he reviewed 340 items. He does not know how many he corrected. There was not time to count.

The phrase sounds like a promise that people remain in charge. In practice, it often means people remain liable. The AI does the work, the human signs the work, and the signature is what the incident review reads.

Chuck still believes in the loop. He would like the loop to include a lunch break.
