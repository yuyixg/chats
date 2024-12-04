using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("MessageContentFile")]
[Index("FileId", Name = "IX_MessageContentFile_FileId")]
public partial class MessageContentFile
{
    [Key]
    public long Id { get; set; }

    public int FileId { get; set; }

    [ForeignKey("FileId")]
    [InverseProperty("MessageContentFiles")]
    public virtual File File { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("MessageContentFile")]
    public virtual MessageContent IdNavigation { get; set; } = null!;
}
