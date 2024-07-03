using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[PrimaryKey("Provider", "Type")]
[Table("ModelSetting")]
public partial class ModelSetting
{
    [Key]
    [StringLength(50)]
    [Unicode(false)]
    public string Provider { get; set; } = null!;

    [Key]
    [StringLength(50)]
    [Unicode(false)]
    public string Type { get; set; } = null!;

    [Column(TypeName = "decimal(3, 2)")]
    public decimal MinTemperature { get; set; }

    [Column(TypeName = "decimal(3, 2)")]
    public decimal MaxTemperature { get; set; }

    public bool AllowSearch { get; set; }

    public bool AllowVision { get; set; }

    [StringLength(1000)]
    public string DefaultPrompt { get; set; } = null!;

    [Column(TypeName = "decimal(3, 2)")]
    public decimal DefaultTemperature { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? DefaultDeploymentName { get; set; }

    [StringLength(4000)]
    public string OtherDefaultConfigs { get; set; } = null!;

    [Column(TypeName = "decimal(9, 5)")]
    public decimal PromptTokenPrice1M { get; set; }

    [Column(TypeName = "decimal(9, 5)")]
    public decimal ResponseTokenPrice1M { get; set; }
}
