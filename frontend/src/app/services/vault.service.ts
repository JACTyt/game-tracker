import { Injectable, signal } from '@angular/core';
import { GameResult } from '../models/search.model';

export interface SavedGame extends GameResult {
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private readonly KEY = 'gt_vault';

  games = signal<SavedGame[]>(this.load());

  private load(): SavedGame[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); }
    catch { return []; }
  }

  private persist(games: SavedGame[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(games));
    this.games.set(games);
  }

  save(game: GameResult): void {
    if (this.isSaved(game.igdb_id)) return;
    this.persist([{ ...game, savedAt: new Date().toISOString() }, ...this.games()]);
  }

  remove(igdbId: number): void {
    this.persist(this.games().filter(g => g.igdb_id !== igdbId));
  }

  isSaved(igdbId: number): boolean {
    return this.games().some(g => g.igdb_id === igdbId);
  }
}
