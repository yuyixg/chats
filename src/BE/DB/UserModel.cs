using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("UserId", Name = "IX_UserModels_UserId", IsUnique = true)]
public partial class UserModel
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    [StringLength(8000)]
    [Unicode(false)]
    public string Models { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserModel")]
    public virtual User User { get; set; } = null!;
}
