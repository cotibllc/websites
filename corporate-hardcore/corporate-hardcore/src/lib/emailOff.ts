// Cloudflare Email Address Obfuscation rewrites any address it finds in HTML
// into "[email protected]" unless it sits between these comment markers. JSX
// drops HTML comments, so the markers have to go in as raw HTML.
// https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function emailOffMailtoHtml(email: string, className?: string): string {
  const e = escapeHtml(email);
  const cls = className ? ` class="${escapeHtml(className)}"` : "";
  return `<!--email_off--><a href="mailto:${e}"${cls}>${e}</a><!--/email_off-->`;
}
