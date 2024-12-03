using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Tokenizer")]
[Index("Name", Name = "IX_Tokenizer", IsUnique = true)]
public partial class Tokenizer
{
    [Key]
    public short Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [InverseProperty("Tokenizer")]
    public virtual ICollection<ModelReference> ModelReferences { get; set; } = new List<ModelReference>();
}
