# websites

Mono-repo containing all web properties owned and operated by COTIB LLC and its associated brands. Each subdirectory is an independent project with its own stack, deployment target, and purpose.

---

## Projects

| Directory | Domain | Stack | Description |
|---|---|---|---|
| `betacrt.com/` | betacrt.com | Python, HTML | NAS educational media index generator and output |
| `corporate-hardcore/` | corphardcore.com | Next.js 16, React 18, Tailwind, TypeScript | Corporate Hardcore brand website — observational satire for corporate lifers |
| `cotib.com/` | cotib.com | Static HTML, Bootstrap, Vercel | COTIB LLC corporate website with serverless contact API |
| `cotibgen.click/` | cotibgen.click | Terraform, AWS (S3 + CloudFront) | Infrastructure-as-code for static site hosting |
| `earned-escape/` | earnedescape.agency | Node.js, Express, Nunjucks, Vercel | Earned Escape travel advisory brand website |
| `techleadshift/` | techleadshift.com | Next.js 16, React 19, Tailwind v4, TypeScript | Tech Lead Shift leadership series landing page |
| `templates/` | — | HTML, JavaScript | Reusable website templates and UI prototypes |
| `TheITXP/` | theitxp.com | Next.js 16, React 19, Tailwind v4, TypeScript | The IT XP podcast website |

---

## Brand Overview

**COTIB LLC** is a New York City-based technology consulting and content creation company. This repo houses:

- **Corporate website** (`cotib.com`) — technology consulting services for public and private sector
- **The IT XP** (`TheITXP/`) — podcast for experienced IT professionals; hosted by Chuck Betancourt
- **Corporate Hardcore** (`corporate-hardcore/`) — observational satire brand documenting corporate culture
- **Tech Lead Shift** (`techleadshift/`) — research-backed leadership series on managing hybrid AI/human teams
- **Earned Escape** (`earned-escape/`) — travel advisory brand (COTIB Adventures LLC)

---

## Common Stack Patterns

- **Next.js sites**: `npm install` → `npm run dev` (port 3000) → deploy to Vercel
- **Static HTML sites**: open `index.html` directly or `vercel dev` for API routes
- **Terraform**: `terraform init` → `terraform plan` → `terraform apply`

---

## Environment Variables

Each project with a `.env.example` file requires a `.env.local` before running locally. See the individual project README for required variables.
