import { test } from "node:test";
import assert from "node:assert/strict";
import { emailOffMailtoHtml } from "./emailOff";

test("wraps a mailto link in Cloudflare email_off markers", () => {
  assert.equal(
    emailOffMailtoHtml("hello@corphardcore.com", "underline"),
    '<!--email_off--><a href="mailto:hello@corphardcore.com" class="underline">hello@corphardcore.com</a><!--/email_off-->',
  );
});

test("escapes HTML in the address and class", () => {
  assert.equal(
    emailOffMailtoHtml('a"<b>@x.com'),
    '<!--email_off--><a href="mailto:a&quot;&lt;b&gt;@x.com">a&quot;&lt;b&gt;@x.com</a><!--/email_off-->',
  );
});
