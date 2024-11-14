using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("User")]
public partial class User
{
    [Key]
    public Guid Id { get; set; }

    [StringLength(1000)]
    public string? Avatar { get; set; }

    [StringLength(1000)]
    public string Account { get; set; } = null!;

    [StringLength(1000)]
    public string Username { get; set; } = null!;

    [StringLength(1000)]
    public string? Password { get; set; }

    [StringLength(1000)]
    public string? Email { get; set; }

    [StringLength(1000)]
    public string? Phone { get; set; }

    [StringLength(1000)]
    public string Role { get; set; } = null!;

    public bool Enabled { get; set; }

    [StringLength(1000)]
    public string? Provider { get; set; }

    [StringLength(1000)]
    public string? Sub { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [InverseProperty("CreditUser")]
    public virtual ICollection<BalanceTransaction> BalanceTransactionCreditUsers { get; set; } = new List<BalanceTransaction>();

    [InverseProperty("User")]
    public virtual ICollection<BalanceTransaction> BalanceTransactionUsers { get; set; } = new List<BalanceTransaction>();

    [InverseProperty("User")]
    public virtual ICollection<Chat> Chats { get; set; } = new List<Chat>();

    [InverseProperty("CreateUser")]
    public virtual ICollection<Prompt> Prompts { get; set; } = new List<Prompt>();

    [InverseProperty("User")]
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    [InverseProperty("User")]
    public virtual ICollection<UserApiKey> UserApiKeys { get; set; } = new List<UserApiKey>();

    [InverseProperty("User")]
    public virtual UserBalance? UserBalance { get; set; }

    [InverseProperty("User")]
    public virtual UserInvitation? UserInvitation { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<UserModel> UserModels { get; set; } = new List<UserModel>();
}
