CREATE TABLE FileServiceType (
    Id TINYINT PRIMARY KEY,
    Name VARCHAR(20) NOT NULL,
    InitialConfig NVARCHAR(500) NOT NULL
);

INSERT INTO FileServiceType (Id, Name, InitialConfig) VALUES
(0, 'Local', './AppData/Files'),
(1, 'Minio', '{"endpoint": "https://minio.example.com", "accessKey": "your-access-key", "secretKey": "your-secret-key", "bucket": "your-bucket", "region": null}'),
(2, 'AWS S3', '{"region": "ap-southeast-1", "accessKeyId": "your-access-key-id", "secretAccessKey": "your-secret-access-key", "bucket": "your-bucket"}'),
(3, 'Aliyun OSS', '{"endpoint": "oss-cn-hangzhou.aliyuncs.com", "accessKeyId": "your-access-key-id", "accessKeySecret": "your-access-key-secret", "bucket": "your-bucket"}'),
(4, 'Azure Blob Storage', 'DefaultEndpointsProtocol=https;AccountName=your-account-name;AccountKey=your-account-key;EndpointSuffix=core.windows.net');

-- 添加列 FileServiceTypeId，指定默认约束名称
ALTER TABLE [FileService]
ADD [FileServiceTypeId] INT NOT NULL CONSTRAINT [DF_FileService_FileServiceTypeId] DEFAULT (1);

-- 删除默认约束
ALTER TABLE [FileService]
DROP CONSTRAINT [DF_FileService_FileServiceTypeId];

-- 删除 Type 字段
ALTER TABLE [FileService]
DROP COLUMN [Type];

ALTER TABLE [FileService]
DROP CONSTRAINT DF_FileServices_enabled;

-- 删除 Enabled 字段
ALTER TABLE [FileService]
DROP COLUMN [Enabled];

-- 添加 IsDefault 字段
ALTER TABLE [FileService]
ADD [IsDefault] BIT NOT NULL CONSTRAINT [DF_FileService_IsDefault] DEFAULT (0);

ALTER TABLE [FileService]
DROP CONSTRAINT [DF_FileService_IsDefault];

