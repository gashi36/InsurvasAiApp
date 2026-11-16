import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

// Manage tracked channels and run the pipeline steps with buttons.
@Component({
  selector: 'app-accounts',
  imports: [FormsModule],
  template: `
  <h2>Accounts</h2>

  <!-- Add a channel: Enter key also submits -->
  <div class="row">
    <input [(ngModel)]="handle" placeholder="@handle" (keyup.enter)="add()">
    <select [(ngModel)]="type">
      <option value="agent">Agent</option>
      <option value="agency">Agency</option>
    </select>
    <select [(ngModel)]="platform">
      <option value="youtube">YouTube</option>
    </select>
    <button (click)="add()" [disabled]="busy || !handle.trim()">Add</button>
  </div>

  <!-- Pipeline steps -->
  <div class="row">
    <button (click)="run('mutation{scoreAll}')" [disabled]="busy">Score all</button>
    <button (click)="run('mutation{labelPosts(take:5)}')" [disabled]="busy">Label next 5</button>
    @if (busy) { <span class="muted">Working…</span> }
  </div>

  @if (msg) { <p [class]="isError ? 'error' : 'ok'">{{ msg }}</p> }

  @if (accounts.length === 0) {
    <p class="muted">No accounts yet. Add a YouTube handle above to start.</p>
  } @else {
    <table>
      <tr><th>Handle</th><th>Name</th><th>Followers</th><th></th></tr>
      @for (a of accounts; track a.id) {
        <tr>
          <td>{{ a.handle }}</td>
          <td>{{ a.displayName }}</td>
          <td>{{ a.followers.toLocaleString() }}</td>
          <td class="actions">
            <button (click)="run('mutation{collectAccount(id:' + a.id + ')}')" [disabled]="busy">Collect</button>
            <button (click)="remove(a)" [disabled]="busy">Delete</button>
          </td>
        </tr>
      }
    </table>
  }`,
  styles: [`
  .row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
  table { border-collapse: collapse; width: 100%; max-width: 720px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f2f2f2; }
  .actions { white-space: nowrap; }
  .muted { color: #777; }
  .ok { color: #1a7f37; }
  .error { color: #c62828; }
`],
})
export class AccountsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  accounts: any[] = [];
  platform = 'youtube';
  handle = ''; type = 'agent'; msg = '';
  busy = false;       // true while a request is running
  isError = false;    // decides the message colour

  ngOnInit() { this.load(); }

  // Reloads the account list.
  async load() {
    this.accounts = (await this.api.gql<{ accounts: any[] }>(
      `{ accounts { id handle displayName followers } }`)).accounts;
    this.cdr.detectChanges();
  }

  // Adds a channel. The backend verifies it exists on YouTube.
  async add() {
    const ok = await this.run(
      `mutation{addAccount(handle:"${this.handle.trim()}",type:"${this.type}",platform:"${this.platform}"){id}}`);
    if (ok) this.handle = '';
  }

  // Deletes a channel and its posts, after asking for confirmation.
  async remove(a: any) {
    if (!confirm(`Delete ${a.handle} and all its posts?`)) return;
    await this.run(`mutation{deleteAccount(id:${a.id})}`);
  }

  // Runs any mutation, blocks double-clicks, shows the result or error, then refreshes the list.
  async run(query: string): Promise<boolean> {
    this.busy = true;
    try {
      this.msg = 'Done: ' + JSON.stringify(Object.values(await this.api.gql<any>(query))[0]);
      this.isError = false;
      return true;
    } catch (e: any) {
      this.msg = 'Error: ' + e.message;
      this.isError = true;
      return false;
    } finally {
      this.busy = false;
      await this.load();
    }
  }
}
