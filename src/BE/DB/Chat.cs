using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Chat")]
[Index("ModelId", Name = "IX_Conversation2_Model")]
[Index("UserId", Name = "IX_Conversation2_User")]
public partial class Chat
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Title { get; set; } = null!;

    public Guid UserId { get; set; }

    public short ModelId { get; set; }

    public float? Temperature { get; set; }

    public bool? EnableSearch { get; set; }

    public bool IsShared { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("Conversation")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("ModelId")]
    [InverseProperty("Chats")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Chats")]
    public virtual User User { get; set; } = null!;
}
