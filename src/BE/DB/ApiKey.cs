using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ApiKey")]
[Index("Key", Name = "IX_UserApiKey_Key", IsUnique = true)]
[Index("UserId", Name = "IX_UserApiKey_User")]
public partial class ApiKey
{
    [Key]
    public int Id { get; set; }

    public Guid UserId { get; set; }

    [StringLength(200)]
    [Unicode(false)]
    public string Key { get; set; } = null!;

    [StringLength(50)]
    public string? Comment { get; set; }

    public bool AllowEnumerate { get; set; }

    public bool AllowAllModels { get; set; }

    public DateTime Expires { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [InverseProperty("ApiKey")]
    public virtual ICollection<ApiUsage> ApiUsages { get; set; } = new List<ApiUsage>();

    [ForeignKey("UserId")]
    [InverseProperty("ApiKeys")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("ApiKeyId")]
    [InverseProperty("ApiKeys")]
    public virtual ICollection<ChatModel> Models { get; set; } = new List<ChatModel>();
}
