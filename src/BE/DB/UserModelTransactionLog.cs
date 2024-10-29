using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("UserModelTransactionLog")]
[Index("UserModelId", Name = "IX_UserModelTransactionLog_UserModelId")]
public partial class UserModelTransactionLog
{
    [Key]
    public long Id { get; set; }

    public int UserModelId { get; set; }

    public byte TransactionTypeId { get; set; }

    public int TokenAmount { get; set; }

    public int CountAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("UserModelTransactionLog")]
    public virtual ICollection<MessageResponse2> MessageResponse2s { get; set; } = new List<MessageResponse2>();

    [ForeignKey("TransactionTypeId")]
    [InverseProperty("UserModelTransactionLogs")]
    public virtual TransactionType TransactionType { get; set; } = null!;

    [InverseProperty("UserModelTransactionLog")]
    public virtual UserApiUsage? UserApiUsage { get; set; }

    [ForeignKey("UserModelId")]
    [InverseProperty("UserModelTransactionLogs")]
    public virtual UserModel2 UserModel { get; set; } = null!;
}
