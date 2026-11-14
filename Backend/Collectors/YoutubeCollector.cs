
using System.Globalization;
using System.Text.Json;

namespace Backend.Collectors
{
    public class YoutubeCollector : ICollector
    {
        private readonly HttpClient _http;
        private readonly string _key;

        // API base URL and reads the key from user-secrets.
        public YoutubeCollector(HttpClient http, IConfiguration cfg)
        {
            _http = http;
            http.BaseAddress = new Uri("https://www.googleapis.com/youtube/v3/");
            _key = cfg["YouTube:ApiKey"] ?? throw new Exception("Missing YoutubeApiKey");
        }

        // Lookup a channel by its handle, returns null if not found.
        public async Task<AccountInfo?> LookupAsync(string handle)
        {
            var j = await Get($"channels?part=snippet,statistics&forHandle={Uri.EscapeDataString(handle)}");
            if (!j.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0) return null;
            var c = items[0];
            return new AccountInfo(c.GetProperty("id").GetString()!,
                c.GetProperty("snippet").GetProperty("title").GetString()!,
                Num(c.GetProperty("statistics"), "subscriberCount"));
        }

        // Latest uploads -> video ids -> their stats, mapped to RawPost.
        public async Task<List<RawPost>> CollectAsync(Account a, int max = 50)
        {
            var p1 = "UU" + a.ChannelId[2..];
            var list = await Get($"playlistItems?part=contentDetails&playlistId={p1}&maxResults={Math.Min(max, 50)}");
            var ids = list.RootElement.GetProperty("items").EnumerateArray()
               .Select(i => i.GetProperty("contentDetails").GetProperty("videoId").GetString()!).ToList();
            if (ids.Count == 0) return new();

            var v = await Get($"videos?part=snippet,statistics&id={string.Join(",", ids)}");
            return v.RootElement.GetProperty("items").EnumerateArray().Select(x =>
            {
                var sn = x.GetProperty("snippet"); var st = x.GetProperty("statistics");
                var id = x.GetProperty("id").GetString()!;
                return new RawPost(id, $"https://www.youtube.com/watch?v={id}",
                    sn.GetProperty("title").GetString() + "\n" + sn.GetProperty("description").GetString(),
                    sn.GetProperty("publishedAt").GetDateTime(),
                    Num(st, "viewCount"), Num(st, "likeCount"), Num(st, "commentCount"));
            }).ToList();
        }
        // YouTube sends counts as strings, and hidden ones are missing -> 0.
        private static long Num(JsonElement e, string name) => e.TryGetProperty(name, out var p) ? long.TryParse(p.GetString()!, out var n) ? n : 0 : 0;


        // GET request with the API key; throws on HTTP error.

        private async Task<JsonDocument> Get(string path)
        {
            var r = await _http.GetAsync($"{path}&key={_key}");
            r.EnsureSuccessStatusCode();
            return JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        }


    }
}