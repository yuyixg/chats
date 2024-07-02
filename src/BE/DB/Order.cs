using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("CreateUserId", Name = "IDX_Orders_createUserId")]
public partial class Order
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("createUserId")]
    public Guid CreateUserId { get; set; }

    [Column("amount")]
    public int Amount { get; set; }

    [Column("outTradeNo")]
    [StringLength(1000)]
    public string OutTradeNo { get; set; } = null!;

    [Column("status")]
    [StringLength(1000)]
    public string Status { get; set; } = null!;

    [Column("payH5Url")]
    [StringLength(1000)]
    public string? PayH5url { get; set; }

    [Column("prepayId")]
    [StringLength(1000)]
    public string? PrepayId { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CreateUserId")]
    [InverseProperty("Orders")]
    public virtual User CreateUser { get; set; } = null!;
}
