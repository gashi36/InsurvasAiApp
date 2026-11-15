using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using static Backend.Models.Stats;

namespace Backend.GraphQL
{
    // Read operations. One method per query;
    public class Query
    {
        // All tracked accounts.
        public List<Account> GetAccounts([Service] AppDbContext db) => db.Accounts.ToList();

        public List<Post> GetTopPosts(int take, string? topic, string? hook, [Service] AppDbContext db) =>
            db.Posts
               .Where(p => topic == null || p.Topic == topic)
               .Where(p => hook == null || p.Hook == hook)
               .OrderByDescending(p => p.Views).Take(take).ToList();


        public List<CompetitorStat> GetCompetitors([Service] AppDbContext db)
        {
            var cutoff = DateTime.UtcNow.AddDays(-90);
            return db.Accounts.Include(a => a.Posts).ToList()
             .Select(a => new CompetitorStat(a.Id, a.Handle, a.DisplayName, a.Followers,
             a.Posts.Count,
             a.Posts.Count(p => p.PostedAt > cutoff),                 // consistency: recent activity
             StatsService.Median(a.Posts.Where(p => p.Views > 0)             // engagement per view
                .Select(p => (p.Likes + 2.0 * p.Comments) / p.Views)),
             a.Posts.Max(p => p.Score)))                              // their best single post
        .OrderByDescending(c => c.Engagement).ToList();
        }

        // Which hooks perform best, on average.
        public List<LabelStat> GetHookStats([Service] AppDbContext db) => Stat(db, p => p.Hook);

        // Which topics perform best, on average.
        public List<LabelStat> GetTopicStats([Service] AppDbContext db) => Stat(db, p => p.Topic);

        // Groups scored, labeled posts by a label and averages their scores. Best first.
        private static List<LabelStat> Stat(AppDbContext db, Func<Post, string?> key) =>
            db.Posts.Where(p => p.Score != null && p.Topic != null).ToList()
                .GroupBy(key)
                .Where(g => g.Count() >= 3)                                  // ignore tiny samples
                .Select(g => new LabelStat(g.Key ?? "unlabeled", g.Average(p => p.Score!.Value), g.Count()))
                .OrderByDescending(s => s.AvgScore).ToList();
    }
}