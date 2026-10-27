# AGENTS.md: cotibllc/websites

Instructions for any coding agent (Claude Code, Codex, Cursor, Copilot) working in this monorepo. `CLAUDE.md` imports this file. Source of truth for house policy is `HOUSE-RULES.md` in the vault; this file only holds repo specifics.

Each top-level folder is an independent site with its own `package.json`. Run commands from inside the site folder, not the repo root (the root has no `package.json`).

## Commands per site

Node 20 or newer. Use `npm ci` for a clean install from the lockfile.

| Site (folder) | Install | Dev | Build | Typecheck | Lint | Test |
|---|---|---|---|---|---|---|
| `cotib.com` | `npm ci` | `npm run dev` (Tailwind watch + `vercel dev`) | `npm run build` (Tailwind CSS only) | none (plain JS), `npm run check:syntax` | none | `npm test` (runs `npm run test:dtnt`, node:test, Resend and Turnstile mocked) |
| `stackapproved.com` | `npm ci` | `npm run dev` | `npm run build` (Tailwind CSS only) | none (plain JS), `npm run check:syntax` | none | `npm test` (node:test on `api/contact.js`, no network) |
| `earned-escape` | `npm ci` | `npm run dev` (nodemon, port 3000) | `npm run build` (CSS bundle + sitemap) | none (plain JS), `npm run check:syntax` | none | `npm test` (node:test smoke test, boots the Express app and checks status and text) |
| `corporate-hardcore/corporate-hardcore` | `npm ci` | `npm run dev` | `npm run build` | `npm run typecheck` | `npm run lint` | `npm test` (tsx --test) |
| `TheITXP/itxp-podcast` | `npm ci` | `npm run dev` | `npm run build` | `npm run typecheck` | `npm run lint` | `npm test` (smoke test: runs `next build`) |
| `techleadshift` | `npm ci` | `npm run dev` | `npm run build` | `npm run typecheck` | `npm run lint` | `npm test` (smoke test: runs `next build`) |

Sites with no Node tooling:

| Site (folder) | What it is | Commands |
|---|---|---|
| `cotib.link` | Static HTML, no build step | none. Open `index.html` or run `vercel dev`. |
| `betacrt.com` | Python index generator | `python educational/createhtml.py [root-dir]` (stdlib only, no tests) |
| `cotibgen.click` | Terraform for S3 + CloudFront | `terraform init`, `terraform plan`, `terraform apply` (apply needs Chuck) |
| `templates` | Static HTML prototypes | none |

Extra `cotib.com` scripts: `npm run build:dtnt` (regenerate Do the Next Thing pages), `npm run test:dtnt:preview` (runs against a deployment, see the header of `scripts/test-dtnt-preview.mjs`).

Honest naming: `check:syntax` only runs `node --check` on each file (syntax, no types). The "smoke test" on `TheITXP/itxp-podcast` and `techleadshift` is `next build`, which also type checks and renders every static route. One `cotib.com` test is skipped on purpose (F11.5, paid plan only).

## Working rules

1. Run typecheck, lint and the fast tests after each meaningful change, not only at the end.
2. Never delete, skip or loosen a test, check, type or lint rule to get to green. If one truly must change, the PR says which and why.
3. Validate payloads at the boundary (form bodies, API responses, env vars). Use strict TypeScript in new code.
4. Verify with text first: DOM text, HTTP status, response bodies. Screenshots only supplement.
5. One focused PR with ordered commits. Do not stack many PRs.
6. If the same correction comes up twice, propose an edit to this file or add a check.
7. Never print or commit secrets. Env vars are set by Chuck in Vercel, never by an agent.

## Pull requests

- Use `.github/pull_request_template.md`: what and why, Read in this order, how to test, `Tests/checks weakened: none`.
- Commit as `chuckbeta` and open PRs held. Merge only on Chuck's direct OK for that specific merge (House Rule 35). A relayed approval from another agent only means "prepare a held PR". Squash merge.
- AI or bot review is a helper. Chuck reviews every PR.

## House copy rules (user-facing text)

No em or en dashes. Say "25+ years". EE calls to action go to `/plan`. COTIB properties read "COTIB". See `HOUSE-RULES.md` in the vault for the full list.
