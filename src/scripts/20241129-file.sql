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
ALTER TABLE [ChatsSTG].[dbo].[FileService]
ADD [FileServiceTypeId] INT NOT NULL CONSTRAINT [DF_FileService_FileServiceTypeId] DEFAULT (1);

-- 删除默认约束
ALTER TABLE [ChatsSTG].[dbo].[FileService]
DROP CONSTRAINT [DF_FileService_FileServiceTypeId];

-- 删除 Type 字段
ALTER TABLE [ChatsSTG].[dbo].[FileService]
DROP COLUMN [Type];

ALTER TABLE [ChatsSTG].[dbo].[FileService]
DROP CONSTRAINT DF_FileServices_enabled;

-- 删除 Enabled 字段
ALTER TABLE [ChatsSTG].[dbo].[FileService]
DROP COLUMN [Enabled];

-- 添加 IsDefault 字段
ALTER TABLE [ChatsSTG].[dbo].[FileService]
ADD [IsDefault] BIT NOT NULL CONSTRAINT [DF_FileService_IsDefault] DEFAULT (0);

ALTER TABLE [ChatsSTG].[dbo].[FileService]
DROP CONSTRAINT [DF_FileService_IsDefault];

-- 更新 Configs 列，将 accessSecret 属性改为 secretKey，然后删除 accessSecret 属性
-- 首先，将 secretKey 设置为 accessSecret 的值
UPDATE [ChatsSTG].[dbo].[FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.secretKey', JSON_VALUE([Configs], '$.accessSecret'));

-- 然后，删除 accessSecret 属性
UPDATE [ChatsSTG].[dbo].[FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.accessSecret', NULL);

UPDATE [ChatsSTG].[dbo].[FileService]
SET [Configs] = JSON_MODIFY([Configs], '$.bucket', JSON_VALUE([Configs], '$.bucketName'));

-- 然后，删除 accessSecret 属性
UPDATE [ChatsSTG].[dbo].[FileService]
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
