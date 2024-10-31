using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContent2")]
[Index("MessageId", Name = "IX_MessageContent2_Message")]
public partial class MessageContent2
{
    [Key]
    public long Id { get; set; }

    public byte ContentTypeId { get; set; }

    public long MessageId { get; set; }

    public byte[] Content { get; set; } = null!;

    [ForeignKey("ContentTypeId")]
    [InverseProperty("MessageContent2s")]
    public virtual MessageContentType ContentType { get; set; } = null!;

    [ForeignKey("MessageId")]
    [InverseProperty("MessageContent2s")]
    public virtual Message2 Message { get; set; } = null!;
}
