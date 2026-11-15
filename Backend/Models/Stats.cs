namespace Backend.Models;

public class Stats
{
    public record CompetitorStat(
        int Id,
        string Handle,
        string DisplayName,
        long Followers,
        int Posts,
        int PostsLast90Days,
        double Engagement,
        double? BestScore
    );

    public record LabelStat(string Label, double AvgScore, int Posts);
}