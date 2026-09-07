using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using StockManager.Api.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StockManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        // Usuario de prueba
        if (request.Email != "admin@stockmanager.com" ||
            request.Password != "123456")
        {
            return Unauthorized("Credenciales inválidas");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, request.Email),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!));

        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return Ok(new LoginResponse
        {
            Token = new JwtSecurityTokenHandler()
                .WriteToken(token)
        });
    }
}