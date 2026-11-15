import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

// Ranked table of posts with topic/hook filters.
@Component({
  selector: 'app-posts',
  imports: [FormsModule],
  template: `
    <h2>Top posts</h2>
    <label>Topic <input [(ngModel)]="topic" placeholder="term life"></label>
    <label>Hook <input [(ngModel)]="hook" placeholder="question"></label>
    <button (click)="load()">Apply</button>
    @if (error) { <p style="color:red">{{ error }}</p> }
    <table border="1" cellpadding="6">
      <tr><th>Score</th><th>Caption</th><th>Topic</th><th>Hook</th><th>Format</th><th>Views</th></tr>
      @for (p of posts; track p.url) {
        <tr>
          <td>{{ p.score?.toFixed(1) }}</td>
          <td><a [href]="p.url" target="_blank">{{ p.caption.split('\\n')[0] }}</a></td>
          <td>{{ p.topic }}</td><td>{{ p.hook }}</td><td>{{ p.format }}</td><td>{{ p.views }}</td>
        </tr>
      }
    </table>`,
})
export class PostsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  posts: any[] = [];
  topic = ''; hook = ''; error = '';

  ngOnInit() { this.load(); }

  // Asks the API for the top 20, sending a filter only if the box has text.
  async load() {
    try {
      const d = await this.api.gql<{ topPosts: any[] }>(
        `query($topic:String,$hook:String){
            topPosts(take:20,topic:$topic,hook:$hook){ caption url topic hook format score views } }`,
        { topic: this.topic || null, hook: this.hook || null });
      this.posts = d.topPosts;
      this.error = '';
      this.cdr.detectChanges();
    } catch (e: any) {
      this.error = e.message;
      this.cdr.detectChanges();
    }
  }
}
