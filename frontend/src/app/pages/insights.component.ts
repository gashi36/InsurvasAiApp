import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

// Who to learn from (competitors) and what works (hooks, topics).
@Component({
  selector: 'app-insights',
  template: `
    <h2>Strongest competitors</h2>
    <table border="1" cellpadding="6">
  <tr><th>Handle</th><th>Engagement</th><th>Posts</th><th>Posts (90d)</th><th>Best post score</th></tr>
  @for (c of competitors; track c.id) {
    <tr>
      <td>{{ c.handle }}</td>
      <td>{{ c.engagement.toFixed(3) }}</td>
      <td>{{ c.posts }}</td>
      <td>{{ c.postsLast90Days }}</td>
      <td>{{ c.bestScore?.toFixed(1) }}</td>
    </tr>
  }
</table>
    <h2>Best hooks</h2>
    <table border="1" cellpadding="6">
      <tr><th>Hook</th><th>Avg score</th><th>Posts</th></tr>
      @for (h of hooks; track h.label) {
        <tr>
          <td>{{ h.label }}</td>
          <td>{{ h.avgScore.toFixed(2) }}</td>
          <td>{{ h.posts }}</td>
        </tr>
      }
    </table>
    <h2>Best topics</h2>
    <table border="1" cellpadding="6">
      <tr><th>Topic</th><th>Avg score</th><th>Posts</th></tr>
      @for (t of topics; track t.label) {
        <tr>
          <td>{{ t.label }}</td>
          <td>{{ t.avgScore.toFixed(2) }}</td>
          <td>{{ t.posts }}</td>
        </tr>
      }
    </table>`,
})
export class InsightsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  competitors: any[] = []; hooks: any[] = []; topics: any[] = [];

  // Aligned strictly to match the backend C# model records.
  async ngOnInit() {
    this.competitors = (await this.api.gql<any>(
      `{ competitors { id handle engagement posts postsLast90Days bestScore } }`)).competitors;
    this.hooks = (await this.api.gql<any>(`{ hookStats { label avgScore posts } }`)).hookStats;
    this.topics = (await this.api.gql<any>(`{ topicStats { label avgScore posts } }`)).topicStats;

    this.cdr.detectChanges(); // forces Angular to update the view immediately
  }
}
