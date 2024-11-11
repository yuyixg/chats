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

    public virtual DbSet<ChatRole> ChatRoles { get; set; }

    public virtual DbSet<ClientInfo> ClientInfos { get; set; }

    public virtual DbSet<ClientIp> ClientIps { get; set; }

    public virtual DbSet<ClientUserAgent> ClientUserAgents { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<Conversation2> Conversation2s { get; set; }

    public virtual DbSet<CurrencyRate> CurrencyRates { get; set; }

    public virtual DbSet<FileService> FileServices { get; set; }

    public virtual DbSet<InvitationCode> InvitationCodes { get; set; }

    public virtual DbSet<LoginService> LoginServices { get; set; }

    public virtual DbSet<Message2> Message2s { get; set; }

    public virtual DbSet<MessageContent2> MessageContent2s { get; set; }

    public virtual DbSet<MessageContentType> MessageContentTypes { get; set; }

    public virtual DbSet<Model> Models { get; set; }

    public virtual DbSet<ModelKey> ModelKeys { get; set; }

    public virtual DbSet<ModelKey2> ModelKey2s { get; set; }

    public virtual DbSet<ModelProvider> ModelProviders { get; set; }

    public virtual DbSet<ModelReference> ModelReferences { get; set; }

    public virtual DbSet<Prompt> Prompts { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<SmsAttempt> SmsAttempts { get; set; }

    public virtual DbSet<SmsRecord> SmsRecords { get; set; }

    public virtual DbSet<SmsStatus> SmsStatuses { get; set; }

    public virtual DbSet<SmsType> SmsTypes { get; set; }

    public virtual DbSet<Tokenizer> Tokenizers { get; set; }

    public virtual DbSet<TransactionLog> TransactionLogs { get; set; }

    public virtual DbSet<TransactionType> TransactionTypes { get; set; }

    public virtual DbSet<UsageTransactionLog> UsageTransactionLogs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserApiKey> UserApiKeys { get; set; }

    public virtual DbSet<UserApiUsage> UserApiUsages { get; set; }

    public virtual DbSet<UserBalance> UserBalances { get; set; }

    public virtual DbSet<UserInitialConfig> UserInitialConfigs { get; set; }

    public virtual DbSet<UserInvitation> UserInvitations { get; set; }

    public virtual DbSet<UserModel2> UserModel2s { get; set; }

    public virtual DbSet<UserModelUsage> UserModelUsages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:ChatsDB");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ClientInfo>(entity =>
        {
            entity.HasOne(d => d.ClientIp).WithMany(p => p.ClientInfos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ClientInfo_ClientIP");

            entity.HasOne(d => d.ClientUserAgent).WithMany(p => p.ClientInfos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ClientInfo_ClientUserAgent");
        });

        modelBuilder.Entity<Config>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_Configs");
        });

        modelBuilder.Entity<Conversation2>(entity =>
        {
            entity.HasOne(d => d.Model).WithMany(p => p.Conversation2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversation2_Model");

            entity.HasOne(d => d.User).WithMany(p => p.Conversation2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Conversation2_Users");
        });

        modelBuilder.Entity<CurrencyRate>(entity =>
        {
            entity.Property(e => e.Code).IsFixedLength();
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

        modelBuilder.Entity<Message2>(entity =>
        {
            entity.HasOne(d => d.ChatRole).WithMany(p => p.Message2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Message2_ChatRole");

            entity.HasOne(d => d.Conversation).WithMany(p => p.Message2s).HasConstraintName("FK_Message2_Conversation");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_Message2_ParentMessage");

            entity.HasOne(d => d.Usage).WithOne(p => p.Message2).HasConstraintName("FK_Message2_UserModelUsage");
        });

        modelBuilder.Entity<MessageContent2>(entity =>
        {
            entity.HasOne(d => d.ContentType).WithMany(p => p.MessageContent2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_MessageContent2_MessageContentType");

            entity.HasOne(d => d.Message).WithMany(p => p.MessageContent2s).HasConstraintName("FK_MessageContent2_Message");
        });

        modelBuilder.Entity<MessageContentType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MessageC__3214EC07D7BA864A");
        });

        modelBuilder.Entity<Model>(entity =>
        {
            entity.HasOne(d => d.FileService).WithMany(p => p.Models).HasConstraintName("FK_Model_FileService");

            entity.HasOne(d => d.ModelKey).WithMany(p => p.Models)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Model_ModelKey2");

            entity.HasOne(d => d.ModelReference).WithMany(p => p.Models)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Model_ModelReference");
        });

        modelBuilder.Entity<ModelKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ModelKeys_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<ModelKey2>(entity =>
        {
            entity.HasOne(d => d.ModelProvider).WithMany(p => p.ModelKey2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelKey2_ModelProvider");
        });

        modelBuilder.Entity<ModelProvider>(entity =>
        {
            entity.ToTable("ModelProvider", tb => tb.HasComment("JSON"));
        });

        modelBuilder.Entity<ModelReference>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ModelSetting");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CurrencyCode).IsFixedLength();

            entity.HasOne(d => d.CurrencyCodeNavigation).WithMany(p => p.ModelReferences)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelReference_CurrencyRate");

            entity.HasOne(d => d.Provider).WithMany(p => p.ModelReferences)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelSetting_ModelProvider");

            entity.HasOne(d => d.Tokenizer).WithMany(p => p.ModelReferences).HasConstraintName("FK_ModelReference_Tokenizer");
        });

        modelBuilder.Entity<Prompt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Prompt2");

            entity.HasOne(d => d.CreateUser).WithMany(p => p.Prompts).HasConstraintName("FK_Prompt2_User");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Sessions");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sessions_userId");
        });

        modelBuilder.Entity<SmsAttempt>(entity =>
        {
            entity.HasOne(d => d.ClientInfo).WithMany(p => p.SmsAttempts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SmsAttempt_ClientInfo");

            entity.HasOne(d => d.SmsRecord).WithMany(p => p.SmsAttempts).HasConstraintName("FK_SmsAttempt_SmsHistory");
        });

        modelBuilder.Entity<SmsRecord>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_SmsHistory");

            entity.HasOne(d => d.Status).WithMany(p => p.SmsRecords)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SmsHistory_SmsStatus");

            entity.HasOne(d => d.Type).WithMany(p => p.SmsRecords)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SmsHistory_SmsType");
        });

        modelBuilder.Entity<Tokenizer>(entity =>
        {
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

        modelBuilder.Entity<UsageTransactionLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_UserModelTransactionLog");

            entity.HasOne(d => d.TransactionType).WithMany(p => p.UsageTransactionLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserModelTransactionLog_TransactionType");

            entity.HasOne(d => d.UserModel).WithMany(p => p.UsageTransactionLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserModelTransactionLog_UserModel2");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<UserApiKey>(entity =>
        {
            entity.HasOne(d => d.User).WithMany(p => p.UserApiKeys)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserApiKey_Users");

            entity.HasMany(d => d.Models).WithMany(p => p.ApiKeys)
                .UsingEntity<Dictionary<string, object>>(
                    "UserApiModel",
                    r => r.HasOne<Model>().WithMany()
                        .HasForeignKey("ModelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_ApiKeyModel2_Model"),
                    l => l.HasOne<UserApiKey>().WithMany()
                        .HasForeignKey("ApiKeyId")
                        .HasConstraintName("FK_ApiKeyModel2_ApiKey"),
                    j =>
                    {
                        j.HasKey("ApiKeyId", "ModelId").HasName("PK_ApiKeyModel2");
                        j.ToTable("UserApiModel");
                    });
        });

        modelBuilder.Entity<UserApiUsage>(entity =>
        {
            entity.HasOne(d => d.ApiKey).WithMany(p => p.UserApiUsages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApiUsage2_ApiKey");

            entity.HasOne(d => d.Usage).WithOne(p => p.UserApiUsage)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserApiUsage_UserModelUsage");
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

        modelBuilder.Entity<UserModel2>(entity =>
        {
            entity.HasOne(d => d.Model).WithMany(p => p.UserModel2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserModel2_Model");

            entity.HasOne(d => d.User).WithMany(p => p.UserModel2s)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserModel2_User");
        });

        modelBuilder.Entity<UserModelUsage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ModelUsage");

            entity.HasOne(d => d.BalanceTransaction).WithOne(p => p.UserModelUsage).HasConstraintName("FK_ModelUsage_TransactionLog");

            entity.HasOne(d => d.ClientInfo).WithMany(p => p.UserModelUsages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelUsage_ClientInfo");

            entity.HasOne(d => d.UsageTransaction).WithOne(p => p.UserModelUsage).HasConstraintName("FK_ModelUsage_UsageTransactionLog");

            entity.HasOne(d => d.UserModel).WithMany(p => p.UserModelUsages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelUsage_UserModel2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
