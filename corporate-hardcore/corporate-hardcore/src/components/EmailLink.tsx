import { emailOffMailtoHtml } from "@/lib/emailOff";

// A mailto link that Cloudflare's email obfuscation leaves alone.
export default function EmailLink({ email, className }: { email: string; className?: string }) {
  return <span dangerouslySetInnerHTML={{ __html: emailOffMailtoHtml(email, className) }} />;
}
