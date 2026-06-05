# GameVault

**Find the game you can't remember — by describing it.**

GameVault is a video game search engine with two modes: a structured **filter search** powered by the IGDB database, and an **AI semantic search** that lets you describe a game in plain language and have GPT-4o figure out what you're thinking of.

Bring your own API keys — no credentials are stored server-side.

---

## How It Works

### Filter Search
Type a title or keyword and narrow results by genre, platform, theme, and release year. Filters load from IGDB and are applied in combination.

### AI / Semantic Search (requires OpenAI key)
Describe the game in natural language:

> *"A game character with blue hair who can blink through time and uses two pistols"*

GPT-4o extracts structured filters (genre, platform, year range, themes) **and** attempts to identify the specific game title from character names, abilities, or story details. Results are scored 0–100 and ranked by how well they match your description.

---

## Features

- **Two search modes** — filter-based and AI semantic, switchable per query
- **Rich game cards** — expand any result to see:
  - Full summary and storyline
  - User rating and critic rating (from IGDB)
  - Developer, publisher, supporting studios
  - Game modes, player perspectives, game engine
  - Series and franchise
  - Genres, themes, platforms
  - Alternative titles and keywords
  - Supported languages
  - Age ratings (ESRB, PEGI, etc.)
  - External links (Steam, GOG, Epic, Official, Wikipedia, Reddit, …)
  - YouTube trailer thumbnail
  - Release date and last updated date
- **Vault** — save confirmed games locally; click a vault card to expand its full description
- **Recent searches** — last 8 searches stored in the browser; click to restore query and mode into the input field
- **Collapsible filter panel** — shows active filter count when collapsed
- **Multiline search input** — auto-resizes as you type; Shift+Enter for newlines, Enter to search
- **All data is local** — vault and search history use `localStorage`, no account needed

---

## Credentials

GameVault uses no server-side credential storage. API keys are saved in your browser's `localStorage` and sent as request headers on each call.

| Key | Where to get it | Required |
|-----|----------------|----------|
| IGDB Client ID | [Twitch Developer Console](https://dev.twitch.tv/console) → Register app | Yes |
| IGDB Client Secret | Same app in Twitch Developer Console | Yes |
| OpenAI API Key | [platform.openai.com](https://platform.openai.com/api-keys) | No — enables AI search |

Without an OpenAI key, the app works in filter-only mode using IGDB's text search as a fallback.

---

## Tech Stack

### Frontend
- **Angular 18** — standalone components, signals (`signal`, `computed`, `effect`), `@if`/`@for` control flow
- **lucide-angular** — icon library
- Deployed on **Vercel** (SPA with `rewrites` to `index.html`)

### Backend
- **FastAPI** (Python 3.12) with **Pydantic v2** models
- **httpx** for IGDB API calls
- **openai** SDK — `gpt-4o` for filter extraction (`beta.chat.completions.parse`) and result scoring
- In-memory **TTL cache** for IGDB OAuth tokens, genres, platforms, themes
- Deployed on **Railway** via Docker

### External APIs
- **IGDB** (via Twitch OAuth) — game search, metadata, covers, ratings, companies, trailers, websites
- **OpenAI GPT-4o** — structured filter extraction + 0–100 relevance scoring

---

## Project Structure

```
game-trace/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS config
│   │   ├── cache.py                # TTL cache (tokens, lookups)
│   │   ├── models/
│   │   │   └── search.py           # Pydantic models (GameResult, SearchRequest, …)
│   │   ├── routes/
│   │   │   ├── search.py           # POST /search
│   │   │   ├── filters.py          # GET /filters (genres/platforms/themes)
│   │   │   └── health.py           # GET /health
│   │   └── services/
│   │       ├── igdb.py             # IGDB API client
│   │       ├── openai_service.py   # GPT-4o extraction + scoring
│   │       └── search.py           # Search orchestration
│   ├── tests/
│   ├── requirements.txt
│   └── railway.toml
├── frontend/
│   └── src/app/
│       ├── components/
│       │   ├── search-bar/         # Mode toggle + textarea input
│       │   ├── filter-panel/       # Collapsible genre/platform/theme filters
│       │   ├── result-card/        # Expandable game card
│       │   ├── results-list/       # Results grid
│       │   ├── vault-shelf/        # Saved games shelf
│       │   ├── recent-searches/    # Search history chips
│       │   └── settings-panel/     # API key configuration
│       ├── models/
│       │   └── search.model.ts     # TypeScript interfaces
│       └── services/
│           ├── search.service.ts   # HTTP calls to backend
│           ├── credentials.service.ts  # localStorage key management
│           ├── vault.service.ts    # Saved games (localStorage)
│           └── search-history.service.ts  # Recent searches (localStorage)
├── Dockerfile.backend              # Multi-stage build for Railway
└── README.md
```

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend reads `FRONTEND_URL` from the environment for CORS (defaults to `http://localhost:4200`). No `.env` file is required — credentials come from request headers.

### Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200` and enter your IGDB credentials in the settings panel.

---

## Deployment

### Backend → Railway

The repo root contains `Dockerfile.backend` and `backend/railway.toml`. Railway builds the Docker image, runs `uvicorn` on `$PORT`, and exposes `/health` for the healthcheck.

Set one environment variable in Railway:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | Your Vercel deployment URL (comma-separated for multiple) |

### Frontend → Vercel

`frontend/vercel.json` sets the build command, output directory, and SPA rewrites. Connect the repo in Vercel and set the root directory to `frontend`.

---

## API Reference

### `POST /search`

Headers: `X-IGDB-Client-Id`, `X-IGDB-Client-Secret`, `X-OpenAI-Key` (optional)

```json
{
  "query": "dark fantasy RPG with a morality system",
  "mode": "semantic",
  "filters": {
    "genres": ["Role-playing (RPG)"],
    "platforms": [],
    "year_min": 2000,
    "year_max": 2015
  },
  "limit": 10
}
```

**`mode`**: `"filter"` uses IGDB search + filters; `"semantic"` additionally runs GPT-4o extraction and scoring.

### `GET /filters`

Returns available genres, platforms, and themes from IGDB (cached 24 h).

### `GET /health`

Returns `{"status": "ok"}`.

---

## License

MIT
