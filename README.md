# Wedding Website

Guest-facing wedding website + admin panel + multilingual voice chatbot.

See `Wedding_Website_Master_Plan.docx` (in the parent planning folder) for the full feature plan and tech stack.

## Branching model

- `main` — production (what's deployed live). PR-only: merges from `dev` require 1 approval, enforced for everyone including repo admins.
- `dev` — integration branch for work in progress. Feature branches merge here directly, no PR required.
- `feature/<name>` — one branch per feature/experiment, branched off `dev`. Pushed/merged straight into `dev` when ready — no review gate at this stage.

Flow: `feature/*` → merge directly into `dev` → PR from `dev` into `main` (1 approval required) when ready to release.
