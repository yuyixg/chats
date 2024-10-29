using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserApiUsage")]
[Index("ApiKeyId", Name = "IX_ApiUsage2_ApiKey")]
[Index("ClientIpid", Name = "IX_ApiUsage2_ClientIP")]
[Index("ModelId", Name = "IX_ApiUsage2_Model")]
[Index("TransactionLogId", Name = "IX_ApiUsage2_TransactionLog", IsUnique = true)]
[Index("UserModelTransactionLogId", Name = "IX_ApiUsage2_UserModelTransactionLog", IsUnique = true)]
public partial class UserApiUsage
{
    [Key]
    public long Id { get; set; }

    public int ApiKeyId { get; set; }

    public short ModelId { get; set; }

    public int InputTokenCount { get; set; }

    public int OutputTokenCount { get; set; }

    public int DurationMs { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal InputCost { get; set; }

    [Column(TypeName = "decimal(14, 8)")]
    public decimal OutputCost { get; set; }

    public long? TransactionLogId { get; set; }

    public long? UserModelTransactionLogId { get; set; }

    [Column("ClientIPId")]
    public int ClientIpid { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ApiKeyId")]
    [InverseProperty("UserApiUsages")]
    public virtual UserApiKey ApiKey { get; set; } = null!;

    [ForeignKey("ClientIpid")]
    [InverseProperty("UserApiUsages")]
    public virtual ClientIp ClientIp { get; set; } = null!;

    [ForeignKey("ModelId")]
    [InverseProperty("UserApiUsages")]
    public virtual Model Model { get; set; } = null!;

    [ForeignKey("TransactionLogId")]
    [InverseProperty("UserApiUsage")]
    public virtual TransactionLog? TransactionLog { get; set; }

    [ForeignKey("UserModelTransactionLogId")]
    [InverseProperty("UserApiUsage")]
    public virtual UserModelTransactionLog? UserModelTransactionLog { get; set; }
}
