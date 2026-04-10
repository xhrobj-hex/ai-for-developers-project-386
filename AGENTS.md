# Repository Guidelines

## Project Structure & Module Organization
This repository is intentionally small at the moment. The root contains [README.md](/Users/mikhaileliseev/Documents/Source/hexlet/ai-for-developers-project-386/README.md), which is the public project entry point, and `.github/workflows/`, which contains the Hexlet CI configuration and workflow notes. Treat `.github/workflows/hexlet-check.yml` as protected infrastructure: do not rename, delete, or edit it.

There is no committed application source tree yet. When adding code, keep runtime files in `src/` and place tests in `tests/` so structure remains predictable as the project grows.

## Build, Test, and Development Commands
There are no project-specific build or local test scripts in the repository yet. Current validation is driven by GitHub Actions and Hexlet after each push.

- `git status` checks your working tree before committing.
- `git log --oneline` reviews recent history and existing commit style.
- `git push origin main` triggers the remote Hexlet check workflow.

If you introduce local tooling later, document it in [README.md](/Users/mikhaileliseev/Documents/Source/hexlet/ai-for-developers-project-386/README.md) and keep command names consistent with the ecosystem you choose.

## Coding Style & Naming Conventions
Keep files and directories lowercase and descriptive. Prefer short, focused modules over large mixed-purpose files. Use 2 spaces for YAML and Markdown indentation to match the existing workflow files.

Name new Markdown docs with clear nouns such as `CONTRIBUTING.md` or `docs/setup.md`. For source files, prefer conventional names from the language or framework you add rather than custom abbreviations.

## Testing Guidelines
Automated checks currently run in GitHub Actions through the Hexlet workflow. Until a local test runner is added, treat every push as a validation step and keep changes small enough to debug from CI output.

When adding tests, mirror the source layout and use descriptive names such as `tests/auth.test.js` or `tests/user_service_test.py`.

## Commit & Pull Request Guidelines
Recent commits use short imperative subjects such as `Add README.md`. Follow the same pattern: start with a verb, keep it concise, and describe one logical change per commit.

Pull requests should include a brief summary, note any CI impact, and link the related Hexlet task or issue when applicable. If a change affects visible documentation or workflow behavior, mention it explicitly in the PR description.
