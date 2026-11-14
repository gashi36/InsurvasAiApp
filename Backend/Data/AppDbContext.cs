using Microsoft.EntityFrameworkCore;

// Database access. Unique indexes block duplicate accounts and posts.
public class AppDbContext(DbContextOptions<AppDbContext> o) : DbContext(o)
{
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Account>().HasIndex(a => new { a.Platform, a.Handle }).IsUnique();
        b.Entity<Post>().HasIndex(p => new { p.AccountId, p.ExternalId }).IsUnique();
    }
}