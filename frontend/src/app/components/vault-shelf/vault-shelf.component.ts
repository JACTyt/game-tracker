import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Library, ChevronDown, X, Tag, Plus, Monitor, Gamepad2, Smartphone } from 'lucide-angular';
import { VaultService, SavedGame } from '../../services/vault.service';

@Component({
  selector: 'app-vault-shelf',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './vault-shelf.component.html',
  styleUrl: './vault-shelf.component.css',
})
export class VaultShelfComponent {
  open = signal(true);
  expandedId = signal<number | null>(null);
  activeCollection = signal<string | null>(null);

  readonly Library = Library;
  readonly ChevronDown = ChevronDown;
  readonly X = X;
  readonly Tag = Tag;
  readonly Plus = Plus;

  constructor(readonly vault: VaultService) {}

  platformIcon(name: string) {
    const n = name.toLowerCase();
    if (/(pc|windows|mac|linux|dos|browser|web)/.test(n)) return Monitor;
    if (/(ios|android|iphone|ipad|mobile|phone)/.test(n)) return Smartphone;
    return Gamepad2;
  }

  filteredGames = computed<SavedGame[]>(() => {
    const col = this.activeCollection();
    const games = this.vault.games();
    return col ? games.filter(g => g.collections.includes(col)) : games;
  });

  toggle() { this.open.update(v => !v); }

  toggleExpand(igdbId: number) {
    this.expandedId.update(id => id === igdbId ? null : igdbId);
  }

  selectCollection(col: string | null) {
    this.activeCollection.set(col);
  }

  addTag(igdbId: number, input: HTMLInputElement) {
    this.vault.addTag(igdbId, input.value);
    input.value = '';
  }
}
