import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, History, X } from 'lucide-angular';
import { SearchHistoryService, RecentSearch } from '../../services/search-history.service';

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.css',
})
export class RecentSearchesComponent {
  selected = output<RecentSearch>();

  readonly History = History;
  readonly X = X;

  constructor(readonly history: SearchHistoryService) {}
}
