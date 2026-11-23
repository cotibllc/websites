/**
 * The one subscribe ask on the site: the Field Notes distribution list
 * (DistributionList.tsx on the home page, Kit form 9272877 via /api/subscribe).
 * The top bar on every page and step 5 of /start-here both point here, so the
 * copy and destination live in one place.
 */
export const SUBSCRIBE_ANCHOR_ID = "distribution-list";
export const SUBSCRIBE_HREF = `/#${SUBSCRIBE_ANCHOR_ID}`;

export const SUBSCRIBE_ASK = {
  label: "NOTICE",
  line: "Field Notes are filed monthly. Distribution is open to all staff.",
  link: "Add me to distribution",
} as const;
