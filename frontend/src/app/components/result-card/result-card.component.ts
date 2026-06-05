import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Calendar, Tag, Monitor, Star, Check, ChevronDown, Vault, X,
  ExternalLink, Play, Trophy, Users, Cpu, Globe, Shield,
} from 'lucide-angular';
import { GameResult, GameAgeRating } from '../../models/search.model';
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
  readonly ExternalLink = ExternalLink;
  readonly Play = Play;
  readonly Trophy = Trophy;
  readonly Users = Users;
  readonly Cpu = Cpu;
  readonly Globe = Globe;
  readonly Shield = Shield;

  private readonly WEBSITE_LABELS: Record<number, string> = {
    1: 'Official', 2: 'Wikia', 3: 'Wikipedia', 4: 'Facebook', 5: 'Twitter',
    6: 'Twitch', 8: 'Instagram', 9: 'YouTube', 10: 'App Store', 11: 'iPad',
    12: 'Android', 13: 'Steam', 14: 'Reddit', 15: 'itch.io',
    16: 'Epic Games', 17: 'GOG', 18: 'Discord',
  };

  private readonly ESRB: Record<number, string> = {
    6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO',
  };

  private readonly PEGI: Record<number, string> = {
    1: 'PEGI 3', 2: 'PEGI 7', 3: 'PEGI 12', 4: 'PEGI 16', 5: 'PEGI 18',
  };

  private readonly AGE_CATEGORIES: Record<number, string> = {
    1: 'ESRB', 2: 'PEGI', 3: 'CERO', 4: 'USK', 5: 'GRAC', 6: 'CLASS IND', 7: 'ACB',
  };

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

  websiteLabel(category: number): string {
    return this.WEBSITE_LABELS[category] ?? 'Website';
  }

  formatAgeRating(ar: GameAgeRating): string {
    if (ar.category === 1) return `ESRB ${this.ESRB[ar.rating] ?? ar.rating}`;
    if (ar.category === 2) return this.PEGI[ar.rating] ?? `PEGI ${ar.rating}`;
    return `${this.AGE_CATEGORIES[ar.category] ?? ar.category} ${ar.rating}`;
  }

  formatCount(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }
}
