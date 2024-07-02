using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class Sm
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("signName")]
    [StringLength(50)]
    public string SignName { get; set; } = null!;

    [Column("type")]
    public short Type { get; set; }

    [Column("status")]
    public short Status { get; set; }

    [Column("code")]
    [StringLength(10)]
    public string Code { get; set; } = null!;

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }
}
