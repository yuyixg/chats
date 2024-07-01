using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("ChatModelId", Name = "IX_Chats_ChatModelId")]
[Index("UserId", Name = "IX_Chats_UserId")]
public partial class Chat
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("title")]
    [StringLength(50)]
    public string Title { get; set; } = null!;

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("chatModelId")]
    public Guid? ChatModelId { get; set; }

    [Column("userModelConfig")]
    public string UserModelConfig { get; set; } = null!;

    [Column("isShared")]
    public bool IsShared { get; set; }

    [Column("isDeleted")]
    public bool IsDeleted { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Chat")]
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    [ForeignKey("ChatModelId")]
    [InverseProperty("Chats")]
    public virtual ChatModel? ChatModel { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Chats")]
    public virtual User User { get; set; } = null!;
}
