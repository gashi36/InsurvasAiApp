using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    // One comparable score per post: 1.0 = typical for its channel, 3.0 = three times better than typical.
    public class ScoringService(AppDbContext db)
    {
        const double LikeW = 1, CommentW = 2, VieW = 0.05;
        public async Task<int> RunAsync()
        {
            var posts = await db.Posts.ToListAsync();
            var followers = await db.Accounts.ToDictionaryAsync(a => a.Id, a => a.Followers);
            foreach (var g in posts.GroupBy(p => p.AccountId))
            {
                if (g.Count() < 5) continue;     //skip small channels
                var f = Math.Max(followers[g.Key], 1);     // avoid divide by zero
                var raw = g.ToDictionary(p => p, p => (p.Likes * LikeW + p.Comments * CommentW + p.Views * VieW) / f);
                var median = StatsService.Median(raw.Values);  // the channel's "normal"
                foreach (var (p, r) in raw) p.Score = median > 0 ? r / median : 0;
            }
            await db.SaveChangesAsync();
            return posts.Count;
        }
    }
}