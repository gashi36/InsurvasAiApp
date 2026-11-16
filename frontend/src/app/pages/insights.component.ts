import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

// Who to learn from (competitors) and what works (hooks, topics).
@Component({
  selector: 'app-insights',
  template: `
  <h2>Insights</h2>
  @if (loading) { <p class="muted">Loading…</p> }
  @if (error) { <p class="error">{{ error }}</p> }

  <h3>Strongest competitors</h3>
  @if (competitors.length === 0) {
    <p class="muted">No data yet. Collect and score some accounts first.</p>
  } @else {
    <table>
      <tr><th>#</th><th>Handle</th><th>Engagement</th><th>Posts</th><th>Posts (90d)</th><th>Best post score</th></tr>
      @for (c of competitors; track c.id; let i = $index) {
        <tr>
          <td>{{ i + 1 }}</td>
          <td>{{ c.handle }}</td>
          <td>{{ c.engagement.toFixed(3) }}</td>
          <td>{{ c.posts }}</td>
          <td>{{ c.postsLast90Days }}</td>
          <td>{{ c.bestScore?.toFixed(1) ?? '-' }}</td>
        </tr>
      }
    </table>
  }

  <h3>Best hooks</h3>
  @if (hooks.length === 0) {
    <p class="muted">No labeled posts yet. Run "Label next 5" on the Accounts page.</p>
  } @else {
    <table>
      <tr><th>#</th><th>Hook</th><th>Avg score</th><th>Posts</th></tr>
      @for (h of hooks; track h.label; let i = $index) {
        <tr>
          <td>{{ i + 1 }}</td>
          <td>{{ h.label }}</td>
          <td>{{ h.avgScore.toFixed(2) }}</td>
          <td>{{ h.posts }}</td>
        </tr>
      }
    </table>
  }

  <h3>Best topics</h3>
  @if (topics.length === 0) {
    <p class="muted">No labeled posts yet.</p>
  } @else {
    <table>
      <tr><th>#</th><th>Topic</th><th>Avg score</th><th>Posts</th></tr>
      @for (t of topics; track t.label; let i = $index) {
        <tr>
          <td>{{ i + 1 }}</td>
          <td>{{ t.label }}</td>
          <td>{{ t.avgScore.toFixed(2) }}</td>
          <td>{{ t.posts }}</td>
        </tr>
      }
    </table>
  }`,
  styles: [`
  table { border-collapse: collapse; width: 100%; max-width: 720px; margin-bottom: 20px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f2f2f2; }
  .muted { color: #777; }
  .error { color: #c62828; }
`],


})
export class InsightsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  competitors: any[] = []; hooks: any[] = []; topics: any[] = [];
  loading = true;
  error = '';

  // Three separate requests, one per table, because the backend handles one database field per request.
  async ngOnInit() {
    try {
      this.competitors = (await this.api.gql<any>(
        `{ competitors { id handle engagement posts postsLast90Days bestScore } }`)).competitors;
      this.hooks = (await this.api.gql<any>(`{ hookStats { label avgScore posts } }`)).hookStats;
      this.topics = (await this.api.gql<any>(`{ topicStats { label avgScore posts } }`)).topicStats;
    } catch (e: any) {
      this.error = 'Error: ' + e.message;
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // refresh the view immediately
    }
  }
}
