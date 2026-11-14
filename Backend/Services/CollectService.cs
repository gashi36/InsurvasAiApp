using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Collectors;

namespace Backend.Services
{
    // Fetches an account's videos and saves them. Existing posts get fresh numbers, new ones are added.
    public class CollectService(AppDbContext db, ICollector collector)

    {
        public async Task<int> RunAsync(int accountId)
        {
            var acc = await db.Accounts.FindAsync(accountId) ?? throw new HotChocolate.GraphQLException("Account not found");
            var raw = await collector.CollectAsync(acc);
            var have = db.Posts.Where(p => p.AccountId == accountId).ToDictionary(p => p.ExternalId);
            int added = 0;


            foreach (var r in raw)
            {
                if (have.TryGetValue(r.ExternalId, out var p))
                { p.Views = r.Views; p.Likes = r.Likes; p.Comments = r.Comments; }
                else
                {
                    var post = new Post
                    {
                        AccountId = accountId,
                        ExternalId = r.ExternalId,
                        Url = r.Url,
                        Caption = r.Caption,
                        PostedAt = r.PostedAt,
                        Views = r.Views,
                        Likes = r.Likes,
                        Comments = r.Comments
                    };

                    db.Posts.Add(post);
                    have.Add(r.ExternalId, post);

                    added++;
                }
            }
            await db.SaveChangesAsync();
            return added;
        }

    }
}