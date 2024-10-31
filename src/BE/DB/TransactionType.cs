using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("TransactionType")]
public partial class TransactionType
{
    [Key]
    public byte Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [InverseProperty("TransactionType")]
    public virtual ICollection<TransactionLog> TransactionLogs { get; set; } = new List<TransactionLog>();

    [InverseProperty("TransactionType")]
    public virtual ICollection<UserModelTransactionLog> UserModelTransactionLogs { get; set; } = new List<UserModelTransactionLog>();
}
