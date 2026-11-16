import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

// Shell: a nav bar (when logged in) plus the current page.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    @if (auth.loggedIn()) {
      <nav style="display:flex;gap:16px;padding:12px;border-bottom:1px solid #ccc">
        <a routerLink="/">Top posts</a>
        <a routerLink="/insights">Insights</a>
        <a routerLink="/accounts">Accounts</a>
        <button (click)="auth.logout()" style="margin-left:auto">Log out</button>
      </nav>
    }
    <main style="padding:16px"><router-outlet /></main>`,
})
export class App {
  auth = inject(AuthService);
}
