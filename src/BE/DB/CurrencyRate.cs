using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("CurrencyRate")]
public partial class CurrencyRate
{
    [Key]
    [StringLength(3)]
    [Unicode(false)]
    public string Code { get; set; } = null!;

    [Column(TypeName = "decimal(14, 6)")]
    public decimal ExchangeRate { get; set; }

    [InverseProperty("CurrencyCodeNavigation")]
    public virtual ICollection<ModelReference> ModelReferences { get; set; } = new List<ModelReference>();
}
