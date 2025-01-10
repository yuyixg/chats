using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageResponse")]
[Index("UsageId", Name = "IX_MessageResponse_Usage", IsUnique = true)]
public partial class MessageResponse
{
    [Key]
    public long MessageId { get; set; }

    public long UsageId { get; set; }

    public bool? ReactionId { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("MessageResponse")]
    public virtual Message Message { get; set; } = null!;

    [ForeignKey("UsageId")]
    [InverseProperty("MessageResponse")]
    public virtual UserModelUsage Usage { get; set; } = null!;
}
