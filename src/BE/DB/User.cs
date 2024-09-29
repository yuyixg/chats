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

    [InverseProperty("User")]
    public virtual ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();

    [InverseProperty("User")]
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    [InverseProperty("CreateUser")]
    public virtual ICollection<Prompt2> Prompt2s { get; set; } = new List<Prompt2>();

    [InverseProperty("CreateUser")]
    public virtual ICollection<Prompt> Prompts { get; set; } = new List<Prompt>();

    [InverseProperty("User")]
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    [InverseProperty("CreditUser")]
    public virtual ICollection<TransactionLog> TransactionLogCreditUsers { get; set; } = new List<TransactionLog>();

    [InverseProperty("User")]
    public virtual ICollection<TransactionLog> TransactionLogUsers { get; set; } = new List<TransactionLog>();

    [InverseProperty("User")]
    public virtual UserBalance? UserBalance { get; set; }

    [InverseProperty("User")]
    public virtual UserInvitation? UserInvitation { get; set; }

    [InverseProperty("User")]
    public virtual UserModel? UserModel { get; set; }
}
