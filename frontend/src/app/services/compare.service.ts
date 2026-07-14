import { Injectable, signal, computed } from '@angular/core';
import { GameResult } from '../models/search.model';

/**
 * Session-only store for the "compare" tray. Holds any number of games;
 * the tray/overlay scroll horizontally past what fits. Not persisted — cleared
 * on reload by design.
 */
@Injectable({ providedIn: 'root' })
export class CompareService {
  readonly games = signal<GameResult[]>([]);
  readonly count = computed(() => this.games().length);

  isInCompare(igdbId: number): boolean {
    return this.games().some(g => g.igdb_id === igdbId);
  }

  add(game: GameResult): void {
    if (this.isInCompare(game.igdb_id)) return;
    this.games.update(list => [...list, game]);
  }

  remove(igdbId: number): void {
    this.games.update(list => list.filter(g => g.igdb_id !== igdbId));
  }

  toggle(game: GameResult): void {
    if (this.isInCompare(game.igdb_id)) {
      this.remove(game.igdb_id);
    } else {
      this.add(game);
    }
  }

  clear(): void {
    this.games.set([]);
  }
}
