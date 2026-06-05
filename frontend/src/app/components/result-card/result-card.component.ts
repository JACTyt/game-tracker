import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Tag, Monitor, Star, Check, ChevronDown, Vault, X } from 'lucide-angular';
import { GameResult } from '../../models/search.model';
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.css',
})
export class ResultCardComponent {
  game = input.required<GameResult>();
  expanded = signal(false);

  readonly Calendar = Calendar;
  readonly Tag = Tag;
  readonly Monitor = Monitor;
  readonly Star = Star;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly Vault = Vault;
  readonly X = X;

  constructor(readonly vault: VaultService) {}

  toggle(e: Event) {
    e.stopPropagation();
    this.expanded.update(v => !v);
  }

  saveToVault(e: Event) {
    e.stopPropagation();
    this.vault.save(this.game());
  }

  removeFromVault(e: Event) {
    e.stopPropagation();
    this.vault.remove(this.game().igdb_id);
  }
}
