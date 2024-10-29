using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageRequest")]
[Index("ClientInfoId", Name = "IX_MessageRequest")]
public partial class MessageRequest
{
    [Key]
    public long MessageId { get; set; }

    public int ClientInfoId { get; set; }

    [ForeignKey("ClientInfoId")]
    [InverseProperty("MessageRequests")]
    public virtual ClientInfo ClientInfo { get; set; } = null!;

    [ForeignKey("MessageId")]
    [InverseProperty("MessageRequest")]
    public virtual Message2 Message { get; set; } = null!;
}
