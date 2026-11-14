
namespace Backend.Collectors
{
    public record RawPost(string ExternalId, string Url, string Caption, DateTime PostedAt, long Views, long Likes, long Comments);
    public record AccountInfo(string ChannelId, string DisplayName, long Followers);
    public interface ICollector
    {
        Task<AccountInfo?> LookupAsync(string handle);
        Task<List<RawPost>> CollectAsync(Account account, int max = 50);
    }
}