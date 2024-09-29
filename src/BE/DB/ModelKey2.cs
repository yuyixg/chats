using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ModelKey2")]
[Index("ModelProviderId", Name = "IX_ModelKey2_ModelProviderId")]
public partial class ModelKey2
{
    [Key]
    public int Id { get; set; }

    public short ModelProviderId { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    [Unicode(false)]
    public string? Host { get; set; }

    [StringLength(500)]
    [Unicode(false)]
    public string? ApiKey { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ModelProviderId")]
    [InverseProperty("ModelKey2s")]
    public virtual ModelProvider ModelProvider { get; set; } = null!;
}
