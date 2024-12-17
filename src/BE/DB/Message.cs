using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Message")]
[Index("ChatId", "SpanId", Name = "IX_Message_ChatSpan")]
[Index("UsageId", Name = "IX_Message_Usage", IsUnique = true)]
public partial class Message
{
    [Key]
    public long Id { get; set; }

    public int ChatId { get; set; }

    public byte SpanId { get; set; }

    public long? ParentId { get; set; }

    public byte ChatRoleId { get; set; }

    public long? UsageId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ChatId")]
    [InverseProperty("Messages")]
    public virtual Chat Chat { get; set; } = null!;

    [ForeignKey("ChatRoleId")]
    [InverseProperty("Messages")]
    public virtual ChatRole ChatRole { get; set; } = null!;

    [ForeignKey("ChatId, SpanId")]
    [InverseProperty("Messages")]
    public virtual ChatSpan ChatSpan { get; set; } = null!;

    [InverseProperty("Parent")]
    public virtual ICollection<Message> InverseParent { get; set; } = new List<Message>();

    [InverseProperty("Message")]
    public virtual ICollection<MessageContent> MessageContents { get; set; } = new List<MessageContent>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Message? Parent { get; set; }

    [ForeignKey("UsageId")]
    [InverseProperty("Message")]
    public virtual UserModelUsage? Usage { get; set; }
}
