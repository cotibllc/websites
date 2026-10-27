import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/#home" className="nav-brand">
        Tech Lead Shift
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/#about">About</Link>
        </li>
        <li>
          <Link href="/#series">The Series</Link>
        </li>
        <li>
          <Link href="/#newsletter">Subscribe</Link>
        </li>
        <li className="nav-secondary">
          <Link href="/work">Work</Link>
        </li>
      </ul>
    </nav>
  );
}
