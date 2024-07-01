using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class Prompt
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("type")]
    public short Type { get; set; }

    [Column("content")]
    public string? Content { get; set; }

    [Column("description")]
    [StringLength(100)]
    public string? Description { get; set; }

    [Column("createUserId")]
    public Guid CreateUserId { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CreateUserId")]
    [InverseProperty("Prompts")]
    public virtual User CreateUser { get; set; } = null!;
}
