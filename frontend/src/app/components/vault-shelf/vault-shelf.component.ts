import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Vault, ChevronDown, X, Tag } from 'lucide-angular';
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-vault-shelf',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './vault-shelf.component.html',
  styleUrl: './vault-shelf.component.css',
})
export class VaultShelfComponent {
  open = signal(true);
  expandedId = signal<number | null>(null);

  readonly Vault = Vault;
  readonly ChevronDown = ChevronDown;
  readonly X = X;
  readonly Tag = Tag;

  constructor(readonly vault: VaultService) {}

  toggle() { this.open.update(v => !v); }

  toggleExpand(igdbId: number) {
    this.expandedId.update(id => id === igdbId ? null : igdbId);
  }
}
