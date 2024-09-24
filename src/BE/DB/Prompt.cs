using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class Prompt
{
    [Key]
    public Guid Id { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    public short Type { get; set; }

    public string? Content { get; set; }

    [StringLength(100)]
    public string? Description { get; set; }

    public Guid CreateUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CreateUserId")]
    [InverseProperty("Prompts")]
    public virtual User CreateUser { get; set; } = null!;
}
