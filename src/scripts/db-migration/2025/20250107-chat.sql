/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.UserModelUsage SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.MessageResponse
	(
	MessageId bigint NOT NULL,
	UsageId bigint NOT NULL,
	ReactionId bit NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.MessageResponse ADD CONSTRAINT
	PK_MessageResponse PRIMARY KEY CLUSTERED 
	(
	MessageId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.MessageResponse ADD CONSTRAINT
	FK_MessageResponse_Message FOREIGN KEY
	(
	MessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.MessageResponse ADD CONSTRAINT
	FK_MessageResponse_UserModelUsage FOREIGN KEY
	(
	UsageId
	) REFERENCES dbo.UserModelUsage
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
CREATE UNIQUE NONCLUSTERED INDEX IX_MessageResponse_Usage ON dbo.MessageResponse
	(
	UsageId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.MessageResponse SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


-- 插入数据到 MessageResponse 表
INSERT INTO [dbo].[MessageResponse] ([MessageId], [UsageId], [ReactionId])
SELECT 
    [Id] AS [MessageId],      -- Message 表中的 Id 映射到 MessageResponse 的 MessageId
    [UsageId],                -- Message 表中的 UsageId 映射到 MessageResponse 的 UsageId
    NULL AS [ReactionId]      -- ReactionId 在迁移过程中设置为 NULL
FROM 
    [dbo].[Message]
WHERE 
    [ChatRoleId] = 3          -- 只迁移 ChatRoleId = 3 的数据
    AND [UsageId] IS NOT NULL -- 确保 UsageId 不为 NULL


/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_ChatRole
GO
ALTER TABLE dbo.ChatRole SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_UserModelUsage
GO
ALTER TABLE dbo.UserModelUsage SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_Message
	(
	Id bigint NOT NULL IDENTITY (1, 1),
	ChatId int NOT NULL,
	SpanId tinyint NULL,
	ParentId bigint NULL,
	ChatRoleId tinyint NOT NULL,
	Edited bit NOT NULL,
	CreatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Message SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Message ADD CONSTRAINT
	DF_Message_Edited DEFAULT 0 FOR Edited
GO
SET IDENTITY_INSERT dbo.Tmp_Message ON
GO
IF EXISTS(SELECT * FROM dbo.Message)
	 EXEC('INSERT INTO dbo.Tmp_Message (Id, ChatId, SpanId, ParentId, ChatRoleId, CreatedAt)
		SELECT Id, ChatId, SpanId, ParentId, ChatRoleId, CreatedAt FROM dbo.Message WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_Message OFF
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_ParentMessage
GO
ALTER TABLE dbo.MessageContent
	DROP CONSTRAINT FK_MessageContent_Message
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_Message
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_Chat
GO
ALTER TABLE dbo.MessageResponse
	DROP CONSTRAINT FK_MessageResponse_Message
GO
DROP TABLE dbo.Message
GO
EXECUTE sp_rename N'dbo.Tmp_Message', N'Message', 'OBJECT' 
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	PK_Message PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_Message_ChatSpan ON dbo.Message
	(
	ChatId,
	SpanId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_ChatRole FOREIGN KEY
	(
	ChatRoleId
	) REFERENCES dbo.ChatRole
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_ParentMessage FOREIGN KEY
	(
	ParentId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.MessageResponse ADD CONSTRAINT
	FK_MessageResponse_Message FOREIGN KEY
	(
	MessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.MessageResponse SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_Message FOREIGN KEY
	(
	LeafMessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.MessageContent ADD CONSTRAINT
	FK_MessageContent_Message FOREIGN KEY
	(
	MessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.MessageContent SET (LOCK_ESCALATION = TABLE)
GO
COMMIT



/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_UserId
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_Chat
	(
	Id int NOT NULL IDENTITY (1, 1),
	Title nvarchar(50) NOT NULL,
	IsArchived bit NOT NULL,
	IsTopMost bit NOT NULL,
	LeafMessageId bigint NULL,
	CreatedAt datetime2(7) NOT NULL,
	UpdatedAt datetime2(7) NOT NULL,
	UserId int NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Chat SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Chat ADD CONSTRAINT
	DF_Chat_IsTopMost DEFAULT 0 FOR IsTopMost
GO
SET IDENTITY_INSERT dbo.Tmp_Chat ON
GO
IF EXISTS(SELECT * FROM dbo.Chat)
	 EXEC('INSERT INTO dbo.Tmp_Chat (Id, Title, IsArchived, LeafMessageId, CreatedAt, UpdatedAt, UserId)
		SELECT Id, Title, IsDeleted, LeafMessageId, CreatedAt, UpdatedAt, UserId FROM dbo.Chat WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_Chat OFF
GO
ALTER TABLE dbo.ChatSpan
	DROP CONSTRAINT FK_ChatSpan_Chat
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_Message
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_Chat
GO
DROP TABLE dbo.Chat
GO
EXECUTE sp_rename N'dbo.Tmp_Chat', N'Chat', 'OBJECT' 
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	PK_Chat PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_Chat_UserId ON dbo.Chat
	(
	UserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_Chat_UpdatedAt ON dbo.Chat
	(
	UpdatedAt
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_UserId FOREIGN KEY
	(
	UserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_Message FOREIGN KEY
	(
	LeafMessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.Message SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ChatSpan ADD CONSTRAINT
	FK_ChatSpan_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.ChatSpan SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.ChatGroup
	(
	Id int NOT NULL IDENTITY(1, 1),
	UserId int NOT NULL,
	Name nvarchar(50) NOT NULL,
	Rank smallint NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ChatGroup ADD CONSTRAINT
	PK_ChatGroup PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_ChatGroup_UserId ON dbo.ChatGroup
	(
	UserId,
	Rank
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.ChatGroup ADD CONSTRAINT
	FK_ChatGroup_User FOREIGN KEY
	(
	UserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ChatGroup SET (LOCK_ESCALATION = TABLE)
GO
COMMIT



/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ChatGroup SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_UserId
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT DF_Chat_IsTopMost
GO
CREATE TABLE dbo.Tmp_Chat
	(
	Id int NOT NULL IDENTITY (1, 1),
	UserId int NOT NULL,
	ChatGroupId int NULL,
	Title nvarchar(50) NOT NULL,
	IsArchived bit NOT NULL,
	IsTopMost bit NOT NULL,
	LeafMessageId bigint NULL,
	CreatedAt datetime2(7) NOT NULL,
	UpdatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Chat SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_Chat ADD CONSTRAINT
	DF_Chat_IsTopMost DEFAULT ((0)) FOR IsTopMost
GO
SET IDENTITY_INSERT dbo.Tmp_Chat ON
GO
IF EXISTS(SELECT * FROM dbo.Chat)
	 EXEC('INSERT INTO dbo.Tmp_Chat (Id, UserId, Title, IsArchived, IsTopMost, LeafMessageId, CreatedAt, UpdatedAt)
		SELECT Id, UserId, Title, IsArchived, IsTopMost, LeafMessageId, CreatedAt, UpdatedAt FROM dbo.Chat WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_Chat OFF
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_Message
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message_Chat
GO
ALTER TABLE dbo.ChatSpan
	DROP CONSTRAINT FK_ChatSpan_Chat
GO
DROP TABLE dbo.Chat
GO
EXECUTE sp_rename N'dbo.Tmp_Chat', N'Chat', 'OBJECT' 
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	PK_Chat PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_Chat_UserId ON dbo.Chat
	(
	UserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_Chat_UpdatedAt ON dbo.Chat
	(
	UpdatedAt
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_Chat_ChatGroupId ON dbo.Chat
	(
	ChatGroupId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_UserId FOREIGN KEY
	(
	UserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_ChatGroup FOREIGN KEY
	(
	ChatGroupId
	) REFERENCES dbo.ChatGroup
	(
	Id
	) ON UPDATE  SET NULL 
	 ON DELETE  SET NULL 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ChatSpan ADD CONSTRAINT
	FK_ChatSpan_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.ChatSpan SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_Message FOREIGN KEY
	(
	LeafMessageId
	) REFERENCES dbo.Message
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.Message SET (LOCK_ESCALATION = TABLE)
GO
COMMIT



/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.ChatTag
	(
	Id int NOT NULL IDENTITY (1, 1),
	Name nvarchar(50) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ChatTag ADD CONSTRAINT
	PK_ChatTag PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE UNIQUE NONCLUSTERED INDEX IX_ChatTag_Name ON dbo.ChatTag
	(
	Name
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.ChatTag SET (LOCK_ESCALATION = TABLE)
GO
COMMIT



/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ChatTag SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.ChatTagChat
	(
	ChatId int NOT NULL,
	ChatTagId int NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ChatTagChat ADD CONSTRAINT
	PK_ChatTagChat PRIMARY KEY CLUSTERED 
	(
	ChatId,
	ChatTagId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.ChatTagChat ADD CONSTRAINT
	FK_ChatTagChat_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.ChatTagChat ADD CONSTRAINT
	FK_ChatTagChat_ChatTag FOREIGN KEY
	(
	ChatTagId
	) REFERENCES dbo.ChatTag
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ChatTagChat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
DROP INDEX IX_Chat_UpdatedAt ON dbo.Chat
GO
CREATE NONCLUSTERED INDEX IX_Chat_UpdatedAt ON dbo.Chat
	(
	IsTopMost,
	UpdatedAt
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ChatGroup
	DROP CONSTRAINT FK_ChatGroup_User
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_ChatGroup
	(
	Id int NOT NULL IDENTITY (1, 1),
	UserId int NOT NULL,
	Name nvarchar(50) NOT NULL,
	IsCollapsed bit NOT NULL,
	Rank smallint NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_ChatGroup SET (LOCK_ESCALATION = TABLE)
GO
SET IDENTITY_INSERT dbo.Tmp_ChatGroup ON
GO
IF EXISTS(SELECT * FROM dbo.ChatGroup)
	 EXEC('INSERT INTO dbo.Tmp_ChatGroup (Id, UserId, Name, Rank)
		SELECT Id, UserId, Name, Rank FROM dbo.ChatGroup WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_ChatGroup OFF
GO
ALTER TABLE dbo.Chat
	DROP CONSTRAINT FK_Chat_ChatGroup
GO
DROP TABLE dbo.ChatGroup
GO
EXECUTE sp_rename N'dbo.Tmp_ChatGroup', N'ChatGroup', 'OBJECT' 
GO
ALTER TABLE dbo.ChatGroup ADD CONSTRAINT
	PK_ChatGroup PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_ChatGroup_UserId ON dbo.ChatGroup
	(
	UserId,
	Rank
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.ChatGroup ADD CONSTRAINT
	FK_ChatGroup_User FOREIGN KEY
	(
	UserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat ADD CONSTRAINT
	FK_Chat_ChatGroup FOREIGN KEY
	(
	ChatGroupId
	) REFERENCES dbo.ChatGroup
	(
	Id
	) ON UPDATE  SET NULL 
	 ON DELETE  SET NULL 
	
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


EXECUTE sp_rename N'dbo.ChatGroup.IsCollapsed', N'IsExpanded', 'COLUMN';



/* 为了防止任何可能出现的数据丢失问题，您应该先仔细检查此脚本，然后再在数据库设计器的上下文之外运行此脚本。*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.ChatShare
	(
	Id int NOT NULL IDENTITY (1, 1),
	ChatId int NOT NULL,
	ExpiresAt datetimeoffset(7) NOT NULL,
	SnapshotTime datetime NOT NULL,
	CreatedAt datetime NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ChatShare ADD CONSTRAINT
	PK_ChatShare PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_ChatShare_Chat ON dbo.ChatShare
	(
	ChatId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.ChatShare ADD CONSTRAINT
	FK_ChatShare_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ChatShare SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
