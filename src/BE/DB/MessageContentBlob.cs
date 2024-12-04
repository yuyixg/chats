using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentBlob")]
public partial class MessageContentBlob
{
    [Key]
    public long Id { get; set; }

    public byte[] Content { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("MessageContentBlob")]
    public virtual MessageContent IdNavigation { get; set; } = null!;
}
