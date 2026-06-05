# 🎮 GameTrace
### *Find the game you can't remember — by describing it.*

GameTrace is a semantic search engine for video games. Instead of typing a title, you describe what you remember — the setting, the mechanics, the vibe, a character — and the system figures out what game you're thinking of.

It's not a recommendation engine. It's a **memory reconstruction engine**.

---

## The Problem

Traditional search engines fail when you don't know what you're looking for.

You might remember:
- *"A game where you explore a ruined futuristic city, hack robots, and there's a lot of rain..."*
- *"A turn-based RPG from around 2010 with time travel and multiple endings"*
- *"That horror game on PS2 with dark corridors and a foggy town"*

Keyword search breaks on all of these. GameTrace doesn't.

---

## How It Works

GameTrace uses a semantic matching pipeline that understands *meaning*, not just words:

```
User query
   ↓
Text normalization & expansion
   ↓
Embedding model (semantic encoding)
   ↓
Vector database search
   ↓
Candidate retrieval (top 50–100)
   ↓
Reranking model (context + metadata fusion)
   ↓
Final results (top 5–10) with confidence scores
```

---

## Features

### Natural Language Search
Write anything you remember — plot fragments, gameplay mechanics, visual descriptions, mood, era, platform. GameTrace interprets your query semantically.

**Example:**
> *"Open world game where you're a Viking and there's brutal melee combat with shields and axes, Norse mythology"*

→ `God of War: Ragnarök` — 91% match  
→ `Assassin's Creed Valhalla` — 78% match  
→ `Hellblade: Senua's Sacrifice` — 61% match

---

### Confidence Scoring with Explanations

Every result includes a breakdown of *why* it matched:

```
God of War: Ragnarök — 91% match

Matched signals:
  ✓ Open world exploration
  ✓ Viking / Norse setting
  ✓ Melee combat with shields
  ✓ Mythology-driven story
  ✓ Release window consistent with query
```

---

### Multi-Type Query Understanding

GameTrace classifies your query by intent before searching:

| Intent type | Example query |
|---|---|
| 🗺️ Setting / world | *"post-apocalyptic desert with sandstorms"* |
| ⚔️ Gameplay mechanic | *"turn-based combat with cover system"* |
| 👤 Character search | *"silent protagonist with a sword and amnesia"* |
| 📖 Story / plot | *"game where the twist is you're the villain"* |
| 🎨 Visual / mood | *"dark, rainy cyberpunk city, neon signs"* |

---

### Partial Memory Recovery Mode

Vague and incomplete queries are handled gracefully:

> *"I think it was on PS2, maybe horror, dark corridors…"*

Returns:
- Silent Hill series
- Fatal Frame series  
- Resident Evil classics

---

### Screenshot Search *(optional extension)*

Upload a screenshot, gameplay clip thumbnail, or character image. GameTrace extracts visual embeddings and matches them against known game assets.

---

### Clustered Results

Results are grouped by category rather than presented as a flat list:

```
Possible matches:

  Group A — Horror / Survival Horror
    ├─ Silent Hill 2 (88%)
    └─ Amnesia: The Dark Descent (74%)

  Group B — Action RPG
    ├─ Dark Souls (71%)
    └─ Bloodborne (68%)
```

---

## Data Model

Each game entry combines structured metadata with a rich unstructured description for hybrid matching:

```json
{
  "title": "Disco Elysium",
  "type": "game",
  "platform": ["PC", "PS4", "PS5", "Xbox"],
  "description": "A narrative RPG set in a decaying city where you play a detective with amnesia...",
  "genres": ["RPG", "narrative", "detective"],
  "themes": ["politics", "memory", "identity", "noir"],
  "mechanics": ["dialogue", "skill checks", "open world"],
  "year": 2019,
  "developer": "ZA/UM",
  "tags": ["amnesia", "detective", "isometric", "dystopia"]
}
```

Matching combines:
- Embedding cosine similarity
- Tag overlap score
- Genre alignment
- Temporal hints (year / platform / era)

---

## Architecture

**Backend**
- FastAPI (REST API)

**AI / Embedding Layer**
- Embedding model: OpenAI `text-embedding-3-large` / BGE / E5 (configurable)
- Optional reranker: cross-encoder model for result reranking

**Vector Database**
- Qdrant or Weaviate (configurable)

**Data Sources**
- IGDB API (metadata)
- Steam API (PC game data)
- Curated game descriptions dataset
- Optional scraping pipeline for extended coverage

---

## Why GameTrace?

Most game discovery tools answer: *"What should I play next?"*

GameTrace answers a different question: *"What was that game I played years ago?"*

That distinction makes it genuinely useful in a different way — and technically interesting as a project, demonstrating:

- Semantic search with vector embeddings
- Hybrid retrieval (dense + metadata)
- RAG-style candidate ranking
- Real-world UX problem solving
- Multi-signal confidence scoring

---

## Project Status

> 🚧 In development

| Component | Status |
|---|---|
| Dataset pipeline | 🔄 In progress |
| Embedding + vector search | 🔄 In progress |
| API layer | 📋 Planned |
| Frontend | 📋 Planned |
| Screenshot search | 💡 Stretch goal |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/gametrace.git
cd gametrace

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your IGDB / OpenAI API keys

# Run the API
uvicorn app.main:app --reload
```

---

## License

MIT
