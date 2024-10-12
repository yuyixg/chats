using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ModelReference")]
[Index("ProviderId", "Name", Name = "IX_ModelSetting_ProviderId+Type")]
public partial class ModelReference
{
    [Key]
    public int Id { get; set; }

    public short ProviderId { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column(TypeName = "decimal(3, 2)")]
    public decimal MinTemperature { get; set; }

    [Column(TypeName = "decimal(3, 2)")]
    public decimal MaxTemperature { get; set; }

    public bool AllowSearch { get; set; }

    public bool AllowVision { get; set; }

    public int ContextWindow { get; set; }

    public int MaxResponseTokens { get; set; }

    [Column(TypeName = "decimal(9, 5)")]
    public decimal PromptTokenPrice1M { get; set; }

    [Column(TypeName = "decimal(9, 5)")]
    public decimal ResponseTokenPrice1M { get; set; }

    [ForeignKey("ProviderId")]
    [InverseProperty("ModelReferences")]
    public virtual ModelProvider Provider { get; set; } = null!;
}
