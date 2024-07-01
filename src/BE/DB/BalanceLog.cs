using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class BalanceLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("createUserId")]
    public Guid CreateUserId { get; set; }

    [Column("value", TypeName = "decimal(32, 16)")]
    public decimal Value { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [Column("messageId")]
    public Guid? MessageId { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("BalanceLogs")]
    public virtual ChatMessage? Message { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("BalanceLogs")]
    public virtual User User { get; set; } = null!;
}
