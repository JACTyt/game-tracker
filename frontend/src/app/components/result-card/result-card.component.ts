import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Tag, Monitor, Star, Check } from 'lucide-angular';
import { GameResult } from '../../models/search.model';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.css',
})
export class ResultCardComponent {
  game = input.required<GameResult>();

  readonly Calendar = Calendar;
  readonly Tag = Tag;
  readonly Monitor = Monitor;
  readonly Star = Star;
  readonly Check = Check;
}
