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
public partial class ModelProvider
{
    [Key]
    [StringLength(50)]
    [Unicode(false)]
    public string Provider { get; set; } = null!;

    [StringLength(50)]
    public string DisplayName { get; set; } = null!;

    [StringLength(50)]
    [Unicode(false)]
    public string Icon { get; set; } = null!;

    [StringLength(2000)]
    [Unicode(false)]
    public string InitialConfig { get; set; } = null!;
}
