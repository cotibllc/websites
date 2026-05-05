+++
title = "Delegation Drift"
Date = 2026-05-04
+++

I thought I was a pretty good delegator.

Nearly 15 years of leading technology teams through complicated problems. Clear on the outcome, not just the task. Follow up without micromanaging. Sit down with the person when something goes wrong, find the disconnect, have them play it back, confirm it in writing.

That system worked. I watched it work across teams and organizations.

Then I started delegating to agents.

**The reconciliation that wasn't**

A few months ago I asked an agent to pull data from three different systems, analyze it, and build a reconciliation process to identify what was missing from our primary source.

The agent did exactly what I asked. It pulled the data. It performed the analysis. It returned the missing records.

Just the missing records. Nothing about where those records existed in the other systems. Nothing about why the inconsistency existed. A list of gaps with no map to explain them.

My team spent the next several hours investigating what the agent had already touched, trying to reconstruct the context the output never included.

The task was completed. The work wasn't done.

I didn't blame the agent. I blamed my instructions. A human would have asked before they got halfway through the work. Someone on my team would have looked up from their screen and said, "Do you want me to just flag the gaps or trace where this data actually lives?" And I would have said trace it. We would have saved the better part of a day.

The agent didn't ask. Not because it couldn't. Because I didn't tell it to.

**The loop you never noticed**

Every management framework assumes a clarifying loop. A human misunderstands something, and you usually know before the work comes back. There's a look. A pause in the hallway. An email that reveals the interpretation went sideways three days before the deadline. I've spent 15 years learning to read those signals. Catching a misunderstanding early is almost always cheaper than correcting it after the fact.

With an agent there's no signal. The work just comes back. By the time you see the output, the misunderstanding has already run its full course.

This isn't a technology problem. It's a visibility problem. It's the same visibility problem from the last episode wearing different clothes. You can't read the room when there's no one in it.

When you remove the human, the loop disappears. What's left is instruction quality. That's the only defense you have against drift.

**What I started doing without a framework telling me to**

After that reconciliation output, I started slowing down when writing instructions for agents in a way I don't always slow down for people. I re-examine the ask. I think about the assumptions I'm carrying that the agent won't share. I front-load the context a human would have asked for in the first place.

I started adding clarifying prompts directly into the instruction set. Explicit permission for the agent to flag ambiguity before proceeding.

Nobody told me to do this. I did it because of what that afternoon cost us.

The problem is I was applying it inconsistently. Only when I remembered. Only on tasks where a previous failure made me cautious. I hadn't made it structural. I hadn't taught it to the people I lead.

That's delegation drift. Not a sudden failure. A slow slide between what you intended and what the agent interpreted, across dozens of small assignments, accumulating quietly until something surfaces that costs more to fix than it should have.

The key word is accumulating. Individual tasks look fine. The drift compounds across assignments until one output makes it visible.

**The configuration drift parallel**

If you've been in IT long enough, you've lived this problem under a different name.

Nobody sets out to have inconsistent infrastructure. It happens one undocumented change at a time until something breaks and you spend a weekend tracing it back. How many severity one calls have started with "no change was made" only for someone to eventually surface a change that wasn't worth a change request, until it was?

Configuration drift gets addressed with infrastructure as code, version control, and automated compliance checks. Delegation drift gets addressed with instruction discipline. Same problem, different layer.

The fix I landed on: build ambiguity and clarification skills directly into your model. Not as a reminder you add when you remember. A skill that loads every time you send an instruction set, asks what's unclear, surfaces the assumptions, confirms the output format before the work runs to completion. Make it structural so you can't forget it.

**The 70/30 connection**

The 30% that's entirely human in the 70/30 principle is instruction quality at the moment of assignment. If that 30% is inconsistent, the whole pipeline drifts.

There's one more thing worth naming. My team originally wanted to build one agent to handle an entire automation workflow. I pushed back. If I ask one person to do 30 different things to produce one output, they're going to get lost along the way. That's why teams exist. The same logic applies to digital workers. Delegate across agents the way you delegate across people. A broken instruction 30 steps into a single-agent pipeline means steps one through 29 have to be redone.

**What delegation requires now**

The future leader in a digital worker environment is not necessarily the best people person. It's the systems design thinker who can break down a business process into something a digital worker can follow without drifting.

That means defining the outcome and the scope explicitly. Building ambiguity flags into the instruction set by default, not just on tasks where you've been burned before. Creating a review point before the output is final. Documenting what you learn from every misalignment as an input to the next instruction, not just a post-mortem.

None of this is technically complicated. All of it is intentional in a way that human delegation never had to be.

The manager's job now includes teaching instruction discipline the same way it once included teaching how to write a proper ticket or run a post-mortem. The question is whether you're doing that for your team, or assuming they'll figure it out the same way you figured it out.

Think about the last thing you delegated to an automated process or an AI tool. Did you write that instruction the same way you would have explained the task to a person? Or did you slow down, front-load the context, and anticipate the questions it couldn't ask?

If there's a difference in how you approached it, that difference is your new leadership practice. The question is whether you're applying it consistently, or only when you remember to.

The full essay behind this episode is at [techleadshift.com](https://techleadshift.com). Listen at [theitxp.com](https://theitxp.com).
