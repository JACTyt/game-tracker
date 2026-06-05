import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, SlidersHorizontal, ChevronDown } from 'lucide-angular';
import { FiltersResponse, UserFilters } from '../../models/search.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
})
export class FilterPanelComponent {
  options = input<FiltersResponse | null>(null);
  filtersChanged = output<UserFilters>();

  collapsed = signal(false);
  filters: UserFilters = { genres: [], themes: [], platforms: [] };

  readonly SlidersHorizontal = SlidersHorizontal;
  readonly ChevronDown = ChevronDown;

  toggleCollapsed() { this.collapsed.update(v => !v); }

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

  activeCount(): number {
    return (this.filters.genres?.length ?? 0) + (this.filters.platforms?.length ?? 0) + (this.filters.themes?.length ?? 0);
  }
}
