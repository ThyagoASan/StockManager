using Microsoft.EntityFrameworkCore;
using StockManager.Api.Models;
namespace StockManager.Api.Data;
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<MovimientoStock> MovimientosStock => Set<MovimientoStock>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>().Property(p => p.Precio).HasPrecision(10, 2);
        modelBuilder.Entity<Producto>().Property(p => p.Nombre).HasMaxLength(150).IsRequired();
        modelBuilder.Entity<Producto>().Property(p => p.Descripcion).HasMaxLength(255);
        modelBuilder.Entity<Producto>().HasOne<Categoria>().WithMany().HasForeignKey(p => p.CategoriaId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Categoria>().HasIndex(c => c.Nombre).IsUnique();
        modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<MovimientoStock>().HasOne<Producto>().WithMany().HasForeignKey(m => m.ProductoId).OnDelete(DeleteBehavior.Restrict);
    }
}