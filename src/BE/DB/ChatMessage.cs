using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class ChatMessage
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("chatId")]
    public Guid ChatId { get; set; }

    [Column("parentId")]
    public Guid? ParentId { get; set; }

    [Column("chatModelId")]
    public Guid? ChatModelId { get; set; }

    [Column("role")]
    [StringLength(50)]
    [Unicode(false)]
    public string Role { get; set; } = null!;

    [Column("messages")]
    public string Messages { get; set; } = null!;

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("inputTokens")]
    public int InputTokens { get; set; }

    [Column("outputTokens")]
    public int OutputTokens { get; set; }

    [Column("duration")]
    public int Duration { get; set; }

    [Column("inputPrice", TypeName = "decimal(32, 16)")]
    public decimal InputPrice { get; set; }

    [Column("outputPrice", TypeName = "decimal(32, 16)")]
    public decimal OutputPrice { get; set; }

    [InverseProperty("Message")]
    public virtual ICollection<BalanceLog> BalanceLogs { get; set; } = new List<BalanceLog>();

    [ForeignKey("ChatId")]
    [InverseProperty("ChatMessages")]
    public virtual Chat Chat { get; set; } = null!;

    [ForeignKey("ChatModelId")]
    [InverseProperty("ChatMessages")]
    public virtual ChatModel? ChatModel { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<ChatMessage> InverseParent { get; set; } = new List<ChatMessage>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual ChatMessage? Parent { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ChatMessages")]
    public virtual User User { get; set; } = null!;
}
