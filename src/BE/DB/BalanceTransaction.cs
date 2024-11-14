using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("BalanceTransaction")]
[Index("CreditUserId", Name = "IX_BalanceLog2_CreditUser")]
[Index("UserId", Name = "IX_BalanceLog2_User")]
public partial class BalanceTransaction
{
    [Key]
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? CreditUserId { get; set; }

    public byte TransactionTypeId { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("CreditUserId")]
    [InverseProperty("BalanceTransactionCreditUsers")]
    public virtual User? CreditUser { get; set; }

    [ForeignKey("TransactionTypeId")]
    [InverseProperty("BalanceTransactions")]
    public virtual TransactionType TransactionType { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("BalanceTransactionUsers")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("BalanceTransaction")]
    public virtual UserModelUsage? UserModelUsage { get; set; }
}
