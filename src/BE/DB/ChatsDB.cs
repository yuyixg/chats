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

    public virtual DbSet<BalanceLog> BalanceLogs { get; set; }

    public virtual DbSet<Chat> Chats { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<ChatModel> ChatModels { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<Counterfoil> Counterfoils { get; set; }

    public virtual DbSet<FileService> FileServices { get; set; }

    public virtual DbSet<InvitationCode> InvitationCodes { get; set; }

    public virtual DbSet<LoginService> LoginServices { get; set; }

    public virtual DbSet<ModelKey> ModelKeys { get; set; }

    public virtual DbSet<ModelProvider> ModelProviders { get; set; }

    public virtual DbSet<ModelSetting> ModelSettings { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<PayService> PayServices { get; set; }

    public virtual DbSet<Prompt> Prompts { get; set; }

    public virtual DbSet<RequestLog> RequestLogs { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Sms> Sms { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserBalance> UserBalances { get; set; }

    public virtual DbSet<UserInitialConfig> UserInitialConfigs { get; set; }

    public virtual DbSet<UserInvitation> UserInvitations { get; set; }

    public virtual DbSet<UserModel> UserModels { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:ChatsDB");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BalanceLog>(entity =>
        {
            entity.HasIndex(e => e.MessageId, "IX_BalanceLogs_MessageId").HasFillFactor(80);

            entity.HasIndex(e => e.UserId, "IX_BalanceLogs_UserId").HasFillFactor(80);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.MessageId).HasDefaultValueSql("(NULL)");

            entity.HasOne(d => d.Message).WithMany(p => p.BalanceLogs).HasConstraintName("FK_BalanceLogs_ChatMessages");

            entity.HasOne(d => d.User).WithMany(p => p.BalanceLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BalanceLogs_Users");
        });

        modelBuilder.Entity<Chat>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UserModelConfig).HasDefaultValue("{}");

            entity.HasOne(d => d.ChatModel).WithMany(p => p.Chats)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Chats_chatModelId_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Chats)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Chats_userId_fkey");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasIndex(e => e.ChatId, "IX_ChatMessages_ChatId").HasFillFactor(80);

            entity.HasIndex(e => e.ChatModelId, "IX_ChatMessages_ChatModelId").HasFillFactor(80);

            entity.HasIndex(e => e.ParentId, "IX_ChatMessages_ParentId").HasFillFactor(80);

            entity.HasIndex(e => e.UserId, "IX_ChatMessages_UserId").HasFillFactor(80);

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Chat).WithMany(p => p.ChatMessages).HasConstraintName("FK_ChatMessages_Chats");

            entity.HasOne(d => d.ChatModel).WithMany(p => p.ChatMessages).HasConstraintName("FK_ChatMessages_ChatModels");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_ChatMessages_ParentId");

            entity.HasOne(d => d.User).WithMany(p => p.ChatMessages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChatMessages_Users");
        });

        modelBuilder.Entity<ChatModel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ChatModels_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Enabled).HasDefaultValue(true);
            entity.Property(e => e.FileConfig).HasDefaultValue("{}");
            entity.Property(e => e.ModelConfig).HasDefaultValue("{}");
            entity.Property(e => e.PriceConfig).HasDefaultValue("{}");

            entity.HasOne(d => d.FileService).WithMany(p => p.ChatModels)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("ChatModels_fileServiceId_fkey");

            entity.HasOne(d => d.ModelKeys).WithMany(p => p.ChatModels)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("ChatModels_modelKeysId_fkey");
        });

        modelBuilder.Entity<Counterfoil>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Counterfoils_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<FileService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("FileServices_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Configs).HasDefaultValue("{}");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Enabled).HasDefaultValue(true);
        });

        modelBuilder.Entity<InvitationCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("InvitationCode_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<LoginService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("LoginServices_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Configs).HasDefaultValue("{}");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Enabled).HasDefaultValue(true);
        });

        modelBuilder.Entity<ModelKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ModelKeys_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<ModelProvider>(entity =>
        {
            entity.ToTable("ModelProvider", tb => tb.HasComment("JSON"));
        });

        modelBuilder.Entity<ModelSetting>(entity =>
        {
            entity.Property(e => e.ProviderId).HasDefaultValue(1);

            entity.HasOne(d => d.Provider).WithMany(p => p.ModelSettings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ModelSetting_ModelProvider");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Orders_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CreateUser).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Orders_createUserId_fkey");
        });

        modelBuilder.Entity<PayService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PayServices_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Enabled).HasDefaultValue(true);
        });

        modelBuilder.Entity<Prompt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Prompts_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CreateUser).WithMany(p => p.Prompts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Prompts_createUserId_fkey");
        });

        modelBuilder.Entity<RequestLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("RequestLogs_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithMany(p => p.RequestLogs)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("RequestLogs_userId_fkey");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sessions_userId");
        });

        modelBuilder.Entity<Sms>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Sms_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Enabled).HasDefaultValue(true);
            entity.Property(e => e.Role).HasDefaultValue("-");
        });

        modelBuilder.Entity<UserBalance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UserBalances_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.UserBalance)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("UserBalances_userId_fkey");
        });

        modelBuilder.Entity<UserInitialConfig>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UserInitialConfig_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Models).HasDefaultValue("[]");

            entity.HasOne(d => d.InvitationCode).WithMany(p => p.UserInitialConfigs).HasConstraintName("FK_UserInitialConfig_InvitationCode");
        });

        modelBuilder.Entity<UserInvitation>(entity =>
        {
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
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Models).HasDefaultValue("[]");

            entity.HasOne(d => d.User).WithOne(p => p.UserModel)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("UserModels_userId_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
