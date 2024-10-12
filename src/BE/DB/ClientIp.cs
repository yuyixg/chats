using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ClientIP")]
[Index("Ipaddress", Name = "IX_ClientIP_IPAddress", IsUnique = true)]
public partial class ClientIp
{
    [Key]
    public int Id { get; set; }

    [Column("IPAddress")]
    [StringLength(40)]
    [Unicode(false)]
    public string Ipaddress { get; set; } = null!;

    [InverseProperty("ClientIp")]
    public virtual ICollection<SmsAttempt> SmsAttempts { get; set; } = new List<SmsAttempt>();
}
