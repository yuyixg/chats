using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class Counterfoil
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("orderId")]
    public Guid OrderId { get; set; }

    [Column("info")]
    public string Info { get; set; } = null!;

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }
}
