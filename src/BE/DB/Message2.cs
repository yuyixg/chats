using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Message2")]
[Index("ConversationId", Name = "IX_Message2_Conversation")]
public partial class Message2
{
    [Key]
    public long Id { get; set; }

    public int ConversationId { get; set; }

    public long? ParentId { get; set; }

    public byte ChatRoleId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ChatRoleId")]
    [InverseProperty("Message2s")]
    public virtual ChatRole ChatRole { get; set; } = null!;

    [ForeignKey("ConversationId")]
    [InverseProperty("Message2s")]
    public virtual Conversation2 Conversation { get; set; } = null!;

    [InverseProperty("Parent")]
    public virtual ICollection<Message2> InverseParent { get; set; } = new List<Message2>();

    [InverseProperty("Message")]
    public virtual ICollection<MessageContent2> MessageContent2s { get; set; } = new List<MessageContent2>();

    [InverseProperty("Message")]
    public virtual MessageResponse2? MessageResponse2 { get; set; }

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Message2? Parent { get; set; }
}
