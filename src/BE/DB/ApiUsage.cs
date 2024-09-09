using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ApiUsage")]
[Index("ApiKeyId", Name = "IX_ApiKeyUsage_ApiKey")]
[Index("ChatModelId", Name = "IX_ApiKeyUsage_ChatModel")]
[Index("TransactionLogId", Name = "IX_ApiKeyUsage_TransactionLog", IsUnique = true)]
public partial class ApiUsage
{
    [Key]
    public long Id { get; set; }

    public int ApiKeyId { get; set; }

    public Guid ChatModelId { get; set; }

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
    [InverseProperty("ApiUsages")]
    public virtual ApiKey ApiKey { get; set; } = null!;

    [ForeignKey("ChatModelId")]
    [InverseProperty("ApiUsages")]
    public virtual ChatModel ChatModel { get; set; } = null!;

    [ForeignKey("TransactionLogId")]
    [InverseProperty("ApiUsage")]
    public virtual TransactionLog TransactionLog { get; set; } = null!;
}
