"use client";

import Link from "next/link";
import { Search, Bell, UserCircle, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Synergy Corp", href: "/company" },
];

function SearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      <input
        type="search"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search articles"
        className="pl-10 pr-4 py-2 rounded-md bg-bg-main border border-border-light focus:outline-none focus:ring-2 focus:ring-linkedin-blue w-64"
      />
    </form>
  );
}

function MobileSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <Search className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      <input
        type="search"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search articles"
        className="w-full pl-10 pr-4 py-2 rounded-md bg-bg-main border border-border-light focus:outline-none focus:ring-2 focus:ring-linkedin-blue text-sm"
      />
    </form>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card-bg border-b border-border-light">
      <div className="mx-auto content-max px-4 h-nav flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded bg-linkedin-blue grid place-items-center">
            <span className="text-white font-bold text-xl tracking-tighter">CH</span>
          </div>
          <span className="font-semibold text-text-primary">Corporate&nbsp;Hardcore</span>
        </Link>

        {/* Center nav — desktop only */}
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
            <SearchForm className="relative" />
          </div>
          <button className="p-2 rounded-full hover:bg-btn-secondary hidden md:block" aria-label="Notifications">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="p-2 rounded-full hover:bg-btn-secondary hidden md:block" aria-label="Profile">
            <UserCircle className="w-5 h-5 text-text-secondary" />
          </button>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-btn-secondary"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen
              ? <X className="w-5 h-5 text-text-secondary" />
              : <Menu className="w-5 h-5 text-text-secondary" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border-light bg-card-bg px-4 pb-3 pt-2 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition
                ${pathname === l.href ? "bg-linkedin-blue text-white" : "text-text-secondary hover:bg-btn-secondary hover:text-text-primary"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="relative pt-1">
            <MobileSearchForm className="relative" />
          </div>
        </nav>
      )}
    </header>
  );
}
