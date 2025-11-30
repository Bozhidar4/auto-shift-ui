import { Component, signal } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('auto-shift-ui');
}
