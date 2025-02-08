INSERT INTO [MessageContentType] VALUES(3, 'reasoning');

-- Region Parameters
DECLARE @p0 SmallInt = 16
DECLARE @p1 VarChar(1000) = 'Doubao'
DECLARE @p2 VarChar(1000) = null
DECLARE @p3 VarChar(1000) = 'your-key'
DECLARE @p4 Bit = 0
-- EndRegion
INSERT INTO [ModelProvider]([Id], [Name], [InitialHost], [InitialSecret], [RequireDeploymentName])
VALUES (@p0, @p1, @p2, @p3, @p4)
GO

-- Region Parameters
DECLARE @p0 SmallInt = 17
DECLARE @p1 VarChar(1000) = 'SiliconFlow'
DECLARE @p2 VarChar(1000) = null
DECLARE @p3 VarChar(1000) = 'sk-yourkey'
DECLARE @p4 Bit = 0
-- EndRegion
INSERT INTO [ModelProvider]([Id], [Name], [InitialHost], [InitialSecret], [RequireDeploymentName])
VALUES (@p0, @p1, @p2, @p3, @p4)
GO

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
CREATE TABLE dbo.ReasoningResponseKind
	(
	Id tinyint NOT NULL,
	Name varchar(50) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.ReasoningResponseKind ADD CONSTRAINT
	PK_ReasoningResponseKind PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.ReasoningResponseKind SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


-- Region Parameters
DECLARE @p0 TinyInt = 0
DECLARE @p1 VarChar(1000) = 'NoReasoningOutput'
-- EndRegion
INSERT INTO [ReasoningResponseKind]([Id], [Name])
VALUES (@p0, @p1)
GO

-- Region Parameters
DECLARE @p0 TinyInt = 1
DECLARE @p1 VarChar(1000) = 'reasoning_content'
-- EndRegion
INSERT INTO [ReasoningResponseKind]([Id], [Name])
VALUES (@p0, @p1)
GO

-- Region Parameters
DECLARE @p0 TinyInt = 2
DECLARE @p1 VarChar(1000) = '<think>'
-- EndRegion
INSERT INTO [ReasoningResponseKind]([Id], [Name])
VALUES (@p0, @p1)
GO


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
ALTER TABLE dbo.ReasoningResponseKind SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT FK_ModelSetting_ModelProvider
GO
ALTER TABLE dbo.ModelProvider SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT FK_ModelReference_Tokenizer
GO
ALTER TABLE dbo.Tokenizer SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT FK_ModelReference_CurrencyRate
GO
ALTER TABLE dbo.CurrencyRate SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelSetting_ProviderId
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_DefaultModelSetting_AllowVision
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelReference_AllowSystemPrompt
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelReference_AllowStreaming
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelDefaults_ContextWindow
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelDefaults_MaxResponseTokens
GO
ALTER TABLE dbo.ModelReference
	DROP CONSTRAINT DF_ModelReference_CurrencyCode
GO
CREATE TABLE dbo.Tmp_ModelReference
	(
	Id smallint NOT NULL,
	ProviderId smallint NOT NULL,
	Name nvarchar(50) NOT NULL,
	DisplayName nvarchar(50) NULL,
	PublishDate date NULL,
	MinTemperature decimal(3, 2) NOT NULL,
	MaxTemperature decimal(3, 2) NOT NULL,
	AllowSearch bit NOT NULL,
	AllowVision bit NOT NULL,
	AllowSystemPrompt bit NOT NULL,
	AllowStreaming bit NOT NULL,
	ReasoningResponseKindId tinyint NOT NULL,
	ContextWindow int NOT NULL,
	MaxResponseTokens int NOT NULL,
	TokenizerId smallint NULL,
	InputTokenPrice1M decimal(9, 5) NOT NULL,
	OutputTokenPrice1M decimal(9, 5) NOT NULL,
	CurrencyCode char(3) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_ModelReference SET (LOCK_ESCALATION = TABLE)
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelSetting_ProviderId DEFAULT ((1)) FOR ProviderId
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_DefaultModelSetting_AllowVision DEFAULT ((0)) FOR AllowVision
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelReference_AllowSystemPrompt DEFAULT ((1)) FOR AllowSystemPrompt
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelReference_AllowStreaming DEFAULT ((1)) FOR AllowStreaming
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelReference_ReasoningResponseKindId DEFAULT 0 FOR ReasoningResponseKindId
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelDefaults_ContextWindow DEFAULT ((4096)) FOR ContextWindow
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelDefaults_MaxResponseTokens DEFAULT ((4096)) FOR MaxResponseTokens
GO
ALTER TABLE dbo.Tmp_ModelReference ADD CONSTRAINT
	DF_ModelReference_CurrencyCode DEFAULT ('RMB') FOR CurrencyCode
GO
IF EXISTS(SELECT * FROM dbo.ModelReference)
	 EXEC('INSERT INTO dbo.Tmp_ModelReference (Id, ProviderId, Name, DisplayName, PublishDate, MinTemperature, MaxTemperature, AllowSearch, AllowVision, AllowSystemPrompt, AllowStreaming, ContextWindow, MaxResponseTokens, TokenizerId, InputTokenPrice1M, OutputTokenPrice1M, CurrencyCode)
		SELECT Id, ProviderId, Name, DisplayName, PublishDate, MinTemperature, MaxTemperature, AllowSearch, AllowVision, AllowSystemPrompt, AllowStreaming, ContextWindow, MaxResponseTokens, TokenizerId, InputTokenPrice1M, OutputTokenPrice1M, CurrencyCode FROM dbo.ModelReference WITH (HOLDLOCK TABLOCKX)')
GO
ALTER TABLE dbo.Model
	DROP CONSTRAINT FK_Model_ModelReference
GO
DROP TABLE dbo.ModelReference
GO
EXECUTE sp_rename N'dbo.Tmp_ModelReference', N'ModelReference', 'OBJECT' 
GO
ALTER TABLE dbo.ModelReference ADD CONSTRAINT
	PK_ModelSetting PRIMARY KEY CLUSTERED 
	(
	Id
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
CREATE NONCLUSTERED INDEX [IX_ModelSetting_ProviderId+Type] ON dbo.ModelReference
	(
	ProviderId,
	Name
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX IX_ModelReference_Name ON dbo.ModelReference
	(
	Name
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE dbo.ModelReference ADD CONSTRAINT
	FK_ModelReference_CurrencyRate FOREIGN KEY
	(
	CurrencyCode
	) REFERENCES dbo.CurrencyRate
	(
	Code
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ModelReference ADD CONSTRAINT
	FK_ModelReference_Tokenizer FOREIGN KEY
	(
	TokenizerId
	) REFERENCES dbo.Tokenizer
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ModelReference ADD CONSTRAINT
	FK_ModelSetting_ModelProvider FOREIGN KEY
	(
	ProviderId
	) REFERENCES dbo.ModelProvider
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.ModelReference ADD CONSTRAINT
	FK_ModelReference_ReasoningResponseKind FOREIGN KEY
	(
	ReasoningResponseKindId
	) REFERENCES dbo.ReasoningResponseKind
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Model ADD CONSTRAINT
	FK_Model_ModelReference FOREIGN KEY
	(
	ModelReferenceId
	) REFERENCES dbo.ModelReference
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.Model SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
