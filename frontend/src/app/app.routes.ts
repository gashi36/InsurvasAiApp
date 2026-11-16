import { Routes } from '@angular/router';
import { PostsComponent } from './pages/posts.component';
import { InsightsComponent } from './pages/insights.component';
import { AccountsComponent } from './pages/accounts.component';
import { LoginComponent } from './pages/login.component';
import { authGuard } from './auth.guard';

// URL -> page. Everything except /login needs a login.
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: PostsComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [authGuard] },
  { path: 'insights', component: InsightsComponent, canActivate: [authGuard] },
];
