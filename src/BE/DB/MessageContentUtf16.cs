using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentUTF16")]
public partial class MessageContentUtf16
{
    [Key]
    public long Id { get; set; }

    public string Content { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("MessageContentUtf16")]
    public virtual MessageContent IdNavigation { get; set; } = null!;
}
