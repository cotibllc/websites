import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-main border-t border-border-light">
      <div className="mx-auto content-max px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary">
        <p>© 2025 Corporate Hardcore · Circle back. Never return.</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <Link href="/privacy" className="hover:text-text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-text-primary">Terms</Link>
          <Link href="/contact" className="hover:text-text-primary">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
