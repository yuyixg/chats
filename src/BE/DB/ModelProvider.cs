﻿using System;
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

    [StringLength(500)]
    [Unicode(false)]
    public string? Host { get; set; }

    [StringLength(500)]
    [Unicode(false)]
    public string? ApiKey { get; set; }

    [InverseProperty("ModelProvider")]
    public virtual ICollection<ModelKey> ModelKeys { get; set; } = new List<ModelKey>();

    [InverseProperty("Provider")]
    public virtual ICollection<ModelReference> ModelReferences { get; set; } = new List<ModelReference>();
}
