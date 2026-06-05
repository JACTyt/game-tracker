export interface YearRange {
  min?: number;
  max?: number;
}

export interface UserFilters {
  genres?: string[];
  themes?: string[];
  platforms?: string[];
  year_min?: number;
  year_max?: number;
}

export interface SearchRequest {
  query?: string;
  mode: 'filter' | 'semantic';
  filters?: UserFilters;
  limit?: number;
}

export interface ExtractedFilters {
  game_title?: string;
  genres: string[];
  themes: string[];
  platforms: string[];
  keywords: string[];
  year_range?: YearRange;
  confidence: string;
}

export interface GameWebsite {
  url: string;
  category: number;
}

export interface GameAgeRating {
  category: number;
  rating: number;
}

export interface GameResult {
  igdb_id: number;
  title: string;
  cover_url?: string;
  year?: number;
  release_date?: string;
  genres: string[];
  themes: string[];
  platforms: string[];
  summary?: string;
  storyline?: string;
  score?: number;
  matched_signals: string[];
  developers: string[];
  publishers: string[];
  supporting_developers: string[];
  game_modes: string[];
  player_perspectives: string[];
  series: string[];
  franchises: string[];
  game_engines: string[];
  alternative_titles: string[];
  keywords: string[];
  user_rating?: number;
  user_rating_count?: number;
  critic_rating?: number;
  critic_rating_count?: number;
  websites: GameWebsite[];
  supported_languages: string[];
  updated_date?: string;
  age_ratings: GameAgeRating[];
  trailer_id?: string;
}

export interface SearchResponse {
  results: GameResult[];
  extracted_filters?: ExtractedFilters;
  mode: string;
}

export interface FilterOption {
  id: number;
  name: string;
}

export interface FiltersResponse {
  genres: FilterOption[];
  platforms: FilterOption[];
  themes: FilterOption[];
}
