using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserInitialConfig")]
public partial class UserInitialConfig
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("loginType")]
    [StringLength(50)]
    public string? LoginType { get; set; }

    [Column("price", TypeName = "decimal(32, 16)")]
    public decimal Price { get; set; }

    [Column("models")]
    [StringLength(4000)]
    public string Models { get; set; } = null!;

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [Column("invitationCodeId")]
    public Guid? InvitationCodeId { get; set; }
}
