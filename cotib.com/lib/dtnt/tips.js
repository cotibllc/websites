// The Do the Next Thing coaching tips: the text of each approved email, and
// the publish schedule for the public archive at /do-the-next-thing/tips.
//
// Text source: Mac vault COTIB-LLC/Products/Do-the-Next-Thing/
// 2026-11-17-DTNT-Email-Series-DRAFT-FOR-CHUCK.md, emails 1 to 3, approved by
// Chuck 2026-11-17 6:57 PM ET as written. Prompts 1.1, 3.1 and 4.3 are
// verbatim from the locked v0 list. The email greeting ("Hi [first name],")
// is a mail merge field, so the archive leaves it out and keeps the rest.
//
// DATE GATE: a tip shows on the archive only when its publishAt is a real
// date at or before "now". publishAt is null on purpose. null means "not
// scheduled yet", so nothing is public until Chuck sets a date.
//
// PLACEHOLDERS FOR CHUCK: set publishAt for each tip to the date and time its
// dated send goes out, as an ISO string with the New York offset, for example
// '2026-12-01T09:00:00-05:00'. Setting a date here does not send anything. The
// send itself is a separate step in Resend that Chuck approves.

const TIPS = [
  {
    number: 1,
    slug: 'proposal-opening',
    subject: 'The proposal opening you keep avoiding',
    promptName: 'The first ugly version',
    publishAt: null, // PLACEHOLDER: Chuck sets the send date and time for tip 1 (ET)
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
    slug: 'follow-up-you-skipped',
    subject: 'The follow-up you skipped',
    promptName: 'No catch-up',
    publishAt: null, // PLACEHOLDER: Chuck sets the send date and time for tip 2 (ET)
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
    slug: 'close-the-tabs',
    subject: 'Close the tabs, pick one',
    promptName: 'Close the tabs',
    publishAt: null, // PLACEHOLDER: Chuck sets the send date and time for tip 3 (ET)
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

const ET = 'America/New_York';

// Milliseconds for a publishAt value, or null if it is missing or not a date.
function publishTime(tip) {
  if (typeof tip.publishAt !== 'string' || !tip.publishAt.trim()) return null;
  const t = Date.parse(tip.publishAt);
  return Number.isNaN(t) ? null : t;
}

// Tips whose publish time has come, oldest first. Anything unscheduled or
// scheduled for later stays out, including its subject line.
function publishedTips(nowMs = Date.now(), tips = TIPS) {
  return tips
    .filter((tip) => { const t = publishTime(tip); return t !== null && t <= nowMs; })
    .sort((a, b) => publishTime(a) - publishTime(b) || a.number - b.number);
}

function sentOn(tip) {
  const t = publishTime(tip);
  if (t === null) return '';
  return new Intl.DateTimeFormat('en-US', { timeZone: ET, year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(t));
}

module.exports = { TIPS, publishedTips, publishTime, sentOn };
