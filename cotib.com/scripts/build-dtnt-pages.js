#!/usr/bin/env node
// Writes the two static Do the Next Thing pages from the shared chrome in
// lib/dtnt/pages.js. Run after editing copy:  node scripts/build-dtnt-pages.js
// Output is committed (www/ is served as is), so the deploy needs no step.
const fs = require('fs');
const path = require('path');
const { page } = require('../lib/dtnt/pages');
const { CONSENT_TEXT } = require('../lib/dtnt/config');

const WWW = path.join(__dirname, '..', 'www');
const TURNSTILE_SITE_KEY = '0x4AAAAAAC2VHJDJh24KBJBW'; // same widget as /contact

const landing = page({
  title: "Do the Next Thing: 28 prompts for when you know the step and still don't take it | COTIB LLC",
  description: 'Do the Next Thing: 28 prompts for when you know the step and still don\'t take it. Start with 3 prompts, free: paste one in, start a 10-minute timer, and see if it moves you. A COTIB LLC product.',
  canonical: 'https://www.cotib.com/do-the-next-thing',
  headExtra: `
  <meta property="og:type" content="website">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`,
  bodyEnd: `
  <script src="/dtnt/signup.js" defer></script>`,
  main: `
    <!-- 1. Hero: the product shown, not described -->
    <section class="hero" aria-labelledby="title">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">a COTIB LLC product</p>
          <h1 id="title">Do the Next Thing</h1>
          <p class="sub">28 prompts for when you know the step and still don't take it</p>
          <p class="lead">You blocked the morning for the one thing that matters this week. By noon the inbox is at zero, the project folders have new names, and six tabs are open on a question you answered last Tuesday. The step itself hasn't moved.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#free">Start with 3 prompts, free</a>
          </div>
        </div>

        <figure class="hero-figure">
          <article class="paper sheet" aria-label="Prompt 1.1, one of the 3 free prompts">
            <div class="sheet-meta"><span>Bucket 1: START</span><span class="sheet-tag">In the free sampler</span></div>
            <h2><span class="num">1.1</span>The first ugly version</h2>
            <p class="prompt">I need to start <span class="bracket">[the thing]</span> and I haven't begun. Give me ONE move I can finish in under 10 minutes that leaves a rough first piece on the page or screen. No research, no setup, no tools to install. Tell me exactly what to type or make first, and what "done" looks like. One sentence of instruction, one sentence of done. Nothing else.</p>
          </article>
          <div class="timer-rule" aria-hidden="true">
            <div class="bar"></div>
            <div class="labels"><span>0</span><span>10 min</span></div>
          </div>
          <figcaption class="sr-only">Prompt 1.1, The first ugly version, shown in full above a ten-minute scale.</figcaption>
        </figure>
      </div>
    </section>

    <!-- 2. The one primary action: free sampler signup (double opt-in) -->
    <section class="free" id="free" aria-labelledby="free-title">
      <div class="wrap free-grid">
        <div class="section-head">
          <h2 id="free-title">Start with 3 prompts, free</h2>
          <div class="ticks" aria-hidden="true"></div>
          <p>Not ready to buy? Get three of the 28 prompts as a short PDF. One is for starting, one for coming back after a skip, and one for when you're researching instead of deciding. Paste one in, start a 10-minute timer, and see if it moves you.</p>
        </div>

        <div class="paper formcard" id="free-card">
          <form id="free-form" method="post" action="/do-the-next-thing/free" novalidate>
            <div class="field">
              <label for="free-email">Email</label>
              <input id="free-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required>
            </div>
            <label class="consent" for="free-consent">
              <input id="free-consent" name="consent" type="checkbox" required>
              <span>${CONSENT_TEXT}<small>Required</small></span>
            </label>
            <div class="hp" aria-hidden="true">
              <label for="free-website">Website</label>
              <input id="free-website" name="website" type="text" tabindex="-1" autocomplete="off">
            </div>
            <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-action="dtnt-free"></div>
            <p class="form-error" id="free-error" role="alert" tabindex="-1"></p>
            <button class="btn btn-primary" type="submit">Send me the 3 prompts</button>
            <p class="confirm-note">We'll email you a confirm link first. Your sampler comes when you click it. Privacy: <a href="/do-the-next-thing/privacy">cotib.com/do-the-next-thing/privacy</a>. a COTIB LLC product.</p>
          </form>
          <div class="done" id="free-done" tabindex="-1" aria-live="polite">
            <h3>Check your email.</h3>
            <p>We sent a confirm link to the address you entered. Click it within 48 hours to get your 3 prompts. Not there in a few minutes? Check spam or promotions.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. The pinned line + what it is -->
    <section aria-label="What it is">
      <div class="wrap split">
        <figure class="pinned">
          <p class="setup">A post pinned in the Success Club, the free community Dean Graziosi co-founded through Mastermind.com, names it:</p>
          <blockquote>Knowing Isn't the Same As Doing.</blockquote>
        </figure>

        <div class="story">
          <p class="big">You already know the step.</p>
          <div class="ticks" aria-hidden="true"></div>
          <p>What's missing is a move small enough that you'll take it before something easier gets there first.</p>
          <p>Do the Next Thing is 28 prompts for that moment. It's not a framework, and it won't hand you a bigger plan. Pick the bucket that matches where you are, paste one prompt into ChatGPT, Claude, Gemini, or any AI chat app, fill in the [brackets], and start a 10-minute timer. You get one move. You do it.</p>
          <div class="reply">
            <p>If the answer comes back too big, you reply:</p>
            <code>"Too big. Smaller. One move, under 10 minutes, no research."</code>
          </div>
          <p class="closer">None of the prompts explain why you stalled. Each one ends with you doing something.</p>
        </div>
      </div>
    </section>

    <!-- 4. How it works -->
    <section aria-labelledby="how">
      <div class="wrap split-head">
        <div class="section-head">
          <h2 id="how">How it works</h2>
          <div class="ticks" aria-hidden="true"></div>
        </div>
        <ol class="steps">
          <li><div>Pick the bucket that matches where you are.</div></li>
          <li><div>Paste one prompt into any AI chat app and swap the [brackets] for your own words.<span>The free versions work.</span></div></li>
          <li><div>Start a 10-minute timer and do the one move it gives you.<span>When the timer ends, stop.</span></div></li>
        </ol>
      </div>
    </section>

    <!-- 5. The index -->
    <section aria-labelledby="inside">
      <div class="wrap">
        <div class="section-head">
          <h2 id="inside">28 prompts in 5 buckets</h2>
          <div class="ticks" aria-hidden="true"></div>
        </div>
        <div class="index" role="list">
          <div class="index-row rev2" role="listitem"><span class="n">01</span><h3>START <small>(6)</small></h3><p class="when">You haven't touched it yet.</p></div>
          <div class="index-row rev2" role="listitem"><span class="n">02</span><h3>CONTINUE <small>(6)</small></h3><p class="when">You started, and momentum dropped.</p></div>
          <div class="index-row rev2" role="listitem"><span class="n">03</span><h3>RESTART AFTER A SKIP <small>(5)</small></h3><p class="when">You missed a day, a week, or longer.</p></div>
          <div class="index-row rev2" role="listitem"><span class="n">04</span><h3>DECIDE <small>(5)</small></h3><p class="when">You're stuck between options and researching instead.</p></div>
          <div class="index-row rev2" role="listitem"><span class="n">05</span><h3>SHIP <small>(6)</small></h3><p class="when">It's almost done and you keep polishing.</p></div>
        </div>
        <p class="by-name">A few of the prompts by name: <b>The first ugly version.</b> <b>Skip the stuck part.</b> <b>No catch-up.</b> <b>Close the tabs.</b> <b>Hit the button.</b></p>
      </div>
    </section>

    <!-- 6. Paid versions: shown as coming soon, with no buy buttons. -->
    <section id="pick" aria-labelledby="pick-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="pick-title">The full Pack is coming soon</h2>
          <div class="ticks" aria-hidden="true"></div>
        </div>

        <div class="tiers">
          <article class="tier is-soon" aria-labelledby="t1">
            <h3 id="t1">The Pack</h3>
            <p class="price"><b>$24</b></p>
            <ul>
              <li>All 28 prompts in 5 buckets</li>
              <li>A beginner how-to with one worked example, start to finish</li>
              <li>The one reply for when your AI gives you too much</li>
              <li>A 10-page PDF, a Notion template, and a one-page printable cheat sheet that maps back to the PDF</li>
            </ul>
            <p class="soon">Coming soon</p>
          </article>

          <article class="tier is-soon" aria-labelledby="t2">
            <h3 id="t2">The Pack plus Assistant Setup Kit</h3>
            <p class="price"><b>$37</b></p>
            <p class="lede">Everything in the Pack, plus the Setup Kit:</p>
            <ul class="kit">
              <li>A setup guide for turning the prompts into a standing assistant you can come back to</li>
              <li>The prompts and skills as plain text files, ready to paste</li>
              <li>Onboarding steps for your first session, from setup to your first 10-minute move</li>
            </ul>
            <p class="coach"><b>Bonus: the Do the Next Thing Coach.</b> A link to a ready-made Grok Bot template that runs the prompts with you, one move at a time. It's a bonus that comes with the kit, not the product itself. The Coach requires your own Grok Bot account on a paid plan, sold separately.</p>
            <div class="grow"></div>
            <p class="soon">Coming soon</p>
          </article>
        </div>
        <p class="soon-note">Neither version is on sale yet. <a href="#free">Start with the 3 free prompts.</a></p>
      </div>
    </section>

    <!-- 7. Fit + Questions -->
    <section aria-labelledby="fit-title">
      <div class="wrap">
        <h2 id="fit-title" class="sr-only">Who it's for</h2>
        <div class="fit">
          <div>
            <h3>Who it's for</h3>
            <ul>
              <li>You already know your next step, on a project, a business, or a piece of work you care about.</li>
              <li>You stall anyway: the inbox, tidying, one more tutorial, one more round of research.</li>
              <li>You use an AI chat app, or you're willing to paste a prompt into one.</li>
              <li>You'll start a 10-minute timer and stop when it ends.</li>
            </ul>
          </div>
          <div class="not">
            <h3>Who it isn't for</h3>
            <ul>
              <li>You don't know your next step yet. These prompts assume you do.</li>
              <li>You want to understand why you stall. None of the prompts go there.</li>
              <li>You're looking for a framework, a productivity system, or a course.</li>
              <li>You want someone to coach you live. This is a prompt pack and a kit, not a person.</li>
            </ul>
          </div>
        </div>

        <div class="faq">
          <h3 class="faq-title">Questions</h3>
          <details open>
            <summary>Is there a free version?</summary>
            <p>Yes. Get three of the 28 prompts free: put your email in the <a href="#free">form above</a> and confirm it. We'll send the sampler and a few short emails about the full Pack. Unsubscribe any time.</p>
          </details>
          <details>
            <summary>Do I need a paid AI account?</summary>
            <p>Not for the Pack, and not for the prompts and skills in the Setup Kit. They work in any AI chat app you can paste into, like ChatGPT, Claude, or Gemini, and the free versions work. The Coach bonus is different: it runs in Grok Bot and requires your own Grok Bot account on a paid plan, sold separately.</p>
          </details>
          <details>
            <summary>What's the Coach?</summary>
            <p>An AI coach, built as a Grok Bot template, that picks one 10-minute move with you at a time using the 28 prompts. It's an AI, not a person, and it isn't medical, mental-health, or financial advice.</p>
          </details>
          <details>
            <summary>What format is it?</summary>
            <p>A PDF, a Notion template you import, and a one-page cheat sheet you can print. The Setup Kit adds plain text files and a setup guide.</p>
          </details>
          <details>
            <summary>What if I don't know my next step?</summary>
            <p>Then this isn't the right pack yet. The prompts assume you already know the step and just aren't taking it.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 8. Close + fine print -->
    <section class="close" aria-label="Closing">
      <div class="wrap">
        <p class="last">The tabs will still be there tomorrow. What you do with the next 10&nbsp;minutes is yours.</p>
        <a class="btn btn-quiet" href="#free">Start with 3 prompts, free</a>

        <div class="fineprint">
          <h2>Fine print</h2>
          <ul>
            <li>The Coach bonus requires your own Grok Bot account on a paid plan, sold separately.</li>
            <li>Not affiliated with or endorsed by SpaceXAI or Cursor.</li>
            <li>Not affiliated with or endorsed by Dean Graziosi or Mastermind.com.</li>
            <li>Privacy: how we handle your email is at <a href="/do-the-next-thing/privacy">cotib.com/do-the-next-thing/privacy</a>.</li>
            <li>Questions: <!--email_off--><a href="mailto:customerservice@cotib.com">customerservice@cotib.com</a><!--/email_off--></li>
          </ul>
          <p class="m0">A COTIB LLC product.</p>
        </div>
      </div>
    </section>`,
});

