import { Component, output, input } from '@angular/core';
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

  searched = output<{ query: string; mode: SearchMode }>();
  modeChanged = output<SearchMode>();

  query = '';

  onSubmit() {
    this.searched.emit({ query: this.query, mode: this.mode() });
  }

  setMode(mode: SearchMode) {
    this.modeChanged.emit(mode);
  }
}
