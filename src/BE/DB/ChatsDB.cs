using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class ChatsDB : DbContext
{
    public ChatsDB()
    {
    }

    public ChatsDB(DbContextOptions<ChatsDB> options)
        : base(options)
    {
    }

    public virtual DbSet<ApiKey> ApiKeys { get; set; }

    public virtual DbSet<ApiUsage> ApiUsages { get; set; }

    public virtual DbSet<ChatModel> ChatModels { get; set; }

    public virtual DbSet<ChatRole> ChatRoles { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<FileService> FileServices { get; set; }

    public virtual DbSet<InvitationCode> InvitationCodes { get; set; }

    public virtual DbSet<LoginService> LoginServices { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<MessageContent> MessageContents { get; set; }

    public virtual DbSet<MessageContentType> MessageContentTypes { get; set; }

    public virtual DbSet<MessageResponse> MessageResponses { get; set; }

    public virtual DbSet<ModelKey> ModelKeys { get; set; }

    public virtual DbSet<ModelProvider> ModelProviders { get; set; }

    public virtual DbSet<ModelSetting> ModelSettings { get; set; }

    public virtual DbSet<Prompt> Prompts { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Sms> Sms { get; set; }

    public virtual DbSet<TransactionLog> TransactionLogs { get; set; }

    public virtual DbSet<TransactionType> TransactionTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserBalance> UserBalances { get; set; }

    public virtual DbSet<UserInitialConfig> UserInitialConfigs { get; set; }

    public virtual DbSet<UserInvitation> UserInvitations { get; set; }

    public virtual DbSet<UserModel> UserModels { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:ChatsDB");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApiKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_UserApiKey");

            entity.HasOne(d => d.User).WithMany(p => p.ApiKeys)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserApiKey_Users");

            entity.HasMany(d => d.Models).WithMany(p => p.ApiKeys)
                .UsingEntity<Dictionary<string, object>>(
                    "ApiKeyModel",
                    r => r.HasOne<ChatModel>().WithMany()
                        .HasForeignKey("ModelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_ApiKeyModel_ChatModels"),
                    l => l.HasOne<ApiKey>().WithMany()
                        .HasForeignKey("ApiKeyId")
                        .HasConstraintName("FK_ApiKeyModel_ApiKey"),
                    j =>
                    {
                        j.HasKey("ApiKeyId", "ModelId");
                        j.ToTable("ApiKeyModel");
                    });
        });

        modelBuilder.Entity<ApiUsage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ApiKeyUsage");

            entity.HasOne(d => d.ApiKey).WithMany(p => p.ApiUsages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApiKeyUsage_ApiKey");

            entity.HasOne(d => d.ChatModel).WithMany(p => p.ApiUsages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApiKeyUsage_ChatModels");

            entity.HasOne(d => d.TransactionLog).WithOne(p => p.ApiUsage)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApiKeyUsage_TransactionLog");
        });

        modelBuilder.Entity<ChatModel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ChatModels_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.FileService).WithMany(p => p.ChatModels)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("ChatModels_fileServiceId_fkey");

            entity.HasOne(d => d.ModelKeys).WithMany(p => p.ChatModels)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("ChatModels_modelKeysId_fkey");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasOne(d => d.ChatModel).WithMany(p => p.Conversations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversation_ChatModels");

            entity.HasOne(d => d.User).WithMany(p => p.Conversations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversation_Users");
        });

        modelBuilder.Entity<FileService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("FileServices_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<InvitationCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("InvitationCode_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<LoginService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("LoginServices_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ChatMessage2");

            entity.HasOne(d => d.ChatRole).WithMany(p => p.Messages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Message_ChatRole");

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages).HasConstraintName("FK_Message_Conversation");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_Message_ParentMessage");
        });

        modelBuilder.Entity<MessageContent>(entity =>
        {
            entity.HasOne(d => d.ContentType).WithMany(p => p.MessageContents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MessageContent_MessageContentType");

            entity.HasOne(d => d.Message).WithMany(p => p.MessageContents).HasConstraintName("FK_MessageContent_Message");
        });

        modelBuilder.Entity<MessageContentType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MessageC__3214EC07D7BA864A");
        });

        modelBuilder.Entity<MessageResponse>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK_ChatMessageResponse");

            entity.Property(e => e.MessageId).ValueGeneratedNever();

            entity.HasOne(d => d.ChatModel).WithMany(p => p.MessageResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MessageResponse_ChatModels");

            entity.HasOne(d => d.Message).WithOne(p => p.MessageResponse).HasConstraintName("FK_MessageResponse_Message");

            entity.HasOne(d => d.TransactionLog).WithOne(p => p.MessageResponse).HasConstraintName("FK_MessageResponse_TransactionLog");
        });

        modelBuilder.Entity<ModelKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ModelKeys_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<ModelProvider>(entity =>
        {
            entity.ToTable("ModelProvider", tb => tb.HasComment("JSON"));
        });

        modelBuilder.Entity<ModelSetting>(entity =>
        {
            entity.HasOne(d => d.Provider).WithMany(p => p.ModelSettings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelSetting_ModelProvider");
        });

        modelBuilder.Entity<Prompt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Prompts_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.CreateUser).WithMany(p => p.Prompts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Prompts_createUserId_fkey");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sessions_userId");
        });

        modelBuilder.Entity<Sms>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Sms_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<TransactionLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_BalanceLog2");

            entity.HasOne(d => d.CreditUser).WithMany(p => p.TransactionLogCreditUsers).HasConstraintName("FK_BalanceLog2_CreditUser");

            entity.HasOne(d => d.TransactionType).WithMany(p => p.TransactionLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BalanceLog2_BalanceLogType");

            entity.HasOne(d => d.User).WithMany(p => p.TransactionLogUsers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BalanceLog2_Users");
        });

        modelBuilder.Entity<TransactionType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_BalanceLogType");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<UserBalance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UserBalances_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithOne(p => p.UserBalance)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("UserBalances_userId_fkey");
        });

        modelBuilder.Entity<UserInitialConfig>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UserInitialConfig_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.InvitationCode).WithMany(p => p.UserInitialConfigs).HasConstraintName("FK_UserInitialConfig_InvitationCode");
        });

        modelBuilder.Entity<UserInvitation>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.InvitationCodeId }).HasName("PK_UserInvitation_1");

            entity.HasOne(d => d.InvitationCode).WithMany(p => p.UserInvitations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserInvitation_InvitationCode");

            entity.HasOne(d => d.User).WithOne(p => p.UserInvitation)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserInvitation_Users");
        });

        modelBuilder.Entity<UserModel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UserModels_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithOne(p => p.UserModel)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("UserModels_userId_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
