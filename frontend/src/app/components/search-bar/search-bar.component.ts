import { Component, output, input, effect, ElementRef, ViewChild } from '@angular/core';
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
  queryValue = input<string>('');

  searched = output<{ query: string; mode: SearchMode }>();
  modeChanged = output<SearchMode>();

  query = '';

  @ViewChild('textarea') textareaRef?: ElementRef<HTMLTextAreaElement>;

  readonly SlidersHorizontal = SlidersHorizontal;
  readonly Sparkles = Sparkles;
  readonly Search = Search;

  constructor() {
    effect(() => {
      if (!this.aiEnabled() && this.mode() === 'semantic') {
        this.modeChanged.emit('filter');
      }
    });
    effect(() => {
      const val = this.queryValue();
      if (val !== undefined) {
        this.query = val;
        setTimeout(() => this.autoResize(), 0);
      }
    });
  }

  autoResize() {
    const el = this.textareaRef?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  onInput() {
    this.autoResize();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit() {
    this.searched.emit({ query: this.query, mode: this.mode() });
  }

  setMode(mode: SearchMode) {
    this.modeChanged.emit(mode);
  }
}
