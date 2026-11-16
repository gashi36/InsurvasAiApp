import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// Keeps the login token for this browser tab.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  base = 'https://insurvasaiapp.onrender.com';  // backend address; use your Render URL when deployed

  get token(): string | null { return sessionStorage.getItem('token'); }
  loggedIn(): boolean { return !!this.token; }

  // Sends the credentials, stores the token. Throws if they are wrong.
  async login(username: string, password: string) {
    const r: any = await firstValueFrom(this.http.post(this.base + '/login', { username, password }));
    sessionStorage.setItem('token', r.token);
  }

  // Forgets the token and returns to the login page.
  logout() { sessionStorage.removeItem('token'); this.router.navigate(['/login']); }
}