-- 更新 Configs 列，将 accessSecret 属性改为 secretKey，然后删除 accessSecret 属性
-- 首先，将 secretKey 设置为 accessSecret 的值
UPDATE [FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.secretKey', JSON_VALUE([Configs], '$.accessSecret'));

-- 然后，删除 accessSecret 属性
UPDATE [FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.accessSecret', NULL);

UPDATE [FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.bucket', JSON_VALUE([Configs], '$.bucketName'));

-- 然后，删除 accessSecret 属性
UPDATE [FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.bucketName', NULL);


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
ALTER TABLE dbo.FileService
	DROP CONSTRAINT DF_FileServices_configs
GO
ALTER TABLE dbo.FileService
	DROP CONSTRAINT DF_FileServices_createdAt
GO
CREATE TABLE dbo.Tmp_FileService
	(
	Id int NOT NULL IDENTITY (1, 1),
	FileServiceTypeId int NOT NULL,
	Name nvarchar(100) NOT NULL,
	Configs nvarchar(500) NOT NULL,
	IsDefault bit NOT NULL,
	CreatedAt datetime2(7) NOT NULL,
	UpdatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_FileService SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_FileService ADD CONSTRAINT
	DF_FileServices_configs DEFAULT ('{}') FOR Configs
GO
ALTER TABLE dbo.Tmp_FileService ADD CONSTRAINT
	DF_FileServices_createdAt DEFAULT (getdate()) FOR CreatedAt
GO
SET IDENTITY_INSERT dbo.Tmp_FileService ON
GO
IF EXISTS(SELECT * FROM dbo.FileService)
	 EXEC('INSERT INTO dbo.Tmp_FileService (Id, FileServiceTypeId, Name, Configs, IsDefault, CreatedAt, UpdatedAt)
		SELECT Id, FileServiceTypeId, CONVERT(nvarchar(100), Name), CONVERT(nvarchar(500), Configs), IsDefault, CreatedAt, UpdatedAt FROM dbo.FileService WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_FileService OFF
GO
ALTER TABLE dbo.Model
	DROP CONSTRAINT FK_Model_FileServiceId
GO
DROP TABLE dbo.FileService
GO
EXECUTE sp_rename N'dbo.Tmp_FileService', N'FileService', 'OBJECT' 
GO
ALTER TABLE dbo.FileService ADD CONSTRAINT
	PK_FileServices2 PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Model ADD CONSTRAINT
	FK_Model_FileServiceId FOREIGN KEY
	(
	FileServiceId
	) REFERENCES dbo.FileService
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Model SET (LOCK_ESCALATION = TABLE)
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
ALTER TABLE dbo.Model
	DROP CONSTRAINT FK_Model_FileServiceId
GO
ALTER TABLE dbo.FileService SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
EXECUTE sp_rename N'dbo.Model.PromptTokenPrice1M', N'Tmp_InputTokenPrice1M', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.Model.ResponseTokenPrice1M', N'Tmp_OutputTokenPrice1M_1', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.Model.Tmp_InputTokenPrice1M', N'InputTokenPrice1M', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.Model.Tmp_OutputTokenPrice1M_1', N'OutputTokenPrice1M', 'COLUMN' 
GO
DROP INDEX IX_Model_FileServiceId ON dbo.Model
GO
ALTER TABLE dbo.Model
	DROP COLUMN FileServiceId
GO
ALTER TABLE dbo.Model SET (LOCK_ESCALATION = TABLE)
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
EXECUTE sp_rename N'dbo.ModelReference.PromptTokenPrice1M', N'Tmp_InputTokenPrice1M_2', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ModelReference.ResponseTokenPrice1M', N'Tmp_OutputTokenPrice1M_3', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ModelReference.Tmp_InputTokenPrice1M_2', N'InputTokenPrice1M', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.ModelReference.Tmp_OutputTokenPrice1M_3', N'OutputTokenPrice1M', 'COLUMN' 
GO
ALTER TABLE dbo.ModelReference SET (LOCK_ESCALATION = TABLE)
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
ALTER TABLE dbo.Prompt
	DROP CONSTRAINT FK_Prompt_CreateUserId
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_Prompt
	(
	Id int NOT NULL IDENTITY (1, 1),
	Name nvarchar(50) NOT NULL,
	[Content] nvarchar(MAX) NOT NULL,
	Temperature real NULL,
	IsDefault bit NOT NULL,
	IsSystem bit NOT NULL,
	CreatedAt datetime2(7) NOT NULL,
	UpdatedAt datetime2(7) NOT NULL,
	CreateUserId int NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_Prompt SET (LOCK_ESCALATION = TABLE)
GO
SET IDENTITY_INSERT dbo.Tmp_Prompt ON
GO
IF EXISTS(SELECT * FROM dbo.Prompt)
	 EXEC('INSERT INTO dbo.Tmp_Prompt (Id, Name, [Content], IsDefault, IsSystem, CreatedAt, UpdatedAt, CreateUserId)
		SELECT Id, Name, [Content], IsDefault, IsSystem, CreatedAt, UpdatedAt, CreateUserId FROM dbo.Prompt WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_Prompt OFF
GO
DROP TABLE dbo.Prompt
GO
EXECUTE sp_rename N'dbo.Tmp_Prompt', N'Prompt', 'OBJECT' 
GO
ALTER TABLE dbo.Prompt ADD CONSTRAINT
	PK_Prompt2 PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_Prompt2_Name ON dbo.Prompt
	(
	Name
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_Prompt_CreateUserId ON dbo.Prompt
	(
	CreateUserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.Prompt ADD CONSTRAINT
	FK_Prompt_CreateUserId FOREIGN KEY
	(
	CreateUserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
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
ALTER TABLE dbo.FileServiceType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.FileService
	DROP CONSTRAINT DF_FileServices_configs
GO
ALTER TABLE dbo.FileService
	DROP CONSTRAINT DF_FileServices_createdAt
GO
CREATE TABLE dbo.Tmp_FileService
	(
	Id int NOT NULL IDENTITY (1, 1),
	FileServiceTypeId tinyint NOT NULL,
	Name nvarchar(100) NOT NULL,
	Configs nvarchar(500) NOT NULL,
	IsDefault bit NOT NULL,
	CreatedAt datetime2(7) NOT NULL,
	UpdatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_FileService SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_FileService ADD CONSTRAINT
	DF_FileServices_configs DEFAULT ('{}') FOR Configs
GO
ALTER TABLE dbo.Tmp_FileService ADD CONSTRAINT
	DF_FileServices_createdAt DEFAULT (getdate()) FOR CreatedAt
GO
SET IDENTITY_INSERT dbo.Tmp_FileService ON
GO
IF EXISTS(SELECT * FROM dbo.FileService)
	 EXEC('INSERT INTO dbo.Tmp_FileService (Id, FileServiceTypeId, Name, Configs, IsDefault, CreatedAt, UpdatedAt)
		SELECT Id, CONVERT(tinyint, FileServiceTypeId), Name, Configs, IsDefault, CreatedAt, UpdatedAt FROM dbo.FileService WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_FileService OFF
GO
DROP TABLE dbo.FileService
GO
EXECUTE sp_rename N'dbo.Tmp_FileService', N'FileService', 'OBJECT' 
GO
ALTER TABLE dbo.FileService ADD CONSTRAINT
	PK_FileServices2 PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.FileService ADD CONSTRAINT
	FK_FileService_FileServiceType FOREIGN KEY
	(
	FileServiceTypeId
	) REFERENCES dbo.FileServiceType
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
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
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message2_Conversation
GO
ALTER TABLE dbo.Chat SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message2_ChatRole
GO
ALTER TABLE dbo.ChatRole SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message2_UserModelUsage
GO
ALTER TABLE dbo.UserModelUsage SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Message
	DROP CONSTRAINT FK_Message2_ParentMessage
GO
ALTER TABLE dbo.MessageContent
	DROP CONSTRAINT FK_MessageContent2_Message
GO
EXECUTE sp_rename N'dbo.Message.ConversationId', N'Tmp_ChatId', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.Message.Tmp_ChatId', N'ChatId', 'COLUMN' 
GO
ALTER TABLE dbo.Message ADD CONSTRAINT
	FK_Message_UserModelUsage FOREIGN KEY
	(
	UsageId
	) REFERENCES dbo.UserModelUsage
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
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
	FK_Message_Chat FOREIGN KEY
	(
	ChatId
	) REFERENCES dbo.Chat
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
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
ALTER TABLE dbo.Message SET (LOCK_ESCALATION = TABLE)
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
ALTER TABLE dbo.UsageTransaction
	DROP CONSTRAINT FK_UserModelTransactionLog_UserModel2
GO
ALTER TABLE dbo.UserModel SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.UsageTransaction
	DROP CONSTRAINT FK_UserModelTransactionLog_TransactionType
GO
ALTER TABLE dbo.TransactionType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_UsageTransaction
	(
	Id bigint NOT NULL IDENTITY (1, 1),
	UserModelId int NOT NULL,
	TransactionTypeId tinyint NOT NULL,
	TokenAmount int NOT NULL,
	CountAmount int NOT NULL,
	CreditUserId int NULL,
	CreatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_UsageTransaction SET (LOCK_ESCALATION = TABLE)
GO
SET IDENTITY_INSERT dbo.Tmp_UsageTransaction ON
GO
IF EXISTS(SELECT * FROM dbo.UsageTransaction)
	 EXEC('INSERT INTO dbo.Tmp_UsageTransaction (Id, UserModelId, TransactionTypeId, TokenAmount, CountAmount, CreatedAt)
		SELECT Id, UserModelId, TransactionTypeId, TokenAmount, CountAmount, CreatedAt FROM dbo.UsageTransaction WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_UsageTransaction OFF
GO
ALTER TABLE dbo.UserModelUsage
	DROP CONSTRAINT FK_ModelUsage_UsageTransactionLog
GO
DROP TABLE dbo.UsageTransaction
GO
EXECUTE sp_rename N'dbo.Tmp_UsageTransaction', N'UsageTransaction', 'OBJECT' 
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	PK_UserModelTransactionLog PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_UserModelTransactionLog_UserModelId ON dbo.UsageTransaction
	(
	UserModelId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	FK_UserModelTransactionLog_TransactionType FOREIGN KEY
	(
	TransactionTypeId
	) REFERENCES dbo.TransactionType
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	FK_UserModelTransactionLog_UserModel2 FOREIGN KEY
	(
	UserModelId
	) REFERENCES dbo.UserModel
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.UserModelUsage ADD CONSTRAINT
	FK_ModelUsage_UsageTransactionLog FOREIGN KEY
	(
	UsageTransactionId
	) REFERENCES dbo.UsageTransaction
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.UserModelUsage SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


UPDATE ut
SET ut.CreditUserId = um.UserId
FROM [UsageTransaction] ut
JOIN [UserModel] um
ON ut.UserModelId = um.Id; -- assuming UserModelId corresponds to UserModel.Id



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
ALTER TABLE dbo.UsageTransaction
	DROP CONSTRAINT FK_UserModelTransactionLog_UserModel2
GO
ALTER TABLE dbo.UserModel SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.UsageTransaction
	DROP CONSTRAINT FK_UserModelTransactionLog_TransactionType
GO
ALTER TABLE dbo.TransactionType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_UsageTransaction
	(
	Id bigint NOT NULL IDENTITY (1, 1),
	UserModelId int NOT NULL,
	TransactionTypeId tinyint NOT NULL,
	TokenAmount int NOT NULL,
	CountAmount int NOT NULL,
	CreditUserId int NOT NULL,
	CreatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_UsageTransaction SET (LOCK_ESCALATION = TABLE)
GO
SET IDENTITY_INSERT dbo.Tmp_UsageTransaction ON
GO
IF EXISTS(SELECT * FROM dbo.UsageTransaction)
	 EXEC('INSERT INTO dbo.Tmp_UsageTransaction (Id, UserModelId, TransactionTypeId, TokenAmount, CountAmount, CreditUserId, CreatedAt)
		SELECT Id, UserModelId, TransactionTypeId, TokenAmount, CountAmount, CreditUserId, CreatedAt FROM dbo.UsageTransaction WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_UsageTransaction OFF
GO
ALTER TABLE dbo.UserModelUsage
	DROP CONSTRAINT FK_ModelUsage_UsageTransactionLog
GO
DROP TABLE dbo.UsageTransaction
GO
EXECUTE sp_rename N'dbo.Tmp_UsageTransaction', N'UsageTransaction', 'OBJECT' 
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	PK_UsageTransaction PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX IX_UsageTransaction_UserModelId ON dbo.UsageTransaction
	(
	UserModelId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_UsageTransaction_CreditUser ON dbo.UsageTransaction
	(
	CreditUserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	FK_UsageTransaction_TransactionType FOREIGN KEY
	(
	TransactionTypeId
	) REFERENCES dbo.TransactionType
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	FK_UsageTransaction_UserModel FOREIGN KEY
	(
	UserModelId
	) REFERENCES dbo.UserModel
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.UsageTransaction ADD CONSTRAINT
	FK_UsageTransaction_User FOREIGN KEY
	(
	CreditUserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.UserModelUsage ADD CONSTRAINT
	FK_ModelUsage_UsageTransactionLog FOREIGN KEY
	(
	UsageTransactionId
	) REFERENCES dbo.UsageTransaction
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.UserModelUsage SET (LOCK_ESCALATION = TABLE)
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
ALTER TABLE dbo.ClientInfo SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.FileService SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.[File]
	(
	Id int NOT NULL IDENTITY (1, 1),
	FileName nvarchar(200) NOT NULL,
	FileServiceId int NOT NULL,
	StorageKey nvarchar(300) NOT NULL,
	Size int NOT NULL,
	ClientInfoId int NOT NULL,
	CreateUserId int NOT NULL,
	CreatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	PK_File PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE UNIQUE NONCLUSTERED INDEX IX_File_StorageKey ON dbo.[File]
	(
	FileServiceId,
	StorageKey
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_File_ClientInfo ON dbo.[File]
	(
	ClientInfoId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_File_CreateUser ON dbo.[File]
	(
	CreateUserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_FileService FOREIGN KEY
	(
	FileServiceId
	) REFERENCES dbo.FileService
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_ClientInfo FOREIGN KEY
	(
	ClientInfoId
	) REFERENCES dbo.ClientInfo
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_User FOREIGN KEY
	(
	CreateUserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


CREATE TABLE FileImageInfo (
    FileId INT PRIMARY KEY,  -- 设置 FileId 为主键
    Width INT NOT NULL,
    Height INT NOT NULL,
    CONSTRAINT FK_FileImageInfo_File FOREIGN KEY (FileId)
        REFERENCES [File](Id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


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
CREATE TABLE dbo.FileContentType
	(
	Id smallint NOT NULL IDENTITY (1, 1),
	ContentType varchar(100) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.FileContentType ADD CONSTRAINT
	PK_FileContentType PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.FileContentType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


-- 首先禁用标识列自动递增
SET IDENTITY_INSERT [FileContentType] ON;

-- 插入新的内容类型
INSERT INTO [FileContentType] ([Id], [ContentType])
VALUES
    (1, 'image/jpeg'),
    (2, 'image/png'),
    (3, 'image/gif'),
    (4, 'image/bmp'),
    (5, 'image/svg+xml'),
    (6, 'image/webp'),
    (7, 'image/tiff'),
    (8, 'image/heif'),
    (9, 'image/heic');

-- 重新启用标识列自动递增
SET IDENTITY_INSERT [FileContentType] OFF;

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
ALTER TABLE dbo.FileContentType SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.[File]
	DROP CONSTRAINT FK_File_User
GO
ALTER TABLE dbo.[User] SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.[File]
	DROP CONSTRAINT FK_File_ClientInfo
GO
ALTER TABLE dbo.ClientInfo SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.[File]
	DROP CONSTRAINT FK_File_FileService
GO
ALTER TABLE dbo.FileService SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_File
	(
	Id int NOT NULL IDENTITY (1, 1),
	FileName nvarchar(200) NOT NULL,
	FileContentTypeId smallint NOT NULL,
	FileServiceId int NOT NULL,
	StorageKey nvarchar(300) NOT NULL,
	Size int NOT NULL,
	ClientInfoId int NOT NULL,
	CreateUserId int NOT NULL,
	CreatedAt datetime2(7) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_File SET (LOCK_ESCALATION = TABLE)
GO
SET IDENTITY_INSERT dbo.Tmp_File ON
GO
IF EXISTS(SELECT * FROM dbo.[File])
	 EXEC('INSERT INTO dbo.Tmp_File (Id, FileName, FileServiceId, StorageKey, Size, ClientInfoId, CreateUserId, CreatedAt)
		SELECT Id, FileName, FileServiceId, StorageKey, Size, ClientInfoId, CreateUserId, CreatedAt FROM dbo.[File] WITH (HOLDLOCK TABLOCKX)')
GO
SET IDENTITY_INSERT dbo.Tmp_File OFF
GO
ALTER TABLE dbo.FileImageInfo
	DROP CONSTRAINT FK_FileImageInfo_File
GO
DROP TABLE dbo.[File]
GO
EXECUTE sp_rename N'dbo.Tmp_File', N'File', 'OBJECT' 
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	PK_File PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE UNIQUE NONCLUSTERED INDEX IX_File_StorageKey ON dbo.[File]
	(
	FileServiceId,
	StorageKey
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_File_ClientInfo ON dbo.[File]
	(
	ClientInfoId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_File_CreateUser ON dbo.[File]
	(
	CreateUserId
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_FileService FOREIGN KEY
	(
	FileServiceId
	) REFERENCES dbo.FileService
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_ClientInfo FOREIGN KEY
	(
	ClientInfoId
	) REFERENCES dbo.ClientInfo
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_User FOREIGN KEY
	(
	CreateUserId
	) REFERENCES dbo.[User]
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.[File] ADD CONSTRAINT
	FK_File_FileContentType FOREIGN KEY
	(
	FileContentTypeId
	) REFERENCES dbo.FileContentType
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.FileImageInfo ADD CONSTRAINT
	FK_FileImageInfo_File FOREIGN KEY
	(
	FileId
	) REFERENCES dbo.[File]
	(
	Id
	) ON UPDATE  CASCADE 
	 ON DELETE  CASCADE 
	
GO
ALTER TABLE dbo.FileImageInfo SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


INSERT INTO [MessageContentType] ([Id], [ContentType])
VALUES (3, 'fileId');

update FileService set IsDefault = 1