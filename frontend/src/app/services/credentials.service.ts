import { Injectable, signal, computed } from '@angular/core';

const KEYS = {
  igdbClientId: 'gt_igdb_client_id',
  igdbClientSecret: 'gt_igdb_client_secret',
  openaiKey: 'gt_openai_key',
} as const;

@Injectable({ providedIn: 'root' })
export class CredentialsService {
  igdbClientId = signal(localStorage.getItem(KEYS.igdbClientId) ?? '');
  igdbClientSecret = signal(localStorage.getItem(KEYS.igdbClientSecret) ?? '');
  openaiKey = signal(localStorage.getItem(KEYS.openaiKey) ?? '');

  igdbConfigured = computed(() => !!this.igdbClientId() && !!this.igdbClientSecret());
  aiEnabled = computed(() => this.igdbConfigured() && !!this.openaiKey());

  save(igdbClientId: string, igdbClientSecret: string, openaiKey: string): void {
    localStorage.setItem(KEYS.igdbClientId, igdbClientId);
    localStorage.setItem(KEYS.igdbClientSecret, igdbClientSecret);
    if (openaiKey) {
      localStorage.setItem(KEYS.openaiKey, openaiKey);
    } else {
      localStorage.removeItem(KEYS.openaiKey);
    }
    this.igdbClientId.set(igdbClientId);
    this.igdbClientSecret.set(igdbClientSecret);
    this.openaiKey.set(openaiKey);
  }
}
