import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, SlidersHorizontal, ChevronDown, Tag, Gamepad2, Palette, Calendar, RotateCcw, LucideIconData } from 'lucide-angular';
import { FiltersResponse, FilterOption, UserFilters } from '../../models/search.model';

type GroupKey = 'genres' | 'themes' | 'platforms';

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
  groupOpen = signal<Record<GroupKey, boolean>>({ genres: true, platforms: false, themes: false });
  yearsOpen = signal(false);
  filters: UserFilters = { genres: [], themes: [], platforms: [] };

  readonly SlidersHorizontal = SlidersHorizontal;
  readonly ChevronDown = ChevronDown;
  readonly Calendar = Calendar;
  readonly RotateCcw = RotateCcw;

  readonly groups: { key: GroupKey; label: string; icon: LucideIconData }[] = [
    { key: 'genres', label: 'Genres', icon: Tag },
    { key: 'platforms', label: 'Platforms', icon: Gamepad2 },
    { key: 'themes', label: 'Themes', icon: Palette },
  ];

  toggleCollapsed() { this.collapsed.update(v => !v); }

  toggleGroup(key: GroupKey) {
    this.groupOpen.update(s => ({ ...s, [key]: !s[key] }));
  }

  groupItems(key: GroupKey): FilterOption[] {
    return this.options()?.[key] ?? [];
  }

  toggleItem(field: GroupKey, name: string) {
    const list = this.filters[field] ?? [];
    const idx = list.indexOf(name);
    this.filters = {
      ...this.filters,
      [field]: idx > -1 ? list.filter(i => i !== name) : [...list, name],
    };
    this.filtersChanged.emit(this.filters);
  }

  isActive(field: GroupKey, name: string): boolean {
    return (this.filters[field] ?? []).includes(name);
  }

  selectedCount(field: GroupKey): number {
    return (this.filters[field] ?? []).length;
  }

  toggleYears() { this.yearsOpen.update(v => !v); }

  yearActive(): boolean {
    return this.filters.year_min != null || this.filters.year_max != null;
  }

  setYear(which: 'min' | 'max', value: string) {
    const n = value ? parseInt(value, 10) : NaN;
    const key = which === 'min' ? 'year_min' : 'year_max';
    this.filters = { ...this.filters, [key]: Number.isFinite(n) ? n : undefined };
    this.filtersChanged.emit(this.filters);
  }

  hasAnyFilter(): boolean {
    return this.activeCount() > 0;
  }

  clearAll(event: Event) {
    event.stopPropagation();
    this.filters = { genres: [], themes: [], platforms: [] };
    this.filtersChanged.emit(this.filters);
  }

  activeCount(): number {
    return this.selectedCount('genres') + this.selectedCount('platforms')
      + this.selectedCount('themes') + (this.yearActive() ? 1 : 0);
  }
}
