using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserApiUsage")]
[Index("ApiKeyId", Name = "IX_UserApiUsage_ApiKey")]
[Index("ClientInfoId", Name = "IX_UserApiUsage_ClientInfo")]
[Index("ModelId", Name = "IX_UserApiUsage_Model")]
[Index("TransactionLogId", Name = "IX_UserApiUsage_TransactionLog", IsUnique = true)]
[Index("UserModelTransactionLogId", Name = "IX_UserApiUsage_UserModelTransactionLog", IsUnique = true)]
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

    public int ClientInfoId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("ApiKeyId")]
    [InverseProperty("UserApiUsages")]
    public virtual UserApiKey ApiKey { get; set; } = null!;

    [ForeignKey("ClientInfoId")]
    [InverseProperty("UserApiUsages")]
    public virtual ClientInfo ClientInfo { get; set; } = null!;

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
