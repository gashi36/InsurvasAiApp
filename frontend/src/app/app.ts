import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

// Shell: a nav bar plus the current page.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="display:flex;gap:16px;padding:12px;border-bottom:1px solid #ccc">
      <a routerLink="/">Top posts</a>
      <a routerLink="/insights">Insights</a>
      <a routerLink="/accounts">Accounts</a>
    </nav>
    <main style="padding:16px"><router-outlet /></main>`,
})
export class App { }
