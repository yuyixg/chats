using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[PrimaryKey("UserId", "InvitationCodeId")]
[Table("UserInvitation")]
[Index("UserId", Name = "IX_UserInvitation_UserId", IsUnique = true)]
public partial class UserInvitation
{
    [Key]
    public Guid UserId { get; set; }

    [Key]
    public Guid InvitationCodeId { get; set; }

    [ForeignKey("InvitationCodeId")]
    [InverseProperty("UserInvitations")]
    public virtual InvitationCode InvitationCode { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserInvitation")]
    public virtual User User { get; set; } = null!;
}
