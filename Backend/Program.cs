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
builder.Services.AddGraphQLServer().AddQueryType<Query>().AddMutationType<Mutation>().ModifyRequestOptions(opt => opt.ExecutionTimeout = TimeSpan.FromMinutes(2)); ;
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));


var app = builder.Build();
using (var s = app.Services.CreateScope())
    s.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
app.UseCors();
app.MapGraphQL();
app.Run();