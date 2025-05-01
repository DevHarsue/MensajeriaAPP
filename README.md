# Getting Started

First, run the backend:
Create ".env" file, following the format of ".env.example",
Then:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0
```

Second, run the frontend:

```bash
cd messaging-app
pnpm install
pnpm dev
```
