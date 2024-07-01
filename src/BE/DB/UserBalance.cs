using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("UserId", Name = "IDX_UserBalances_userId")]
[Index("UserId", Name = "UserBalances_userId_key", IsUnique = true)]
public partial class UserBalance
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("balance", TypeName = "decimal(32, 16)")]
    public decimal Balance { get; set; }

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserBalance")]
    public virtual User User { get; set; } = null!;
}
