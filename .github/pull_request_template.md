## What and why

<!-- Two or three sentences: what changed and why. -->

## Read in this order

<!-- List the files or commits in the order a reviewer should read them, one line each. -->

1. `path/to/file`: what to look for

## Behavior or snapshot diffs

<!-- Paste the before/after text, payloads, or rendered output that changed. Write "none" if nothing user-visible changed. -->

## How to test

<!-- Exact steps, commands, or URLs. Assert on text and HTTP status first; screenshots only supplement. -->

```bash
cd <site>
npm ci
npm run typecheck   # if the site has it
npm run lint        # if the site has it
npm test
```

## Tests/checks weakened

Tests/checks weakened: none

<!-- If you deleted, skipped, or loosened any test, check, type, or lint rule, replace "none" with the list and say why. -->

## Merge rule

Merge only on Chuck's direct OK for this specific merge (House Rule 35). Squash merge. Agents never merge on a relayed approval. AI review is a helper, not the review.
