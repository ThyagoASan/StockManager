

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StockManager.Api.Data;
using StockManager.Api.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Data;

// Conservá acá los using de tu proyecto para
// ApplicationDbContext y Usuario.

public class InicializarAdminDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(12)]
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/setup")]
public class SetupController(
    ApplicationDbContext db,
    IWebHostEnvironment env) : ControllerBase
{
    // Consultar si la instalación necesita
    // crear el primer administrador.
    [HttpGet("estado")]
    public async Task<IActionResult> Estado()
    {
        if (!env.IsDevelopment())
            return NotFound();

        bool existenUsuarios = await db.Usuarios.AnyAsync();

        return Ok(new
        {
            requiereConfiguracion = !existenUsuarios
        });
    }

    // Crear el primer administrador.
    [HttpPost("admin")]
    public async Task<IActionResult> Inicializar(
        [FromBody] InicializarAdminDto dto)
    {
        if (!env.IsDevelopment())
            return NotFound();

        if (!new EmailAddressAttribute().IsValid(dto.Email)
            || string.IsNullOrWhiteSpace(dto.Password)
            || dto.Password.Length < 12)
        {
            return BadRequest(
                "Correo válido y contraseña de al menos 12 caracteres requeridos."
            );
        }

        await using var transaction =
            await db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable
            );

        // Impedir la creación de otro administrador
        // cuando ya existe un usuario.
        if (await db.Usuarios.AnyAsync())
        {
            return Conflict(
                "Ya existe un usuario; la inicialización está deshabilitada."
            );
        }

        var administrador = new Usuario
        {
            Nombre = "Administrador",
            Email = dto.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                dto.Password
            ),
            FechaCreacion = DateTime.UtcNow
        };

        db.Usuarios.Add(administrador);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            mensaje = "Administrador inicial creado."
        });
    }
}
