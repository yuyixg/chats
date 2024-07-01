using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Index("FileServiceId", Name = "IDX_ChatModels_fileServiceId")]
[Index("ModelKeysId", Name = "IDX_ChatModels_modelKeysId")]
public partial class ChatModel
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("modelProvider")]
    [StringLength(1000)]
    public string ModelProvider { get; set; } = null!;

    [Column("modelVersion")]
    [StringLength(1000)]
    public string ModelVersion { get; set; } = null!;

    [Column("name")]
    [StringLength(1000)]
    public string Name { get; set; } = null!;

    [Column("rank")]
    public int? Rank { get; set; }

    [Column("remarks")]
    [StringLength(1000)]
    public string? Remarks { get; set; }

    [Column("modelKeysId")]
    public Guid? ModelKeysId { get; set; }

    [Column("fileServiceId")]
    public Guid? FileServiceId { get; set; }

    [Column("fileConfig")]
    [StringLength(2048)]
    public string? FileConfig { get; set; }

    [Column("modelConfig")]
    [StringLength(2048)]
    public string ModelConfig { get; set; } = null!;

    [Column("priceConfig")]
    [StringLength(2048)]
    public string PriceConfig { get; set; } = null!;

    [Column("enabled")]
    public bool Enabled { get; set; }

    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("ChatModel")]
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    [InverseProperty("ChatModel")]
    public virtual ICollection<Chat> Chats { get; set; } = new List<Chat>();

    [ForeignKey("FileServiceId")]
    [InverseProperty("ChatModels")]
    public virtual FileService? FileService { get; set; }

    [ForeignKey("ModelKeysId")]
    [InverseProperty("ChatModels")]
    public virtual ModelKey? ModelKeys { get; set; }
}
