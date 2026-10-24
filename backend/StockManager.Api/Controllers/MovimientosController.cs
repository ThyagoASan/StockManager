using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using StockManager.Api.Data;
using StockManager.Api.Models;

namespace StockManager.Api.Controllers;
public record CrearMovimientoDto(int ProductoId, string Tipo, int Cantidad, [property: StringLength(150)] string? Motivo);

[ApiController, Authorize, Route("api/[controller]")]
public class MovimientosController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() => Ok(await db.MovimientosStock.OrderByDescending(m => m.Fecha).ThenByDescending(m => m.Id).Take(300).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Registrar(CrearMovimientoDto solicitud)
    {
        var tipo = solicitud.Tipo?.Trim().ToLowerInvariant();
        if (tipo is not ("entrada" or "salida") || solicitud.Cantidad <= 0)
            return BadRequest("Tipo entrada/salida y cantidad positiva requeridos.");

        await using var transaccion = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        var producto = await db.Productos.FindAsync(solicitud.ProductoId);
        if (producto is null) return NotFound("Producto no encontrado.");
        if (tipo == "salida" && producto.Stock < solicitud.Cantidad)
            return Conflict("Stock insuficiente.");
        try
        {
            producto.Stock = checked(producto.Stock + (tipo == "entrada" ? solicitud.Cantidad : -solicitud.Cantidad));
        }
        catch (OverflowException) { return BadRequest("Cantidad fuera de rango."); }

        var movimiento = new MovimientoStock
        {
            ProductoId = producto.Id,
            Tipo = tipo,
            Cantidad = solicitud.Cantidad,
            Motivo = solicitud.Motivo?.Trim(),
            Fecha = DateTime.UtcNow
        };
        db.MovimientosStock.Add(movimiento);
        await db.SaveChangesAsync();
        await transaccion.CommitAsync();
        return Ok(movimiento);
    }
}