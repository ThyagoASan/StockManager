using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockManager.Api.Data;
using StockManager.Api.Models;

namespace StockManager.Api.Controllers;
[ApiController, Authorize, Route("api/[controller]")]
public class CategoriasController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() => Ok(await db.Categorias.OrderBy(c => c.Nombre).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Crear(Categoria categoria)
    {
        categoria.Id = 0;
        categoria.Nombre = categoria.Nombre.Trim();
        if (string.IsNullOrWhiteSpace(categoria.Nombre)) return BadRequest("Nombre requerido.");
        if (await db.Categorias.AnyAsync(c => c.Nombre == categoria.Nombre)) return Conflict("La categoría ya existe.");
        db.Categorias.Add(categoria);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, Categoria entrada)
    {
        var actual = await db.Categorias.FindAsync(id);
        if (actual is null) return NotFound();
        var nombre = entrada.Nombre.Trim();
        if (string.IsNullOrWhiteSpace(nombre)) return BadRequest("Nombre requerido.");
        if (await db.Categorias.AnyAsync(c => c.Id != id && c.Nombre == nombre)) return Conflict("La categoría ya existe.");
        actual.Nombre = nombre;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null) return NotFound();
        if (await db.Productos.AnyAsync(p => p.CategoriaId == id)) return Conflict("La categoría tiene productos asociados.");
        db.Categorias.Remove(categoria);
        await db.SaveChangesAsync();
        return NoContent();
    }
}