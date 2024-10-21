using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Conversation2")]
[Index("ModelId", Name = "IX_Conversation2_Model")]
[Index("UserId", Name = "IX_Conversation2_User")]
public partial class Conversation2
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
    public virtual ICollection<Message2> Message2s { get; set; } = new List<Message2>();

    [ForeignKey("ModelId")]
    [InverseProperty("Conversation2s")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Conversation2s")]
    public virtual User User { get; set; } = null!;
}
