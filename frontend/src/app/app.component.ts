import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gamepad2, TriangleAlert } from 'lucide-angular';
import { SearchBarComponent, SearchMode } from './components/search-bar/search-bar.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { ResultsListComponent } from './components/results-list/results-list.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { RecentSearchesComponent } from './components/recent-searches/recent-searches.component';
import { VaultShelfComponent } from './components/vault-shelf/vault-shelf.component';
import { CompareTrayComponent } from './components/compare-tray/compare-tray.component';
import { SearchService } from './services/search.service';
import { CredentialsService } from './services/credentials.service';
import { SearchHistoryService, RecentSearch } from './services/search-history.service';
import { FiltersResponse, GameResult, ExtractedFilters, UserFilters } from './models/search.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    SearchBarComponent,
    FilterPanelComponent,
    ResultsListComponent,
    SettingsPanelComponent,
    RecentSearchesComponent,
    VaultShelfComponent,
    CompareTrayComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  mode = signal<SearchMode>('filter');
  loading = signal(false);
  hasSearched = signal(false);
  results = signal<GameResult[]>([]);
  extractedFilters = signal<ExtractedFilters | null>(null);
  filterOptions = signal<FiltersResponse | null>(null);
  activeFilters: UserFilters = {};
  searchQuery = signal('');
  errorMsg = signal<string | null>(null);

  readonly Gamepad2 = Gamepad2;
  readonly TriangleAlert = TriangleAlert;

  constructor(
    private searchService: SearchService,
    readonly searchHistory: SearchHistoryService,
    readonly credentials: CredentialsService,
  ) {
    // (Re)load filter options whenever the IGDB credentials are set or changed,
    // so fixing a bad key takes effect without a manual page reload.
    effect(() => {
      const id = this.credentials.igdbClientId();
      const secret = this.credentials.igdbClientSecret();
      if (id && secret) {
        this.loadFilters();
      } else {
        this.filterOptions.set(null);
      }
    });
  }

  private loadFilters() {
    this.searchService.getFilters().subscribe({
      next: (opts) => {
        this.filterOptions.set(opts);
        this.errorMsg.set(null);
      },
      error: (err) => {
        this.filterOptions.set(null);
        this.errorMsg.set(this.describeError(err));
      },
    });
  }

  private describeError(err: unknown): string {
    const e = err as { error?: { detail?: string }; status?: number };
    if (e?.error?.detail) return e.error.detail;
    if (e?.status === 0) return 'Cannot reach the server. Is the backend running?';
    return 'Something went wrong. Please try again.';
  }

  // Left rail holds the filters, which only exist in filter mode.
  showLeftPane(): boolean {
    return this.mode() === 'filter';
  }

  // --- Resizable panes -------------------------------------------------
  leftWidth = signal(270);
  rightWidth = signal(340);

  private resizing: 'left' | 'right' | null = null;
  private startX = 0;
  private startW = 0;

  startResize(edge: 'left' | 'right', e: MouseEvent) {
    e.preventDefault();
    this.resizing = edge;
    this.startX = e.clientX;
    this.startW = edge === 'left' ? this.leftWidth() : this.rightWidth();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private clamp(v: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, v));
  }

  private onResizeMove = (e: MouseEvent) => {
    if (!this.resizing) return;
    const dx = e.clientX - this.startX;
    if (this.resizing === 'left') {
      this.leftWidth.set(this.clamp(this.startW + dx, 180, 460));
    } else {
      this.rightWidth.set(this.clamp(this.startW - dx, 220, 560));
    }
  };

  private onResizeEnd = () => {
    this.resizing = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };

  onModeChanged(mode: SearchMode) {
    this.mode.set(mode);
    this.results.set([]);
    this.extractedFilters.set(null);
    this.hasSearched.set(false);
  }

  onFiltersChanged(filters: UserFilters) {
    this.activeFilters = filters;
  }

  onRecentSelected(item: RecentSearch) {
    this.mode.set(item.mode as SearchMode);
    this.searchQuery.set(item.query);
  }

  onMoreLikeThis(game: GameResult) {
    const genres = (game.genres ?? []).slice(0, 3).join(', ');
    const query = genres
      ? `games like "${game.title}" — similar to ${genres}`
      : `games like "${game.title}"`;
    this.mode.set('semantic');
    this.searchQuery.set(query);
    this.onSearch({ query, mode: 'semantic' });
  }

  onSearch(event: { query: string; mode: SearchMode }) {
    this.loading.set(true);
    this.results.set([]);
    this.extractedFilters.set(null);
    this.errorMsg.set(null);
    this.searchHistory.add(event.query, event.mode);

    this.searchService.search({
      query: event.query,
      mode: event.mode,
      filters: this.activeFilters,
      limit: 10,
    }).subscribe({
      next: (resp) => {
        this.results.set(resp.results);
        this.extractedFilters.set(resp.extracted_filters ?? null);
        this.loading.set(false);
        this.hasSearched.set(true);
      },
      error: (err) => {
        this.errorMsg.set(this.describeError(err));
        this.loading.set(false);
        this.hasSearched.set(true);
      },
    });
  }
}
