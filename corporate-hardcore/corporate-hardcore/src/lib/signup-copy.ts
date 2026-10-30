// Every message /api/subscribe can send back to the Field Notes and merch
// signup forms. One sentence each, no dashes.
export const SIGNUP_ERRORS = {
  badJson: "Request could not be read. Refresh the page.",
  invalidEmail: "Please enter a valid email address.",
  rateLimited: "Request volume exceeds approved limits. Try again in a few minutes.",
  notConfigured: "Signup is not accepting requests on our end right now.",
  noToken: "Verification is required. Wait for the check to show Success.",
  expired: "The verification timed out. Wait for it to show Success again.",
  failed: "Verification failed. Refresh the page and try again.",
  unreachable: "We couldn't reach the verification check just now. Try again in a minute.",
} as const;

export type SignupErrorCode = keyof typeof SIGNUP_ERRORS;
