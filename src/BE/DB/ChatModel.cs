using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("ChatModel")]
[Index("FileServiceId", Name = "IDX_ChatModels_fileServiceId")]
[Index("ModelKeysId", Name = "IDX_ChatModels_modelKeysId")]
public partial class ChatModel
{
    [Key]
    public Guid Id { get; set; }

    [StringLength(1000)]
    public string ModelProvider { get; set; } = null!;

    [StringLength(1000)]
    public string ModelVersion { get; set; } = null!;

    [StringLength(1000)]
    public string Name { get; set; } = null!;

    public int? Rank { get; set; }

    [StringLength(1000)]
    public string? Remarks { get; set; }

    public Guid ModelKeysId { get; set; }

    public Guid? FileServiceId { get; set; }

    [StringLength(2048)]
    public string? FileConfig { get; set; }

    [StringLength(2048)]
    public string ModelConfig { get; set; } = null!;

    [StringLength(2048)]
    public string PriceConfig { get; set; } = null!;

    public bool Enabled { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [InverseProperty("ChatModel")]
    public virtual ICollection<ApiUsage> ApiUsages { get; set; } = new List<ApiUsage>();

    [InverseProperty("ChatModel")]
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    [ForeignKey("FileServiceId")]
    [InverseProperty("ChatModels")]
    public virtual FileService? FileService { get; set; }

    [InverseProperty("ChatModel")]
    public virtual ICollection<MessageResponse> MessageResponses { get; set; } = new List<MessageResponse>();

    [ForeignKey("ModelKeysId")]
    [InverseProperty("ChatModels")]
    public virtual ModelKey ModelKeys { get; set; } = null!;

    [ForeignKey("ModelId")]
    [InverseProperty("Models")]
    public virtual ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
}
