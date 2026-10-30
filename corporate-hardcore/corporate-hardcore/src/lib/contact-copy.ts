// Copy for the help desk contact form (/contact and /about), shared by the
// route and the form. The form shows "<message> Try again or email ...", so
// every message is one sentence ending in a period (see errorSentence).
export const CONTACT_ERRORS = {
  notConfigured: "Contact form is not configured.",
  badJson: "The ticket couldn't be read. Refresh the page.",
  missingFields: "Missing required fields.",
  noToken: "Captcha verification is required.",
  failed: "Captcha verification failed.",
  config: "The help desk isn't accepting tickets on our end right now.",
  expired: "The captcha timed out. Wait for it to show Success again.",
  unreachable: "We couldn't reach the captcha check just now. Wait a minute.",
  send: "Failed to send message.",
  generic: "Transmission failed.",
} as const;

export type ContactErrorCode = keyof typeof CONTACT_ERRORS;

// One sentence, one closing period, whatever the server or network sent.
export function errorSentence(message: unknown): string {
  const m = typeof message === "string" ? message.trim().replace(/[.!?]+$/, "") : "";
  return `${m || CONTACT_ERRORS.generic.replace(/\.$/, "")}.`;
}
