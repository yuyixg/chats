using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

[Table("Model")]
[Index("FileServiceId", Name = "IX_Model_FileServiceId")]
[Index("ModelKeyId", Name = "IX_Model_ModelKeyId")]
[Index("ModelReferenceId", Name = "IX_Model_ModelReferenceId")]
[Index("Name", Name = "IX_Model_Name", IsUnique = true)]
[Index("Order", Name = "IX_Model_Order")]
public partial class Model
{
    [Key]
    public short Id { get; set; }

    public short ModelKeyId { get; set; }

    public int ModelReferenceId { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [StringLength(50)]
    public string? DeploymentName { get; set; }

    public short? Order { get; set; }

    public Guid? FileServiceId { get; set; }

    [Column(TypeName = "decimal(9, 5)")]
    public decimal PromptTokenPrice1M { get; set; }

    [Column(TypeName = "decimal(9, 5)")]
    public decimal ResponseTokenPrice1M { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Model")]
    public virtual ICollection<ApiUsage2> ApiUsage2s { get; set; } = new List<ApiUsage2>();

    [InverseProperty("Model")]
    public virtual ICollection<Conversation2> Conversation2s { get; set; } = new List<Conversation2>();

    [InverseProperty("Model")]
    public virtual ICollection<MessageResponse2> MessageResponse2s { get; set; } = new List<MessageResponse2>();

    [ForeignKey("ModelKeyId")]
    [InverseProperty("Models")]
    public virtual ModelKey2 ModelKey { get; set; } = null!;

    [ForeignKey("ModelReferenceId")]
    [InverseProperty("Models")]
    public virtual ModelReference ModelReference { get; set; } = null!;

    [InverseProperty("Model")]
    public virtual ICollection<UserModel2> UserModel2s { get; set; } = new List<UserModel2>();

    [ForeignKey("ModelId")]
    [InverseProperty("Models")]
    public virtual ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
}
