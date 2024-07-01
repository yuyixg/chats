using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("UserId", Name = "IDX_UserModels_userId")]
public partial class UserModel
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("models")]
    [StringLength(8000)]
    [Unicode(false)]
    public string Models { get; set; } = null!;

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserModels")]
    public virtual User User { get; set; } = null!;
}
