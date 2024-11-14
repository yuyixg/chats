using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserModelUsage")]
[Index("BalanceTransactionId", Name = "IX_ModelUsage_BalanceTransaction", IsUnique = true)]
[Index("CreatedAt", Name = "IX_ModelUsage_CreatedAt")]
[Index("UsageTransactionId", Name = "IX_ModelUsage_UsageTransaction", IsUnique = true)]
[Index("UserModelId", Name = "IX_ModelUsage_UserModelId")]
public partial class UserModelUsage
{
    [Key]
    public long Id { get; set; }

    public int UserModelId { get; set; }

    public int InputTokenCount { get; set; }

    public int OutputTokenCount { get; set; }

    public int DurationMs { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal InputCost { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal OutputCost { get; set; }

    public long? BalanceTransactionId { get; set; }

    public long? UsageTransactionId { get; set; }

    public int ClientInfoId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("BalanceTransactionId")]
    [InverseProperty("UserModelUsage")]
    public virtual BalanceTransaction? BalanceTransaction { get; set; }

    [ForeignKey("ClientInfoId")]
    [InverseProperty("UserModelUsages")]
    public virtual ClientInfo ClientInfo { get; set; } = null!;

    [InverseProperty("Usage")]
    public virtual Message? Message { get; set; }

    [ForeignKey("UsageTransactionId")]
    [InverseProperty("UserModelUsage")]
    public virtual UsageTransaction? UsageTransaction { get; set; }

    [InverseProperty("Usage")]
    public virtual UserApiUsage? UserApiUsage { get; set; }

    [ForeignKey("UserModelId")]
    [InverseProperty("UserModelUsages")]
    public virtual UserModel UserModel { get; set; } = null!;
}
