using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

// Asks the LLM to sort each unlabeled post into fixed Topic / Hook / Format bins.
public class LabelService(AppDbContext db, HttpClient http, IConfiguration cfg)
{
    // The bins. Edit a list and the prompt and validation both follow.

    static readonly string[] Topics = { "term life", "whole life", "iul", "final expense",
        "mortgage protection", "family protection", "recruiting", "general education", "other" };
    static readonly string[] Hooks = { "question", "statistic", "story", "myth-bust",
        "warning", "how-to", "other" };
    static readonly string[] Formats = { "explainer", "q&a", "tips list", "testimonial", "promo", "other" };

    // Labels up to `take` posts that have no label yet. Returns how many were done.
    public async Task<int> RunAsync(int take)
    {
        var posts = await db.Posts.Where(p => p.Topic == null).Take(take).ToListAsync(); // skipping done ones = cache
        foreach (var p in posts)
        {
            var (t, h, f) = await LabelOne(p.Caption);
            p.Topic = t; p.Hook = h; p.Format = f;
            await db.SaveChangesAsync();   // save each, so a crash loses nothing
            await Task.Delay(4500);
        }
        return posts.Count;
    }

    // One API call for one post. Returns validated labels.
    async Task<(string, string, string)> LabelOne(string caption)
    {
        var prompt = "You label life insurance social media posts. Reply with JSON only: " +
            "{\"topic\":..,\"hook\":..,\"format\":..}. " +
            $"topic is one of [{string.Join(", ", Topics)}]. " +
            $"hook (how the first line grabs attention) is one of [{string.Join(", ", Hooks)}]. " +
            $"format is one of [{string.Join(", ", Formats)}]. Use \"other\" if unsure.\n\n" +
            $"Post:\n{caption[..Math.Min(caption.Length, 1000)]}";

        var body = JsonSerializer.Serialize(new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        });

        var apiKey = cfg["Gemini:ApiKey"];
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var req = new HttpRequestMessage(HttpMethod.Post, url)
        { Content = new StringContent(body, Encoding.UTF8, "application/json") };

        var res = await http.SendAsync(req);
        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            throw new Exception($"Gemini says: {res.StatusCode} - {err}");
        }

        var text = JsonDocument.Parse(await res.Content.ReadAsStringAsync())
            .RootElement.GetProperty("candidates")[0]
            .GetProperty("content").GetProperty("parts")[0]
            .GetProperty("text").GetString()!;

        var j = JsonDocument.Parse(text).RootElement;
        return (Pick(j, "topic", Topics), Pick(j, "hook", Hooks), Pick(j, "format", Formats));
    }

    // Forces a field into its allowed list. Anything unexpected becomes "other".
    static string Pick(JsonElement j, string key, string[] allowed)
    {
        var v = j.TryGetProperty(key, out var e) ? e.GetString()?.ToLowerInvariant() : null;
        return allowed.Contains(v) ? v! : "other";
    }
}