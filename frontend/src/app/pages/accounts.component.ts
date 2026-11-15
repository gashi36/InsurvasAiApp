import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

// Manage tracked channels and run the pipeline steps with buttons.
@Component({
  selector: 'app-accounts',
  imports: [FormsModule],
  template: `
    <h2>Accounts</h2>
    <input [(ngModel)]="handle" placeholder="@handle">
    <select [(ngModel)]="type"><option>agent</option><option>agency</option></select>
    <input [(ngModel)]="platform" placeholder="platform">

    <button (click)="add()">Add</button>
    <button (click)="run('mutation{scoreAll}')">Score all</button>
    <button (click)="run('mutation{labelPosts(take:5)}')">Label next 5</button>
    <p>{{ msg }}</p>
    <table border="1" cellpadding="6">
      <tr><th>Handle</th><th>Name</th><th>Followers</th><th></th></tr>
      @for (a of accounts; track a.id) {
        <tr>
          <td>{{ a.handle }}</td><td>{{ a.displayName }}</td><td>{{ a.followers }}</td>
          <td>
            <button (click)="run('mutation{collectAccount(id:' + a.id + ')}')">Collect</button>
            <button (click)="remove(a.id)">Delete</button>
          </td>
        </tr>
      }
    </table>`,
})
export class AccountsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  accounts: any[] = [];
  platform = 'youtube';
  handle = ''; type = 'agent'; msg = '';

  ngOnInit() { this.load(); }

  // Reloads the account list.
  async load() {
    this.accounts = (await this.api.gql<{ accounts: any[] }>(
      `{ accounts { id handle displayName followers } }`)).accounts;
    this.cdr.detectChanges();
  }

  // Adds a channel. The backend verifies it exists on YouTube.
  async add() {
    await this.run(
      `mutation{addAccount(handle: "${this.handle}", type: "${this.type}", platform: "${this.platform}"){id}}`);
    this.handle = '';
  }

  // Deletes a channel and its posts.
  async remove(id: number) { await this.run(`mutation{deleteAccount(id:${id})}`); }

  // Runs any mutation, shows the result or the error, then refreshes the list.
  async run(query: string) {
    try {
      this.msg = 'Done: ' + JSON.stringify(Object.values(await this.api.gql<any>(query))[0]);
    }
    catch (e: any) {
      this.msg = 'Error: ' + e.message;
    }
    this.cdr.detectChanges();
    await this.load();
  }
}
