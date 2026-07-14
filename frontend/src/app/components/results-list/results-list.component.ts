import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResult, ExtractedFilters } from '../../models/search.model';
import { ResultCardComponent } from '../result-card/result-card.component';

export type SortKey =
  | 'relevance'
  | 'user_rating'
  | 'critic_rating'
  | 'year_desc'
  | 'year_asc'
  | 'title';

interface SortOption { key: SortKey; label: string; }

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule, ResultCardComponent],
  templateUrl: './results-list.component.html',
  styleUrl: './results-list.component.css',
})
export class ResultsListComponent {
  results = input<GameResult[]>([]);
  extractedFilters = input<ExtractedFilters | null>(null);
  loading = input<boolean>(false);
  hasSearched = input<boolean>(false);
  aiEnabled = input<boolean>(false);

  moreLikeThis = output<GameResult>();

  sortBy = signal<SortKey>('relevance');

  readonly sortOptions: SortOption[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'user_rating', label: 'User rating' },
    { key: 'critic_rating', label: 'Critic rating' },
    { key: 'year_desc', label: 'Year (new→old)' },
    { key: 'year_asc', label: 'Year (old→new)' },
    { key: 'title', label: 'Title (A–Z)' },
  ];

  // Sorted view of the results. Relevance preserves the backend order;
  // other keys sort a *copy* so the source input is never mutated.
  displayResults = computed<GameResult[]>(() => {
    const list = [...this.results()];
    const key = this.sortBy();
    if (key === 'relevance') return list;

    const numDesc = (a?: number, b?: number) => (b ?? -Infinity) - (a ?? -Infinity);
    const numAsc = (a?: number, b?: number) => (a ?? Infinity) - (b ?? Infinity);

    switch (key) {
      case 'user_rating':
        return list.sort((a, b) => numDesc(a.user_rating, b.user_rating));
      case 'critic_rating':
        return list.sort((a, b) => numDesc(a.critic_rating, b.critic_rating));
      case 'year_desc':
        return list.sort((a, b) => numDesc(a.year, b.year));
      case 'year_asc':
        return list.sort((a, b) => numAsc(a.year, b.year));
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  });

  onSortChange(value: string) {
    this.sortBy.set(value as SortKey);
  }
}
