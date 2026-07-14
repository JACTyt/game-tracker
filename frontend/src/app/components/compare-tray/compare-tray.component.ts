import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Layers, X, Trash2 } from 'lucide-angular';
import { CompareService } from '../../services/compare.service';

@Component({
  selector: 'app-compare-tray',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './compare-tray.component.html',
  styleUrl: './compare-tray.component.css',
})
export class CompareTrayComponent {
  open = signal(false);

  readonly Layers = Layers;
  readonly X = X;
  readonly Trash2 = Trash2;

  constructor(readonly compare: CompareService) {}

  openOverlay() {
    if (this.compare.count()) this.open.set(true);
  }

  closeOverlay() {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) this.closeOverlay();
  }

  clearAll() {
    this.compare.clear();
    this.closeOverlay();
  }
}
