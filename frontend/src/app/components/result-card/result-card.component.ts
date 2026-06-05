import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResult } from '../../models/search.model';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-card.component.html',
})
export class ResultCardComponent {
  game = input.required<GameResult>();
}
