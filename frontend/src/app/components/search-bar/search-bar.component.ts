import { Component, output, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, SlidersHorizontal, Sparkles, Search } from 'lucide-angular';

export type SearchMode = 'filter' | 'semantic';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  mode = input<SearchMode>('filter');
  loading = input<boolean>(false);
  aiEnabled = input<boolean>(false);

  searched = output<{ query: string; mode: SearchMode }>();
  modeChanged = output<SearchMode>();

  query = '';

  readonly SlidersHorizontal = SlidersHorizontal;
  readonly Sparkles = Sparkles;
  readonly Search = Search;

  constructor() {
    effect(() => {
      if (!this.aiEnabled() && this.mode() === 'semantic') {
        this.modeChanged.emit('filter');
      }
    });
  }

  onSubmit() {
    this.searched.emit({ query: this.query, mode: this.mode() });
  }

  setMode(mode: SearchMode) {
    this.modeChanged.emit(mode);
  }
}
