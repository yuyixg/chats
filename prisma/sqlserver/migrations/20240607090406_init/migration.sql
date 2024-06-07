BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [avatar] NVARCHAR(1000),
    [account] NVARCHAR(1000),
    [username] NVARCHAR(1000),
    [password] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [Users_role_df] DEFAULT '-',
    [enabled] BIT NOT NULL CONSTRAINT [Users_enabled_df] DEFAULT 1,
    [provider] NVARCHAR(1000),
    [sub] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FileServices] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [FileServices_enabled_df] DEFAULT 1,
    [type] NVARCHAR(1000) NOT NULL,
    [configs] NVARCHAR(2048) NOT NULL CONSTRAINT [FileServices_configs_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FileServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [FileServices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChatModels] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [modelProvider] NVARCHAR(1000) NOT NULL,
    [modelVersion] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [isDefault] BIT NOT NULL CONSTRAINT [ChatModels_isDefault_df] DEFAULT 0,
    [rank] INT,
    [remarks] NVARCHAR(1000),
    [modelKeysId] UNIQUEIDENTIFIER,
    [fileServiceId] UNIQUEIDENTIFIER,
    [fileConfig] NVARCHAR(2048) CONSTRAINT [ChatModels_fileConfig_df] DEFAULT '{}',
    [modelConfig] NVARCHAR(2048) NOT NULL CONSTRAINT [ChatModels_modelConfig_df] DEFAULT '{}',
    [priceConfig] NVARCHAR(2048) NOT NULL CONSTRAINT [ChatModels_priceConfig_df] DEFAULT '{}',
    [enabled] BIT NOT NULL CONSTRAINT [ChatModels_enabled_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChatModels_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ChatModels_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Sessions] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sessions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Sessions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserModels] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [models] NVARCHAR(4000) NOT NULL CONSTRAINT [UserModels_models_df] DEFAULT '[]',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserModels_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserModels_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Chats] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [title] NVARCHAR(50) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [chatModelId] UNIQUEIDENTIFIER,
    [userModelConfig] NVARCHAR(1000) NOT NULL CONSTRAINT [Chats_userModelConfig_df] DEFAULT '{}',
    [isShared] BIT NOT NULL CONSTRAINT [Chats_isShared_df] DEFAULT 0,
    [isDeleted] BIT NOT NULL CONSTRAINT [Chats_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Chats_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Chats_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChatMessages] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [chatId] UNIQUEIDENTIFIER NOT NULL,
    [parentId] UNIQUEIDENTIFIER,
    [chatModelId] UNIQUEIDENTIFIER,
    [role] NVARCHAR(1000) NOT NULL,
    [messages] NTEXT NOT NULL,
    [calculatedPrice] DECIMAL(32,16) NOT NULL CONSTRAINT [ChatMessages_calculatedPrice_df] DEFAULT 0,
    [tokenUsed] INT NOT NULL CONSTRAINT [ChatMessages_tokenUsed_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChatMessages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ChatMessages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserBalances] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [balance] DECIMAL(32,16) NOT NULL CONSTRAINT [UserBalances_balance_df] DEFAULT 0,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserBalances_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserBalances_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserBalances_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[BalanceLogs] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [messageId] UNIQUEIDENTIFIER,
    [createUserId] UNIQUEIDENTIFIER NOT NULL,
    [value] DECIMAL(32,16) NOT NULL CONSTRAINT [BalanceLogs_value_df] DEFAULT 0,
    [type] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [BalanceLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [BalanceLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Orders] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [createUserId] UNIQUEIDENTIFIER NOT NULL,
    [amount] INT NOT NULL,
    [outTradeNo] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [payH5Url] NVARCHAR(1000),
    [prepayId] UNIQUEIDENTIFIER,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Orders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Counterfoils] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [orderId] UNIQUEIDENTIFIER NOT NULL,
    [info] NTEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Counterfoils_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Counterfoils_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LoginServices] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [LoginServices_enabled_df] DEFAULT 1,
    [configs] NVARCHAR(2048) NOT NULL CONSTRAINT [LoginServices_configs_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LoginServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LoginServices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Sms] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [signName] NVARCHAR(50) NOT NULL,
    [type] SMALLINT NOT NULL,
    [status] SMALLINT NOT NULL,
    [code] NVARCHAR(10) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sms_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Sms_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PayServices] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [PayServices_enabled_df] DEFAULT 1,
    [configs] NTEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PayServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PayServices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestLogs] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [ip] NVARCHAR(1000),
    [userId] UNIQUEIDENTIFIER,
    [url] NVARCHAR(1000) NOT NULL,
    [method] NVARCHAR(1000) NOT NULL,
    [statusCode] INT NOT NULL,
    [responseTime] NVARCHAR(1000) NOT NULL,
    [requestTime] NVARCHAR(1000) NOT NULL,
    [headers] NTEXT,
    [request] NTEXT,
    [response] NTEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RequestLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ModelKeys] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [configs] NVARCHAR(2048) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ModelKeys_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ModelKeys_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Prompts] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [type] SMALLINT NOT NULL,
    [content] NVARCHAR(2048),
    [description] NVARCHAR(100),
    [createUserId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Prompts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Prompts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserInitialConfig] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(50) NOT NULL,
    [loginType] NVARCHAR(50),
    [price] DECIMAL(32,16) NOT NULL CONSTRAINT [UserInitialConfig_price_df] DEFAULT 0,
    [models] NVARCHAR(4000) NOT NULL CONSTRAINT [UserInitialConfig_models_df] DEFAULT '[]',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserInitialConfig_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserInitialConfig_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ChatModels] ADD CONSTRAINT [ChatModels_modelKeysId_fkey] FOREIGN KEY ([modelKeysId]) REFERENCES [dbo].[ModelKeys]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Sessions] ADD CONSTRAINT [Sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserModels] ADD CONSTRAINT [UserModels_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Chats] ADD CONSTRAINT [Chats_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Chats] ADD CONSTRAINT [Chats_chatModelId_fkey] FOREIGN KEY ([chatModelId]) REFERENCES [dbo].[ChatModels]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ChatMessages] ADD CONSTRAINT [ChatMessages_chatId_fkey] FOREIGN KEY ([chatId]) REFERENCES [dbo].[Chats]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserBalances] ADD CONSTRAINT [UserBalances_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [Orders_createUserId_fkey] FOREIGN KEY ([createUserId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestLogs] ADD CONSTRAINT [RequestLogs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Prompts] ADD CONSTRAINT [Prompts_createUserId_fkey] FOREIGN KEY ([createUserId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
