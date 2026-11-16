using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Backend.Collectors;
using Backend.GraphQL;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=app.db";

builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlite(connectionString));

builder.Services.AddHttpClient<ICollector, YoutubeCollector>();
builder.Services.AddHttpClient<LabelService>();

builder.Services.AddScoped<CollectService>();
builder.Services.AddScoped<ScoringService>();

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .ModifyRequestOptions(opt =>
        opt.ExecutionTimeout = TimeSpan.FromMinutes(2));

var frontendUrl = builder.Configuration["FrontendUrl"]
    ?? "http://localhost:4200";

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseCors();

// Active login tokens. In memory, so a server restart logs everyone out (fine for a demo).
var sessions = new ConcurrentDictionary<string, DateTime>();

// Login: checks the demo user/password from config and returns a random token.
app.MapPost("/login", (LoginRequest req, IConfiguration cfg) =>
{
    var user = cfg["Demo:User"];
    var pass = cfg["Demo:Password"];
    if (user is null || pass is null) return Results.Problem("Demo login is not configured");

    bool ok = req.Username == user &&
              CryptographicOperations.FixedTimeEquals(   // compares without leaking timing
                  Encoding.UTF8.GetBytes(req.Password ?? ""),
                  Encoding.UTF8.GetBytes(pass));
    if (!ok) return Results.Unauthorized();

    var token = RandomNumberGenerator.GetHexString(32);
    sessions[token] = DateTime.UtcNow.AddHours(8);       // token valid for 8 hours
    return Results.Ok(new { token });
});

// Gate: every /graphql request needs a valid token (browser preflight OPTIONS passes through).
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.StartsWithSegments("/graphql") && ctx.Request.Method != "OPTIONS")
    {
        var h = ctx.Request.Headers.Authorization.ToString();
        var token = h.StartsWith("Bearer ") ? h[7..] : "";
        if (!sessions.TryGetValue(token, out var exp) || exp < DateTime.UtcNow)
        {
            ctx.Response.StatusCode = 401;
            return;
        }
    }
    await next();
});

app.MapGraphQL();

app.Run();

// Shape of the login request body. Must stay at the bottom, after the top-level statements.
record LoginRequest(string Username, string? Password);