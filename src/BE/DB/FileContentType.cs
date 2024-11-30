using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("FileContentType")]
public partial class FileContentType
{
    [Key]
    public short Id { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string ContentType { get; set; } = null!;

    [InverseProperty("FileContentType")]
    public virtual ICollection<File> Files { get; set; } = new List<File>();
}
