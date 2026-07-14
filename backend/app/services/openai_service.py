import json
from openai import OpenAI
from app.models.search import ExtractedFilters

EXTRACTION_SYSTEM_PROMPT = """You are a video game search assistant.
Extract structured search filters from the user's description of a game they remember.
Only include fields the user clearly implies — do not invent details not present in the query.
If the user mentions a platform era (e.g., "old game", "PS2 era"), infer the year_range.
For confidence: use "high" if the query is specific, "medium" if vague, "low" if very unclear.

IMPORTANT: If you can identify the specific game from character names, abilities, story details,
art style, or any distinctive feature, set game_title to the exact game name.
Examples: describing Tracer's blink ability and dual pistols → game_title = "Overwatch";
describing a plumber who jumps on mushrooms → game_title = "Super Mario Bros".
Only set game_title when you are confident — leave it null if unsure."""

SCORING_SYSTEM_PROMPT = """You are a video game expert scoring search results.
Given a user's query and a list of games, score each game 0-100 based on how well it matches.
Return a JSON object with a single key "results" containing an array.
Each item: {igdb_id, score, matched_signals, reason} where:
- matched_signals lists specific aspects that matched (short phrases),
- reason is ONE concise sentence explaining why this game matches the query."""


class OpenAIService:
    def __init__(self, api_key: str):
        self._client = OpenAI(api_key=api_key)

    def extract_filters(self, query: str) -> ExtractedFilters:
        response = self._client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": query},
            ],
            response_format=ExtractedFilters,
        )
        return response.choices[0].message.parsed

    def score_results(self, query: str, games: list[dict]) -> list[dict]:
        games_text = "\n".join(
            f"ID:{g['igdb_id']} | {g['title']} | {', '.join(g.get('genres', []))} | {g.get('summary', '')[:200]}"
            for g in games
        )
        response = self._client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SCORING_SYSTEM_PROMPT},
                {"role": "user", "content": f"Query: {query}\n\nGames:\n{games_text}"},
            ],
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        parsed = json.loads(raw)
        return parsed["results"]
