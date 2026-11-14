using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

    }
}