using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentUTF8")]
public partial class MessageContentUtf8
{
    [Key]
    public long Id { get; set; }

    [Unicode(false)]
    public string Content { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("MessageContentUtf8")]
    public virtual MessageContent IdNavigation { get; set; } = null!;
}
