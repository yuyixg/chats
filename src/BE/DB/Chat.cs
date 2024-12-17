using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Chat")]
[Index("UserId", Name = "IX_Chat_UserId")]
public partial class Chat
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Title { get; set; } = null!;

    public bool IsShared { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    public int UserId { get; set; }

    [InverseProperty("Chat")]
    public virtual ICollection<ChatSpan> ChatSpans { get; set; } = new List<ChatSpan>();

    [InverseProperty("Chat")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("UserId")]
    [InverseProperty("Chats")]
    public virtual User User { get; set; } = null!;
}
