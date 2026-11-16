import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

// Demo login page. Enter submits.
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
  <div class="login-container">
    <div class="box">
      <h2>InsurvasAiApp login</h2>
      <input [(ngModel)]="username" placeholder="Username" (keyup.enter)="go()">
      <input [(ngModel)]="password" type="password" placeholder="Password" (keyup.enter)="go()">
      <button (click)="go()" [disabled]="busy || !username || !password">Log in</button>
      @if (error) { <p class="error">{{ error }}</p> }
    </div>
  </div>`,
  styles: [`
  .login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 300px;
  }

  h2 {
    text-align: center;
  }

  .error {
    color: #c62828;
    text-align: center;
  }
`],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  username = ''; password = ''; error = ''; busy = false;

  // Tries to log in; on success goes to the top posts page.
  async go() {
    this.busy = true;
    try {
      await this.auth.login(this.username, this.password);
      this.router.navigate(['/']);
    } catch {
      this.error = 'Wrong username or password';
    } finally {
      this.busy = false;
      this.cdr.detectChanges();
    }
  }
}
