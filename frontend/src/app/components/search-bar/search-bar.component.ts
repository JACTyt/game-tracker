import { Component, output, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SearchMode = 'filter' | 'semantic';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  mode = input<SearchMode>('filter');
  loading = input<boolean>(false);
  aiEnabled = input<boolean>(false);

  searched = output<{ query: string; mode: SearchMode }>();
  modeChanged = output<SearchMode>();

  query = '';

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
