"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const current = (path: string) => (pathname === path ? ("page" as const) : undefined);

  return (
    <nav aria-label="Main">
      <Link href="/" className="nav-brand">
        Tech Lead Shift
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/" aria-current={current("/")}>
            Latest
          </Link>
        </li>
        <li>
          <Link href="/archive" aria-current={current("/archive")}>
            Archive
          </Link>
        </li>
        <li>
          <Link href="/#about">About</Link>
        </li>
        <li className="nav-subscribe">
          <Link href="/#subscribe">Subscribe</Link>
        </li>
        <li className="nav-secondary">
          <Link href="/work" aria-current={current("/work")}>
            Work
          </Link>
        </li>
      </ul>
    </nav>
  );
}
