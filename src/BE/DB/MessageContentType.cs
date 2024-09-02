using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentType")]
public partial class MessageContentType
{
    [Key]
    public byte Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string ContentType { get; set; } = null!;

    [InverseProperty("ContentType")]
    public virtual ICollection<MessageContent> MessageContents { get; set; } = new List<MessageContent>();
}
