using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[PrimaryKey("ChatId", "SpanId")]
[Table("ChatSpan")]
[Index("ModelId", Name = "IX_ChatSpan_Model")]
public partial class ChatSpan
{
    [Key]
    public int ChatId { get; set; }

    [Key]
    public byte SpanId { get; set; }

    public short ModelId { get; set; }

    public float? Temperature { get; set; }

    public bool EnableSearch { get; set; }

    [ForeignKey("ChatId")]
    [InverseProperty("ChatSpans")]
    public virtual Chat Chat { get; set; } = null!;

    [InverseProperty("ChatSpan")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [ForeignKey("ModelId")]
    [InverseProperty("ChatSpans")]
    public virtual Model Model { get; set; } = null!;
}
