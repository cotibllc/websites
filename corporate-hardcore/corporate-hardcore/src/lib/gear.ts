// /gear: the Corporate Hardcore affiliate page (CH 60-day test).
// Every slot is a placeholder until CH Chief of Staff supplies real products and links.
// A slot can only be one of two shapes, so a live link can't ship without a real URL.

export type GearLink =
  | { kind: "placeholder" }
  | { kind: "affiliate"; url: string; merchant: string };

export type GearItem = {
  code: string; // requisition code shown on the page, e.g. "REQ-01"
  name: string;
  justification: string; // in-character line, CH voice
  link: GearLink;
};

export const GEAR_DISCLOSURE =
  "We may earn a commission if you buy through links on this page. It costs you nothing extra.";

export const gearItems: GearItem[] = [
  {
    code: "REQ-01",
    name: "[PLACEHOLDER] Product pending",
    justification: "[PLACEHOLDER] Justification pending. Item will be listed once approved.",
    link: { kind: "placeholder" },
  },
  {
    code: "REQ-02",
    name: "[PLACEHOLDER] Product pending",
    justification: "[PLACEHOLDER] Justification pending. Item will be listed once approved.",
    link: { kind: "placeholder" },
  },
  {
    code: "REQ-03",
    name: "[PLACEHOLDER] Product pending",
    justification: "[PLACEHOLDER] Justification pending. Item will be listed once approved.",
    link: { kind: "placeholder" },
  },
];

/** The page stays out of search and the sitemap while any slot is a placeholder. */
export function gearIsPublishable(items: GearItem[] = gearItems): boolean {
  return items.length > 0 && items.every((i) => i.link.kind === "affiliate");
}

/** Every string a visitor reads on /gear, for copy checks. */
export function gearCopy(items: GearItem[] = gearItems): string[] {
  return [GEAR_DISCLOSURE, ...items.flatMap((i) => [i.code, i.name, i.justification])];
}
