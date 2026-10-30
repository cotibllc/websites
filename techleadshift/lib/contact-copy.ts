// Copy for the /work inquiry form, shared by the route and the form.
export const FALLBACK_EMAIL = "hello@techleadshift.com";

// Server error messages carry no end punctuation; the form adds it.
export const CONTACT_ERRORS = {
  notConfigured: "Contact form is not configured",
  badJson: "The form couldn't be read. Refresh the page and try again",
  missingFields: "Missing required fields",
  noToken: "Captcha verification is required",
  failed: "Captcha verification failed",
  config: "The contact form isn't working on our end right now",
  expired: "The captcha timed out. Wait for it to show Success again, then send",
  unreachable: "We couldn't reach the captcha check just now. Wait a minute and try again",
  send: "Failed to send message",
  generic: "Something went wrong",
} as const;

// "<message>. Or email hello@techleadshift.com directly." One period, whatever
// punctuation the message arrived with.
export function errorLead(message: string): string {
  const m = message.trim().replace(/[.!?]+$/, "");
  return `${m || CONTACT_ERRORS.generic}. Or email`;
}
