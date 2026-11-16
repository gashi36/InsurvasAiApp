using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Collectors;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.GraphQL
{
    // Write operations. Each public method becomes a mutation.
    public class Mutation
    {
        public async Task<Account> AddAccount(
     string handle,
     string type,
     string platform,
     [Service] AppDbContext db,
     [Service] ICollector c,
     [Service] ILogger<Mutation> logger)
        {
            try
            {
                if (type is not ("agent" or "agency"))
                    throw new GraphQLException("Type must be 'agent' or 'agency'");

                handle = "@" + handle.Trim().TrimStart('@');

                if (await db.Accounts.AnyAsync(
                    a => a.Handle == handle && a.Platform == platform))
                    throw new GraphQLException("Already tracked");

                var info = await c.LookupAsync(handle)
                    ?? throw new GraphQLException("Channel not found");

                var acc = new Account
                {
                    Handle = handle,
                    Type = type,
                    Platform = platform,
                    ChannelId = info.ChannelId,
                    DisplayName = info.DisplayName,
                    Followers = info.Followers
                };

                db.Accounts.Add(acc);
                await db.SaveChangesAsync();

                return acc;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "AddAccount failed for {Handle}", handle);
                throw;
            }
        }
        // Deletes an account and its posts. True if something was deleted.
        public async Task<bool> DeleteAccount(int id, [Service] AppDbContext db) => await db.Accounts.Where(a => a.Id == id).ExecuteDeleteAsync() > 0;

        // Pulls the latest videos for one account. Returns how many were new.
        public Task<int> CollectAccount(int id, [Service] CollectService s) => s.RunAsync(id);

        // Recomputes every post's score. Run after collecting.
        public Task<int> ScoreAll([Service] ScoringService s) => s.RunAsync();

        // Labels the next batch of unlabeled posts. Run it repeatedly.
        public Task<int> LabelPosts(int take, [Service] LabelService s) => s.RunAsync(take);
    }
}