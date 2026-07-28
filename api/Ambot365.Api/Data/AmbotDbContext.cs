using Microsoft.EntityFrameworkCore;

namespace Ambot365.Api.Data;

/// <summary>
/// db/schema.sql is the source of truth for the schema — there are deliberately
/// no EF migrations, so the two can never drift. This context only describes
/// what EF needs in order to read and write the tables that already exist.
/// </summary>
public class AmbotDbContext(DbContextOptions<AmbotDbContext> options) : DbContext(options)
{
    public DbSet<Bot> Bots => Set<Bot>();
    public DbSet<DemoWebsite> Websites => Set<DemoWebsite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bot>(entity =>
        {
            entity.ToTable("bots");
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => b.Slug).IsUnique();

            // created_at / updated_at are owned by the database: `default now()`
            // and the set_updated_at trigger. Marking them generated stops EF
            // writing them and makes it read the real values back via RETURNING.
            entity.Property(b => b.CreatedAt).ValueGeneratedOnAdd();
            entity.Property(b => b.UpdatedAt).ValueGeneratedOnAddOrUpdate();
        });

        modelBuilder.Entity<DemoWebsite>(entity =>
        {
            entity.ToTable("websites");
            entity.HasKey(w => w.Id);
            entity.HasIndex(w => w.Slug).IsUnique();

            // text[] in Postgres, string[] on the wire — Npgsql maps this natively.
            entity.Property(w => w.Tags).HasColumnType("text[]");

            entity.Property(w => w.CreatedAt).ValueGeneratedOnAdd();
            entity.Property(w => w.UpdatedAt).ValueGeneratedOnAddOrUpdate();
        });
    }
}
