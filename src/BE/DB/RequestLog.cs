using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("UserId", Name = "IDX_RequestLogs_userId")]
public partial class RequestLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("ip")]
    [StringLength(1000)]
    public string? Ip { get; set; }

    [Column("userId")]
    public Guid? UserId { get; set; }

    [Column("url")]
    [StringLength(1000)]
    public string Url { get; set; } = null!;

    [Column("method")]
    [StringLength(1000)]
    public string Method { get; set; } = null!;

    [Column("statusCode")]
    public int StatusCode { get; set; }

    [Column("responseTime")]
    [StringLength(1000)]
    public string ResponseTime { get; set; } = null!;

    [Column("requestTime")]
    [StringLength(1000)]
    public string RequestTime { get; set; } = null!;

    [Column("headers")]
    public string? Headers { get; set; }

    [Column("request")]
    public string? Request { get; set; }

    [Column("response")]
    public string? Response { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("RequestLogs")]
    public virtual User? User { get; set; }
}
