using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ClientInfo")]
[Index("ClientIpId", "ClientUserAgentId", Name = "IX_ClientInfo", IsUnique = true)]
public partial class ClientInfo
{
    [Key]
    public int Id { get; set; }

    public int ClientIpId { get; set; }

    public int ClientUserAgentId { get; set; }

    [InverseProperty("ClientInfo")]
    public virtual ICollection<MessageRequest> MessageRequests { get; set; } = new List<MessageRequest>();
}
