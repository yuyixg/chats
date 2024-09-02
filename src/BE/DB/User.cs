using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("avatar")]
    [StringLength(1000)]
    public string? Avatar { get; set; }

    [Column("account")]
    [StringLength(1000)]
    public string Account { get; set; } = null!;

    [Column("username")]
    [StringLength(1000)]
    public string Username { get; set; } = null!;

    [Column("password")]
    [StringLength(1000)]
    public string? Password { get; set; }

    [Column("email")]
    [StringLength(1000)]
    public string? Email { get; set; }

    [Column("phone")]
    [StringLength(1000)]
    public string? Phone { get; set; }

    [Column("role")]
    [StringLength(1000)]
    public string Role { get; set; } = null!;

    [Column("enabled")]
    public bool Enabled { get; set; }

    [Column("provider")]
    [StringLength(1000)]
    public string? Provider { get; set; }

    [Column("sub")]
    [StringLength(1000)]
    public string? Sub { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    [InverseProperty("User")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    [InverseProperty("CreateUser")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [InverseProperty("CreateUser")]
    public virtual ICollection<Prompt> Prompts { get; set; } = new List<Prompt>();

    [InverseProperty("User")]
    public virtual ICollection<RequestLog> RequestLogs { get; set; } = new List<RequestLog>();

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
