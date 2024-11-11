using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UsageTransactionLog")]
[Index("UserModelId", Name = "IX_UserModelTransactionLog_UserModelId")]
public partial class UsageTransactionLog
{
    [Key]
    public long Id { get; set; }

    public int UserModelId { get; set; }

    public byte TransactionTypeId { get; set; }

    public int TokenAmount { get; set; }

    public int CountAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("TransactionTypeId")]
    [InverseProperty("UsageTransactionLogs")]
    public virtual TransactionType TransactionType { get; set; } = null!;

    [ForeignKey("UserModelId")]
    [InverseProperty("UsageTransactionLogs")]
    public virtual UserModel2 UserModel { get; set; } = null!;

    [InverseProperty("UsageTransaction")]
    public virtual UserModelUsage? UserModelUsage { get; set; }
}
