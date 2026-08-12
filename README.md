# Wedding Website

Guest-facing wedding website + admin panel + multilingual voice chatbot.

See `Wedding_Website_Master_Plan.docx` (in the parent planning folder) for the full feature plan and tech stack.

## Branching model

- `main` — production (what's deployed live). Protected: PRs only, 1 required approval, enforced for everyone including repo admins.
- `dev` — integration branch for work in progress. Protected the same way as `main`.
- `feature/<name>` — one branch per feature/experiment, branched off `dev`. Opened as a PR back into `dev` when ready.

Flow: `feature/*` → PR into `dev` (1 approval required) → PR from `dev` into `main` (1 approval required) when ready to release.
