using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageResponse")]
[Index("ChatModelId", Name = "IX_MessageResponse_ChatModel")]
[Index("TransactionLogId", Name = "IX_MessageResponse_TransactionLog", IsUnique = true)]
public partial class MessageResponse
{
    [Key]
    public long MessageId { get; set; }

    public Guid ChatModelId { get; set; }

    public int InputTokenCount { get; set; }

    public int OutputTokenCount { get; set; }

    public int DurationMs { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal InputCost { get; init; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal OutputCost { get; init; }

    public long? TransactionLogId { get; set; }

    [ForeignKey("ChatModelId")]
    [InverseProperty("MessageResponses")]
    public virtual ChatModel ChatModel { get; set; } = null!;

    [ForeignKey("MessageId")]
    [InverseProperty("MessageResponse")]
    public virtual Message Message { get; set; } = null!;

    [ForeignKey("TransactionLogId")]
    [InverseProperty("MessageResponse")]
    public virtual TransactionLog? TransactionLog { get; set; }
}
