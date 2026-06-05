import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent, SearchMode } from './components/search-bar/search-bar.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { ResultsListComponent } from './components/results-list/results-list.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { SearchService } from './services/search.service';
import { CredentialsService } from './services/credentials.service';
import { FiltersResponse, GameResult, ExtractedFilters, UserFilters } from './models/search.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, FilterPanelComponent, ResultsListComponent, SettingsPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  mode = signal<SearchMode>('filter');
  loading = signal(false);
  hasSearched = signal(false);
  results = signal<GameResult[]>([]);
  extractedFilters = signal<ExtractedFilters | null>(null);
  filterOptions = signal<FiltersResponse | null>(null);
  activeFilters: UserFilters = {};

  constructor(
    private searchService: SearchService,
    readonly credentials: CredentialsService,
  ) {}

  ngOnInit() {
    if (this.credentials.igdbConfigured()) {
      this.searchService.getFilters().subscribe(opts => this.filterOptions.set(opts));
    }
  }

  onModeChanged(mode: SearchMode) {
    this.mode.set(mode);
    this.results.set([]);
    this.extractedFilters.set(null);
    this.hasSearched.set(false);
  }

  onFiltersChanged(filters: UserFilters) {
    this.activeFilters = filters;
  }

  onSearch(event: { query: string; mode: SearchMode }) {
    this.loading.set(true);
    this.results.set([]);
    this.extractedFilters.set(null);

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
      error: () => {
        this.loading.set(false);
        this.hasSearched.set(true);
      },
    });
  }
}
