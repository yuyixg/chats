using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserModel2")]
[Index("ModelId", Name = "IX_UserModel2_ModelId")]
[Index("UserId", Name = "IX_UserModel2_UserId")]
public partial class UserModel2
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public short ModelId { get; set; }

    public DateTime ExpiresAt { get; set; }

    public int TokenBalance { get; set; }

    public int CountBalance { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ModelId")]
    [InverseProperty("UserModel2s")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserModel2s")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("UserModelTransactionLog")]
    public virtual ICollection<UserModelTransactionLog> UserModelTransactionLogs { get; set; } = new List<UserModelTransactionLog>();
}
