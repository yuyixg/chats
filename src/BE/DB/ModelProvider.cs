using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

/// <summary>
/// JSON
/// </summary>
[Table("ModelProvider")]
[Index("Name", Name = "IX_ModelProvider")]
public partial class ModelProvider
{
    [Key]
    public short Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [StringLength(50)]
    public string DisplayName { get; set; } = null!;

    [StringLength(50)]
    [Unicode(false)]
    public string Icon { get; set; } = null!;

    [StringLength(2000)]
    [Unicode(false)]
    public string InitialConfig { get; set; } = null!;

    [InverseProperty("Provider")]
    public virtual ICollection<ModelDefault> ModelDefaults { get; set; } = new List<ModelDefault>();

    [InverseProperty("ModelProvider")]
    public virtual ICollection<ModelKey2> ModelKey2s { get; set; } = new List<ModelKey2>();
}
