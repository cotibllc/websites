// /gear: the Corporate Hardcore affiliate page (CH 60 day test).
// Products are Chuck's picks from the CH Gear Shortlist (Nov 3, 2026): Requisitions 1, 3 and 5.
// A slot can only be one of two shapes, so a live link can't ship without a real URL.

export type GearLink =
  | { kind: "placeholder" }
  | { kind: "affiliate"; url: string; merchant: string };

export type GearItem = {
  code: string; // requisition code shown on the page, e.g. "REQ 01"
  name: string; // in-character requisition title
  product: string; // the real product the link points at
  justification: string; // in-character line, CH voice
  link: GearLink;
};

/**
 * Explicit search flag. /gear stays noindex and out of the sitemap until this is flipped on purpose,
 * even though every slot now has a real link.
 * TODO(affiliate account): flip to true only after the affiliate tags are added and Chuck approves indexing.
 */
export const GEAR_INDEXABLE = false;

/**
 * The one place the disclosure line lives. The page renders it at the top, near the links.
 * TODO(affiliate account): confirm this wording once the affiliate account exists.
 */
export const GEAR_DISCLOSURE =
  "We may earn a commission if you buy through links on this page. It costs you nothing extra.";

// TODO(affiliate account): Chuck has no affiliate account yet, so these are plain untagged
// Amazon product links. Add the affiliate tag to each URL once the account exists.
export const gearItems: GearItem[] = [
  {
    code: "REQ 01",
    name: "Hydration Compliance Unit",
    product: "AQUAFIT 1 Gallon Water Bottle with Motivational Quotes (Clarity)",
    justification:
      "Issued to staff who were told hydration is a personal responsibility, now with hourly encouragement printed directly on the vessel.",
    link: { kind: "affiliate", url: "https://www.amazon.com/dp/B0B435SSYZ", merchant: "Amazon.com" },
  },
  {
    code: "REQ 03",
    name: "Personal Beverage Retention Vessel",
    product: "Thermos Stainless King 16 Ounce Coffee Desk Mug, Midnight Blue",
    justification: "Keeps coffee hot through the full duration of a meeting that was scheduled for thirty minutes.",
    link: { kind: "affiliate", url: "https://www.amazon.com/dp/B098RD6VL4", merchant: "Amazon.com" },
  },
  {
    code: "REQ 05",
    name: "Breakroom Ceramic Allocation",
    product: "Mr. Coffee Dorsey 4 Piece Mug Set, 18.5 oz Ceramic (assorted colors)",
    justification: "Four mugs, so the breakroom has more mugs than open headcount for the first time since the reorg.",
    link: { kind: "affiliate", url: "https://www.amazon.com/dp/B09KYJ8SPQ", merchant: "Amazon.com" },
  },
];

/** True when every slot has a real link. Drives the FILED or DRAFT status stamp. */
export function gearIsComplete(items: GearItem[] = gearItems): boolean {
  return items.length > 0 && items.every((i) => i.link.kind === "affiliate");
}

/** The page may be indexed only when the explicit flag is on and no slot is a placeholder. */
export function gearIsPublishable(items: GearItem[] = gearItems, indexable: boolean = GEAR_INDEXABLE): boolean {
  return indexable && gearIsComplete(items);
}

/** Robots metadata for /gear. */
export function gearRobots(items: GearItem[] = gearItems, indexable: boolean = GEAR_INDEXABLE) {
  return gearIsPublishable(items, indexable) ? undefined : { index: false, follow: false };
}

/** Every string a visitor reads on /gear, for copy checks. */
export function gearCopy(items: GearItem[] = gearItems): string[] {
  return [
    GEAR_DISCLOSURE,
    ...items.flatMap((i) => [i.code, i.name, i.product, i.justification, ...(i.link.kind === "affiliate" ? [i.link.merchant] : [])]),
  ];
}
