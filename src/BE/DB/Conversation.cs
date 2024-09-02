using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Conversation")]
[Index("ChatModelId", Name = "IX_Conversation_ChatModel")]
[Index("UserId", Name = "IX_Conversation_User")]
public partial class Conversation
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Title { get; set; } = null!;

    public Guid UserId { get; set; }

    public Guid ChatModelId { get; set; }

    public double? Temperature { get; set; }

    public bool? EnableSearch { get; set; }

    public bool IsShared { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ChatModelId")]
    [InverseProperty("Conversations")]
    public virtual ChatModel ChatModel { get; set; } = null!;

    [InverseProperty("Conversation")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("UserId")]
    [InverseProperty("Conversations")]
    public virtual User User { get; set; } = null!;
}
