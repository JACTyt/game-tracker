import { Injectable, signal, computed } from '@angular/core';
import { GameResult } from '../models/search.model';

export interface SavedGame extends GameResult {
  savedAt: string;
  collections: string[];
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private readonly KEY = 'gt_vault';

  games = signal<SavedGame[]>(this.load());

  /** Sorted, de-duplicated list of every collection tag in use. */
  allCollections = computed<string[]>(() => {
    const set = new Set<string>();
    for (const g of this.games()) {
      for (const c of g.collections) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  private load(): SavedGame[] {
    try {
      const raw: SavedGame[] = JSON.parse(localStorage.getItem(this.KEY) ?? '[]');
      // Migrate saves created before collections existed.
      return raw.map(g => ({ ...g, collections: Array.isArray(g.collections) ? g.collections : [] }));
    } catch {
      return [];
    }
  }

  private persist(games: SavedGame[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(games));
    this.games.set(games);
  }

  save(game: GameResult): void {
    if (this.isSaved(game.igdb_id)) return;
    this.persist([{ ...game, savedAt: new Date().toISOString(), collections: [] }, ...this.games()]);
  }

  remove(igdbId: number): void {
    this.persist(this.games().filter(g => g.igdb_id !== igdbId));
  }

  isSaved(igdbId: number): boolean {
    return this.games().some(g => g.igdb_id === igdbId);
  }

  addTag(igdbId: number, tag: string): void {
    const clean = tag.trim();
    if (!clean) return;
    this.persist(this.games().map(g =>
      g.igdb_id === igdbId && !g.collections.includes(clean)
        ? { ...g, collections: [...g.collections, clean] }
        : g
    ));
  }

  removeTag(igdbId: number, tag: string): void {
    this.persist(this.games().map(g =>
      g.igdb_id === igdbId
        ? { ...g, collections: g.collections.filter(c => c !== tag) }
        : g
    ));
  }
}
