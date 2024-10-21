using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ApiUsage2")]
[Index("ApiKeyId", Name = "IX_ApiUsage2_ApiKey")]
[Index("ModelId", Name = "IX_ApiUsage2_Model")]
[Index("TransactionLogId", Name = "IX_ApiUsage2_TransactionLog", IsUnique = true)]
public partial class ApiUsage2
{
    [Key]
    public long Id { get; set; }

    public int ApiKeyId { get; set; }

    public short ModelId { get; set; }

    public int InputTokenCount { get; set; }

    public int OutputTokenCount { get; set; }

    public int DurationMs { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal InputCost { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal OutputCost { get; set; }

    public long TransactionLogId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ApiKeyId")]
    [InverseProperty("ApiUsage2s")]
    public virtual ApiKey ApiKey { get; set; } = null!;

    [ForeignKey("ModelId")]
    [InverseProperty("ApiUsage2s")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("TransactionLogId")]
    [InverseProperty("ApiUsage2")]
    public virtual TransactionLog TransactionLog { get; set; } = null!;
}
