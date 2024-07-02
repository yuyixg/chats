using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserInvitation")]
[Index("InvitationCodeId", Name = "IX_UserInvitation_InvitationCodeId")]
[Index("UserId", Name = "IX_UserInvitation_UserId")]
public partial class UserInvitation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("userId")]
    public Guid UserId { get; set; }

    [Column("invitationCodeId")]
    public Guid InvitationCodeId { get; set; }

    [ForeignKey("InvitationCodeId")]
    [InverseProperty("UserInvitations")]
    public virtual InvitationCode InvitationCode { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserInvitations")]
    public virtual User User { get; set; } = null!;
}
