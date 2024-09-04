using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Message")]
[Index("ConversationId", Name = "IX_Message_Conversation")]
[Index("UserId", Name = "IX_Message_User")]
public partial class Message
{
    [Key]
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public int ConversationId { get; set; }

    public long? ParentId { get; set; }

    public byte ChatRoleId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ChatRoleId")]
    [InverseProperty("Messages")]
    public virtual ChatRole ChatRole { get; set; } = null!;

    [ForeignKey("ConversationId")]
    [InverseProperty("Messages")]
    public virtual Conversation Conversation { get; set; } = null!;

    [InverseProperty("Parent")]
    public virtual ICollection<Message> InverseParent { get; set; } = new List<Message>();

    [InverseProperty("Message")]
    public virtual ICollection<MessageContent> MessageContents { get; set; } = new List<MessageContent>();

    [InverseProperty("Message")]
    public virtual MessageResponse? MessageResponse { get; set; }

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual Message? Parent { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Messages")]
    public virtual User User { get; set; } = null!;
}
