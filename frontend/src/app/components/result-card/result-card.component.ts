import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Calendar, Tag, Monitor, Star, Check, ChevronDown, Library, X,
  ExternalLink, Play, Trophy, Users, Cpu, Globe, Shield, Sparkles, Layers,
  Gamepad2, Smartphone,
} from 'lucide-angular';
import { GameResult, GameAgeRating } from '../../models/search.model';
import { VaultService } from '../../services/vault.service';
import { CompareService } from '../../services/compare.service';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.css',
})
export class ResultCardComponent {
  game = input.required<GameResult>();
  aiEnabled = input<boolean>(false);
  moreLikeThis = output<GameResult>();
  expanded = signal(false);

  // "Show first few, expand for the rest" state for long lists / text.
  showAllLanguages = signal(false);
  showAllAltTitles = signal(false);
  summaryExpanded = signal(false);
  private readonly PREVIEW_COUNT = 3;

  readonly Calendar = Calendar;
  readonly Tag = Tag;
  readonly Monitor = Monitor;
  readonly Star = Star;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly Library = Library;
  readonly X = X;
  readonly ExternalLink = ExternalLink;
  readonly Play = Play;
  readonly Trophy = Trophy;
  readonly Users = Users;
  readonly Cpu = Cpu;
  readonly Globe = Globe;
  readonly Shield = Shield;
  readonly Sparkles = Sparkles;
  readonly Layers = Layers;
  readonly Gamepad2 = Gamepad2;
  readonly Smartphone = Smartphone;

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

  constructor(readonly vault: VaultService, readonly compare: CompareService) {}

  toggleCompare(e: Event) {
    e.stopPropagation();
    this.compare.toggle(this.game());
  }

  toggle(e: Event) {
    e.stopPropagation();
    this.expanded.update(v => !v);
  }

  saveToVault(e: Event) {
    e.stopPropagation();
    this.vault.save(this.game());
  }

  onMoreLikeThis(e: Event) {
    e.stopPropagation();
    this.moreLikeThis.emit(this.game());
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

  visibleLanguages(): string[] {
    const l = this.game().supported_languages;
    return this.showAllLanguages() ? l : l.slice(0, this.PREVIEW_COUNT);
  }

  visibleAltTitles(): string[] {
    const a = this.game().alternative_titles;
    return this.showAllAltTitles() ? a : a.slice(0, this.PREVIEW_COUNT);
  }

  hiddenCount(total: number): number {
    return Math.max(0, total - this.PREVIEW_COUNT);
  }

  isSummaryLong(): boolean {
    return (this.game().summary?.length ?? 0) > 220;
  }

  toggleLanguages(e: Event) { e.stopPropagation(); this.showAllLanguages.update(v => !v); }
  toggleAltTitles(e: Event) { e.stopPropagation(); this.showAllAltTitles.update(v => !v); }
  toggleSummary(e: Event) { e.stopPropagation(); this.summaryExpanded.update(v => !v); }

  platformIcon(name: string) {
    const n = name.toLowerCase();
    if (/(pc|windows|mac|linux|dos|browser|web)/.test(n)) return this.Monitor;
    if (/(ios|android|iphone|ipad|mobile|phone)/.test(n)) return this.Smartphone;
    return this.Gamepad2;
  }
}
