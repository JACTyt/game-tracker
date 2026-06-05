import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Settings2, ChevronDown, CheckCircle2, XCircle, Minus } from 'lucide-angular';
import { CredentialsService } from '../../services/credentials.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.css',
})
export class SettingsPanelComponent implements OnInit {
  open = signal(false);
  saved = signal(false);

  igdbClientId = '';
  igdbClientSecret = '';
  openaiKey = '';

  readonly Settings2 = Settings2;
  readonly ChevronDown = ChevronDown;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly Minus = Minus;

  constructor(readonly credentials: CredentialsService) {}

  ngOnInit() {
    this.igdbClientId = this.credentials.igdbClientId();
    this.igdbClientSecret = this.credentials.igdbClientSecret();
    this.openaiKey = this.credentials.openaiKey();
    if (!this.credentials.igdbConfigured()) {
      this.open.set(true);
    }
  }

  toggle() {
    this.open.update(v => !v);
  }

  onSave() {
    this.credentials.save(this.igdbClientId.trim(), this.igdbClientSecret.trim(), this.openaiKey.trim());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
