import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersResponse, UserFilters } from '../../models/search.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
})
export class FilterPanelComponent {
  options = input<FiltersResponse | null>(null);
  filtersChanged = output<UserFilters>();

  filters: UserFilters = { genres: [], themes: [], platforms: [] };

  toggleItem(field: 'genres' | 'themes' | 'platforms', name: string) {
    const list = this.filters[field] ?? [];
    const idx = list.indexOf(name);
    this.filters = {
      ...this.filters,
      [field]: idx > -1 ? list.filter(i => i !== name) : [...list, name],
    };
    this.filtersChanged.emit(this.filters);
  }

  isActive(field: 'genres' | 'themes' | 'platforms', name: string): boolean {
    return (this.filters[field] ?? []).includes(name);
  }
}
