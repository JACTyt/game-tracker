import { Injectable, signal } from '@angular/core';

export interface RecentSearch {
  query: string;
  mode: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private readonly KEY = 'gt_search_history';
  private readonly MAX = 8;

  recent = signal<RecentSearch[]>(this.load());

  private load(): RecentSearch[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); }
    catch { return []; }
  }

  add(query: string, mode: string): void {
    if (!query.trim()) return;
    const filtered = this.recent().filter(r => r.query !== query || r.mode !== mode);
    const updated = [{ query, mode, timestamp: new Date().toISOString() }, ...filtered].slice(0, this.MAX);
    localStorage.setItem(this.KEY, JSON.stringify(updated));
    this.recent.set(updated);
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
    this.recent.set([]);
  }
}
