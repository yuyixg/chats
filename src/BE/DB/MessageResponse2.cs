using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageResponse2")]
[Index("ModelId", Name = "IX_MessageResponse2_Model")]
[Index("TransactionLogId", Name = "IX_MessageResponse2_TransactionLog", IsUnique = true)]
[Index("UserModelTransactionLogId", Name = "IX_MessageResponse2_UserModelTransactionLogId")]
public partial class MessageResponse2
{
    [Key]
    public long MessageId { get; set; }

    public short ModelId { get; set; }

    public int InputTokenCount { get; set; }

    public int OutputTokenCount { get; set; }

    public int DurationMs { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal InputCost { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal OutputCost { get; set; }

    public long? TransactionLogId { get; set; }

    public long? UserModelTransactionLogId { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("MessageResponse2")]
    public virtual Message2 Message { get; set; } = null!;

    [ForeignKey("ModelId")]
    [InverseProperty("MessageResponse2s")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("TransactionLogId")]
    [InverseProperty("MessageResponse2")]
    public virtual TransactionLog? TransactionLog { get; set; }

    [ForeignKey("UserModelTransactionLogId")]
    [InverseProperty("MessageResponse2s")]
    public virtual UserModelTransactionLog? UserModelTransactionLog { get; set; }
}