const privacy = page({
  title: 'Privacy notice: Do the Next Thing | COTIB LLC',
  description: 'What COTIB LLC collects when you use the Do the Next Thing page or sign up for the free sampler, and who processes it.',
  canonical: 'https://www.cotib.com/do-the-next-thing/privacy',
  main: `
    <section class="hero" aria-labelledby="title">
      <div class="wrap">
        <article class="prose">
          <p class="eyebrow">a COTIB LLC product</p>
          <h1 id="title">Privacy notice: Do the Next Thing</h1>
          <div class="ticks" aria-hidden="true"></div>
          <p class="lead">This notice explains what COTIB LLC collects when you use the Do the Next Thing page at cotib.com/do-the-next-thing, sign up for the free sampler, or download it. For our QuickBooks integration app, see <a href="/privacy">cotib.com/privacy</a>.</p>

          <h2>What we collect and why</h2>
          <h3>When you sign up for the free sampler:</h3>
          <ul>
            <li>Your email address and your consent record: the version of the signup wording you agreed to, when you signed up, when you clicked the confirm link, and a hashed version of your IP address (a one-way code, not the raw IP).</li>
            <li>We use a two-step signup: we only add you to our list after you click the confirm link in your email.</li>
            <li>Signups are checked by Cloudflare Turnstile to stop bots. Turnstile processes data such as your IP address and browser signals to do this.</li>
            <li>We use your email to send the confirm link and the sampler. Your consent also covers up to 3 short emails about the paid Pack. We aren't sending those yet. You can unsubscribe any time.</li>
            <li>To slow down repeat tries, the signup form allows about 10 tries a minute from one connection. That count is kept in memory for a minute and isn't saved.</li>
          </ul>
          <p><strong>When you email us:</strong> your email address and anything you write to us.</p>
          <p>We don't sell your information, and we don't use it for advertising.</p>

          <h2>Who processes it for us</h2>
          <ul>
            <li><strong>Resend:</strong> sends our emails and stores the free-sampler email list, including your consent record and whether you've unsubscribed.</li>
            <li><strong>Vercel:</strong> hosts this page and runs the signup, confirm, download, and unsubscribe service (serverless functions), and stores the sampler file.</li>
            <li><strong>Cloudflare:</strong> provides Turnstile.</li>
          </ul>

          <h2>How long we keep it</h2>
          <ul>
            <li>Unconfirmed signups: we don't store them. The confirm link in your email works for 48 hours, and you're only added to our list if you click it.</li>
            <li>Free sampler download links: 30 days.</li>
            <li>Sampler list membership and consent record: kept on your contact in Resend for as long as the contact exists.</li>
            <li>After you unsubscribe: we keep your contact in Resend, marked unsubscribed, so we don't email you again. We don't delete it. If you sign up again later, you're only added back after you click a new confirm link.</li>
            <li>The log lines our signup service writes hold only one-way codes, never your raw email address or IP address.</li>
            <li>Resend email logs: 30 days.</li>
          </ul>

          <h2>Your choices and rights</h2>
          <ul>
            <li><strong>Unsubscribe:</strong> use the link in any of our emails. It takes effect right away.</li>
            <li><strong>Access, correction, or deletion:</strong> email <!--email_off--><a href="mailto:customerservice@cotib.com">customerservice@cotib.com</a><!--/email_off-->. If you ask us to delete your sampler contact, we'll delete it from Resend. After that we no longer have a record that you unsubscribed, but you're still only added back if you sign up and click a new confirm link.</li>
            <li>Depending on where you live, you may have other rights over your data. Email us and we'll help.</li>
            <li><strong>Do Not Track:</strong> our pages don't change behavior based on Do Not Track signals. We don't track you across other sites.</li>
          </ul>

          <h2>Contact</h2>
          <p>COTIB LLC, 155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470, United States<br><!--email_off--><a href="mailto:customerservice@cotib.com">customerservice@cotib.com</a><!--/email_off--></p>

          <h2>Changes</h2>
          <p>Effective October 29, 2026.</p>
          <p>We post any update to this notice on this page with a new effective date. Material changes apply only to information collected after that date.</p>

          <p>A COTIB LLC product.</p>
        </article>
      </div>
    </section>`,
});

fs.mkdirSync(path.join(WWW, 'do-the-next-thing'), { recursive: true });
fs.writeFileSync(path.join(WWW, 'do-the-next-thing.html'), landing);
fs.writeFileSync(path.join(WWW, 'do-the-next-thing', 'privacy.html'), privacy);
console.log('wrote www/do-the-next-thing.html and www/do-the-next-thing/privacy.html');
