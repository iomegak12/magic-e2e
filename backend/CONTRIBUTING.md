# Contributing

Thanks for considering a contribution!

## Local setup

```powershell
git clone <repo>
cd <repo>
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[backend]"
cd backend
copy .env.example .env
```

## Running locally

```powershell
python backend\server.py
```

## Code style

- Python 3.12+, type hints encouraged.
- Keep modules small and single-purpose; the `app/` package is intentionally split by concern (`core`, `tools`, `middleware`, `history`, `agent`, `api/v1`).
- Do not commit `.env`, `*.db`, or `logs/`.

## Pull requests

1. Branch from `main`.
2. Keep changes scoped — prefer many small PRs over one large one.
3. Update `CHANGELOG.md` under the **Unreleased** section.
4. If you add a new endpoint, update `README.md` and the OpenAPI tags.
5. Verify the server boots and `/health`, `/info`, `/chat` work locally before opening the PR.
