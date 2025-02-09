using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ReasoningResponseKind")]
public partial class ReasoningResponseKind
{
    [Key]
    public byte Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [InverseProperty("ReasoningResponseKind")]
    public virtual ICollection<ModelReference> ModelReferences { get; set; } = new List<ModelReference>();
}
