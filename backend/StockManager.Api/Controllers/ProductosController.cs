using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockManager.Api.Data;
using StockManager.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace StockManager.Api.Controllers;
public record ProductoDto([param: Required, StringLength(150)] string Nombre, [param: StringLength(255)] string? Descripcion, [param: Range(0, 99999999)] decimal Precio, [param: Range(0, int.MaxValue)] int Stock, [param: Range(0, int.MaxValue)] int StockMinimo, int CategoriaId);

[ApiController, Route("api/[controller]"), Authorize]
public class ProductosController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() => Ok(await db.Productos.OrderBy(p => p.Id).ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var producto = await db.Productos.FindAsync(id);
        return producto is null ? NotFound() : Ok(producto);
    }

    [HttpPost]
    public async Task<IActionResult> Crear(ProductoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre)) return BadRequest("Nombre requerido.");
        if (!await db.Categorias.AnyAsync(c => c.Id == dto.CategoriaId)) return BadRequest("Categoría inexistente.");
        var producto = new Producto { Nombre = dto.Nombre.Trim(), Descripcion = dto.Descripcion?.Trim(), Precio = dto.Precio, Stock = dto.Stock, StockMinimo = dto.StockMinimo, CategoriaId = dto.CategoriaId, FechaCreacion = DateTime.UtcNow };
        db.Productos.Add(producto);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Obtener), new { id = producto.Id }, producto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, ProductoDto dto)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Nombre)) return BadRequest("Nombre requerido.");
        if (!await db.Categorias.AnyAsync(c => c.Id == dto.CategoriaId)) return BadRequest("Categoría inexistente.");
        producto.Nombre = dto.Nombre.Trim();
        producto.Descripcion = dto.Descripcion?.Trim();
        producto.Precio = dto.Precio;
        producto.StockMinimo = dto.StockMinimo;
        producto.CategoriaId = dto.CategoriaId;
        // Las variaciones de existencias se registran exclusivamente mediante movimientos.
        if (producto.Stock != dto.Stock) return BadRequest("Modificar stock desde Movimientos.");
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null) return NotFound();
        if (await db.MovimientosStock.AnyAsync(m => m.ProductoId == id)) return Conflict("El producto tiene movimientos asociados.");
        db.Productos.Remove(producto);
        await db.SaveChangesAsync();
        return NoContent();
    }
}