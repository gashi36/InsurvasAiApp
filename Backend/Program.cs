using Backend.Collectors;
using Backend.GraphQL;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite("Data Source=app.db"));
builder.Services.AddHttpClient<ICollector, YoutubeCollector>();
builder.Services.AddHttpClient<LabelService>();                                       // LLM labeler
builder.Services.AddScoped<CollectService>();
builder.Services.AddScoped<ScoringService>();
builder.Services.AddScoped<CollectService>();
builder.Services.AddGraphQLServer().AddQueryType<Query>().AddMutationType<Mutation>();

var app = builder.Build();
using (var s = app.Services.CreateScope())
    s.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
app.MapGraphQL();
app.Run();