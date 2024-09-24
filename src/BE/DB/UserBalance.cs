using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserBalance")]
[Index("UserId", Name = "IDX_UserBalances_userId")]
[Index("UserId", Name = "UserBalances_userId_key", IsUnique = true)]
public partial class UserBalance
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "decimal(32, 16)")]
    public decimal Balance { get; set; }

    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserBalance")]
    public virtual User User { get; set; } = null!;
}
