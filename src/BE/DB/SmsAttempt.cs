using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("SmsAttempt")]
[Index("ClientIpid", Name = "IX_SmsAttempt_ClientIPId")]
[Index("ClientUserAgentId", Name = "IX_SmsAttempt_ClientUserAgentId")]
[Index("SmsRecordId", Name = "IX_SmsAttempt_SmsHistoryId")]
public partial class SmsAttempt
{
    [Key]
    public int Id { get; set; }

    public int SmsRecordId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string Code { get; set; } = null!;

    [Column("ClientIPId")]
    public int ClientIpid { get; set; }

    public int ClientUserAgentId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ClientIpid")]
    [InverseProperty("SmsAttempts")]
    public virtual ClientIp ClientIp { get; set; } = null!;

    [ForeignKey("ClientUserAgentId")]
    [InverseProperty("SmsAttempts")]
    public virtual ClientUserAgent ClientUserAgent { get; set; } = null!;

    [ForeignKey("SmsRecordId")]
    [InverseProperty("SmsAttempts")]
    public virtual SmsRecord SmsRecord { get; set; } = null!;
}
