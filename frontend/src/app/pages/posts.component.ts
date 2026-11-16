import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

// Ranked table of posts with topic/hook filters.
@Component({
  selector: 'app-posts',
  imports: [FormsModule],
  template: `
  <h2>Top posts</h2>

  <!-- Filters: choosing a value reloads the table right away -->
  <div class="row">
    <label>Topic
      <select [(ngModel)]="topic" (change)="load()">
        <option value="">All</option>
        @for (t of topics; track t) { <option [value]="t">{{ t }}</option> }
      </select>
    </label>
    <label>Hook
      <select [(ngModel)]="hook" (change)="load()">
        <option value="">All</option>
        @for (h of hooks; track h) { <option [value]="h">{{ h }}</option> }
      </select>
    </label>
    <button (click)="reset()" [disabled]="!topic && !hook">Reset</button>
    @if (loading) { <span class="muted">Loading…</span> }
  </div>

  @if (error) { <p class="error">{{ error }}</p> }

  @if (!loading && posts.length === 0 && !error) {
    <p class="muted">No posts match. Collect, score and label some accounts first.</p>
  } @else {
    <table>
      <tr><th>#</th><th>Score</th><th>Caption</th><th>Topic</th><th>Hook</th><th>Format</th><th>Views</th></tr>
      @for (p of posts; track p.url; let i = $index) {
        <tr>
          <td>{{ i + 1 }}</td>
          <td>{{ p.score?.toFixed(1) ?? '-' }}</td>
          <td><a [href]="p.url" target="_blank" rel="noopener">{{ p.caption.split('\\n')[0] }}</a></td>
          <td>{{ p.topic ?? '-' }}</td>
          <td>{{ p.hook ?? '-' }}</td>
          <td>{{ p.format ?? '-' }}</td>
          <td>{{ p.views.toLocaleString() }}</td>
        </tr>
      }
    </table>
  }`,
  styles: [`
  .row { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f2f2f2; }
  .muted { color: #777; }
  .error { color: #c62828; }
`],
})
export class PostsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  posts: any[] = [];
  // Same lists as the backend's LabelService, so the dropdowns can only pick valid values.
  topics = ['term life', 'whole life', 'iul', 'final expense', 'mortgage protection',
    'family protection', 'recruiting', 'general education', 'other'];
  hooks = ['question', 'statistic', 'story', 'myth-bust', 'warning', 'how-to', 'other'];
  topic = ''; hook = ''; error = ''; loading = false;

  ngOnInit() { this.load(); }

  // Clears both filters and reloads.
  reset() { this.topic = ''; this.hook = ''; this.load(); }

  // Asks the API for the top 20, sending a filter only if one is chosen (empty becomes null).
  async load() {
    this.loading = true;
    try {
      const d = await this.api.gql<{ topPosts: any[] }>(
        `query($topic:String,$hook:String){
            topPosts(take:20,topic:$topic,hook:$hook){ caption url topic hook format score views } }`,
        { topic: this.topic || null, hook: this.hook || null });
      this.posts = d.topPosts;
      this.error = '';
    } catch (e: any) {
      this.error = 'Error: ' + e.message;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();   // refresh the view, also after an error
    }
  }
}
