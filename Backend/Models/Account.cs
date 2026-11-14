// One tracked competitor channel.
public class Account
{
    public int Id { get; set; }
    public string Platform { get; set; } = "youtube";
    public string Handle { get; set; } = "";      // @name
    public string ChannelId { get; set; } = "";   // YouTube's internal id
    public string DisplayName { get; set; } = "";
    public string Type { get; set; } = "agent";   // agent | agency
    public long Followers { get; set; }
    public List<Post> Posts { get; set; } = new(); // makes delete cascade to posts
}