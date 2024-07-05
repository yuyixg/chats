using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("InvitationCode")]
[Index("Value", Name = "InvitationCode_value_key", IsUnique = true)]
public partial class InvitationCode
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("value")]
    [StringLength(1000)]
    public string Value { get; set; } = null!;

    [Column("count")]
    public short Count { get; set; }

    [Column("createUserId")]
    public Guid CreateUserId { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("isDeleted")]
    public bool IsDeleted { get; set; }

    [InverseProperty("InvitationCode")]
    public virtual ICollection<UserInitialConfig> UserInitialConfigs { get; set; } = new List<UserInitialConfig>();

    [InverseProperty("InvitationCode")]
    public virtual ICollection<UserInvitation> UserInvitations { get; set; } = new List<UserInvitation>();
}
