using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Prompt2")]
[Index("CreateUserId", Name = "IX_Prompt2_CreateUserId")]
[Index("Name", Name = "IX_Prompt2_Name")]
public partial class Prompt2
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    public string Content { get; set; } = null!;

    public bool IsDefault { get; set; }

    public bool IsSystem { get; set; }

    public Guid CreateUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CreateUserId")]
    [InverseProperty("Prompt2s")]
    public virtual User CreateUser { get; set; } = null!;
}
