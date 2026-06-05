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

export interface GameResult {
  igdb_id: number;
  title: string;
  cover_url?: string;
  year?: number;
  genres: string[];
  platforms: string[];
  summary?: string;
  score?: number;
  matched_signals: string[];
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
