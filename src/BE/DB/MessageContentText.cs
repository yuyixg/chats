using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentText")]
public partial class MessageContentText
{
    [Key]
    public long Id { get; set; }

    public string Content { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("MessageContentText")]
    public virtual MessageContent IdNavigation { get; set; } = null!;
}
