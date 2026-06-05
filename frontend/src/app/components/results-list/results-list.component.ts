import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResult, ExtractedFilters } from '../../models/search.model';
import { ResultCardComponent } from '../result-card/result-card.component';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [CommonModule, ResultCardComponent],
  templateUrl: './results-list.component.html',
})
export class ResultsListComponent {
  results = input<GameResult[]>([]);
  extractedFilters = input<ExtractedFilters | null>(null);
  loading = input<boolean>(false);
  hasSearched = input<boolean>(false);
}
