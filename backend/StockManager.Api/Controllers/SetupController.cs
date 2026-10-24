using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockManager.Api.Data;
using StockManager.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace StockManager.Api.Controllers;
public record InicializarAdminDto([property: EmailAddress] string Email, [property: MinLength(12)] string Password);
[ApiController, Route("api/setup")]
public class SetupController(ApplicationDbContext db, IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("admin")]
    public async Task<IActionResult> Inicializar(InicializarAdminDto dto)
    {
        if (!env.IsDevelopment()) return NotFound();
        if (await db.Usuarios.AnyAsync()) return Conflict("Ya existe un usuario; la inicialización está deshabilitada.");
        if (!new EmailAddressAttribute().IsValid(dto.Email) || dto.Password?.Length < 12)
            return BadRequest("Correo válido y contraseña de al menos 12 caracteres requeridos.");
        db.Usuarios.Add(new Usuario { Nombre = "Administrador", Email = dto.Email.Trim().ToLowerInvariant(), PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), FechaCreacion = DateTime.UtcNow });
        await db.SaveChangesAsync();
        return Ok(new { mensaje = "Administrador inicial creado." });
    }
}