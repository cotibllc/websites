// The Do the Next Thing coaching tips: the text of each approved email, and
// when each one reaches a reader.
//
// Text source: Mac vault COTIB-LLC/Products/Do-the-Next-Thing/
// 2026-11-17-DTNT-Email-Series-DRAFT-FOR-CHUCK.md, emails 1 to 3, approved by
// Chuck 2026-11-17 6:57 PM ET as written. Prompts 1.1, 3.1 and 4.3 are
// verbatim from the locked v0 list. The email greeting ("Hi [first name],")
// is a mail merge field, so the emails and the archive leave it out and keep
// the rest.
//
// TIMING (Chuck, 2026-11-19): tips go out relative to each person's confirmed
// signup, not on calendar dates. delayDays is the number of days after the
// confirm click: Tip 1 on confirm (0), Tip 2 on day 3, Tip 3 on day 7.
// api/dtnt/confirm.js sends Tip 1 right away and schedules Tips 2 and 3 with
// Resend's scheduled_at (Resend allows up to 30 days ahead).
//
// ARCHIVE: /do-the-next-thing/tips shows all three tips at all times. Nothing
// on that page depends on a date.

const TIPS = [
  {
    number: 1,
    delayDays: 0,
    slug: 'proposal-opening',
    subject: 'The proposal opening you keep avoiding',
    promptName: 'The first ugly version',
    blocks: [
      ['p', `You have a proposal to write. You open the doc, look at the blank first paragraph, and close it again. The opening feels like it has to be good, so it stays empty.`],
      ['p', `**The technique:** start with an ugly first version. A blank page can't be fixed, but a rough one can. So don't ask yourself to write the opening. Ask for one small move that leaves something rough on the page.`],
      ['p', `**The prompt.** Paste this into your AI chat and swap [the thing] for what you're avoiding:`],
      ['code', `I need to start [the thing] and I haven't begun. Give me ONE move I can finish in under 10 minutes that leaves a rough first piece on the page or screen. No research, no setup, no tools to install. Tell me exactly what to type or make first, and what "done" looks like. One sentence of instruction, one sentence of done. Nothing else.`],
      ['p', `**Example (illustrative, not a customer result).** You type "the opening of a consulting proposal." A reply might be: "Open your proposal draft and write two rough sentences: the client's problem and the outcome they asked for. Done means both sentences are saved at the top of the draft." Your reply will vary.`],
      ['p', `If you get more than one move back, answer: "Too big. Smaller. One move, under 10 minutes, no research."`],
      ['p', `**Today:** start a 10-minute timer, do the one move, and stop when it ends. Rough is the goal.`],
      ['p', `Chuck`],
    ],
  },
  {
    number: 2,
    delayDays: 3,
    slug: 'follow-up-you-skipped',
    subject: 'The follow-up you skipped',
    promptName: 'No catch-up',
    blocks: [
      ['p', `You meant to follow up with a prospect last week. Now it's been two, and the message seems to need an apology and a paragraph of explanation. So it waits, and the wait makes it harder.`],
      ['p', `**The technique:** skip the catch-up. The gap feels big because you're trying to make up for it. Treat today as if the skip never happened and do one small move that puts you back in. Nobody is grading the gap but you.`],
      ['p', `**The prompt.** Paste it in and fill the brackets:`],
      ['code', `I skipped [the thing] for [how long]. Don't give me a catch-up plan. Give me one move under 10 minutes that puts me back in it today, as if the skip never happened. Tell me what to do and what proof I'll have when I'm done.`],
      ['p', `**Example (illustrative, not a customer result).** You fill in "following up with a prospect after sending a proposal" and "two weeks." A reply might be: "Find your original proposal email and reply to it with two sentences: ask if they had a chance to look it over, and offer one time to talk this week. Done means the reply is sent and sitting in that thread." Your reply will vary.`],
      ['p', `**Today:** use the prompt on the one follow-up you've been avoiding, and send it before your timer ends. Don't edit it a fourth time.`],
      ['p', `Chuck`],
    ],
  },
  {
    number: 3,
    delayDays: 7,
    slug: 'close-the-tabs',
    subject: 'Close the tabs, pick one',
    promptName: 'Close the tabs',
    blocks: [
      ['p', `You're building a side offer, and you have a decision to make: how to price it, what to call it, or which version to start with. You've got a dozen tabs open on it. Another article feels like it will finally settle things.`],
      ['p', `**The technique:** notice when research has turned into avoiding. Past a certain point, more reading doesn't help you decide. It just postpones it. The way out is to write your choice in one sentence, then take one small action that makes it real. You can change a decision later. You can't change one you never made.`],
      ['p', `**The prompt.** Paste it in and name your decision:`],
      ['code', `I've been researching [the decision] instead of making it. Tell me to close the research, then write my choice in one sentence, then take one 10-minute action that makes the choice real (send it, book it, write it, start it). Tell me exactly what that action is.`],
      ['p', `**Example (illustrative, not a customer result; the price is a placeholder).** You fill in "what to charge for my first fixed-price audit." A reply might be: "Close the tabs. Write one sentence: 'My first audit is $1,500, fixed.' Then email that number to one person who asked about it." Your reply will vary.`],
      ['p', `**Today:** close the research tabs, write your choice in one sentence where you'll see it, and do the one action. If you think you picked wrong, you can change it next week.`],
      ['p', `Chuck`],
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// When a tip should be delivered, in ms since the epoch, given the moment the
// reader confirmed. Tip 1 (delayDays 0) is the confirm moment itself.
function sendAtMs(confirmedAtMs, tip) {
  return confirmedAtMs + tip.delayDays * DAY_MS;
}

module.exports = { TIPS, DAY_MS, sendAtMs };
