import { Routes } from '@angular/router';
import { PostsComponent } from './pages/posts.component';
import { InsightsComponent } from './pages/insights.component';
import { AccountsComponent } from './pages/accounts.component';

// URL -> page.
export const routes: Routes = [
  { path: '', component: PostsComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'insights', component: InsightsComponent },
];
