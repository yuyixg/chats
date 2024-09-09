using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("TransactionLog")]
[Index("CreditUserId", Name = "IX_BalanceLog2_CreditUser")]
[Index("UserId", Name = "IX_BalanceLog2_User")]
public partial class TransactionLog
{
    [Key]
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? CreditUserId { get; set; }

    public byte TransactionTypeId { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("TransactionLog")]
    public virtual ApiUsage? ApiUsage { get; set; }

    [ForeignKey("CreditUserId")]
    [InverseProperty("TransactionLogCreditUsers")]
    public virtual User? CreditUser { get; set; }

    [InverseProperty("TransactionLog")]
    public virtual MessageResponse? MessageResponse { get; set; }

    [ForeignKey("TransactionTypeId")]
    [InverseProperty("TransactionLogs")]
    public virtual TransactionType TransactionType { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("TransactionLogUsers")]
    public virtual User User { get; set; } = null!;
}
