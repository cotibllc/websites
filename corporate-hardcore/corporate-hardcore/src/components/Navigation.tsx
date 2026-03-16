"use client";

import Link from "next/link";
import { Search, Bell, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-card-bg border-b border-border-light">
      <div className="mx-auto content-max px-4 h-nav flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded bg-linkedin-blue grid place-items-center">
            <span className="text-white font-bold text-xl tracking-tighter">CH</span>
          </div>
          <span className="hidden sm:block font-semibold text-text-primary">Corporate&nbsp;Hardcore</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition
                ${pathname === l.href ? "bg-linkedin-blue text-white" : "text-text-secondary hover:bg-btn-secondary hover:text-text-primary"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="search"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-2 rounded-md bg-bg-main border border-border-light focus:outline-none focus:ring-2 focus:ring-linkedin-blue w-64"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-btn-secondary" aria-label="Notifications">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 rounded-full hover:bg-btn-secondary" aria-label="Profile">
            <UserCircle className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
