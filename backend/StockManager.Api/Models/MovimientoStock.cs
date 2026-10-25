using System.ComponentModel.DataAnnotations;
namespace StockManager.Api.Models;
public class MovimientoStock
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    [Required, StringLength(20)]
    public string Tipo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    [StringLength(150)]
    public string? Motivo { get; set; }
    public DateTime Fecha { get; set; }
}