// One video: its numbers, labels and score.
public class Post
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public string ExternalId { get; set; } = "";  // platform's id, blocks duplicates
    public string Url { get; set; } = "";
    public string Caption { get; set; } = "";
    public DateTime PostedAt { get; set; }
    public long Views { get; set; }
    public long Likes { get; set; }
    public long Comments { get; set; }
    public string? Topic { get; set; }   // set by LabelService
    public string? Hook { get; set; }
    public string? Format { get; set; }
    public double? Score { get; set; }   // set by ScoringService
}