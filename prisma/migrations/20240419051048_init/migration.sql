BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] NVARCHAR(1000) NOT NULL,
    [avatar] NVARCHAR(1000),
    [account] NVARCHAR(1000),
    [username] NVARCHAR(1000),
    [password] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [Users_role_df] DEFAULT '-',
    [enabled] BIT NOT NULL CONSTRAINT [Users_enabled_df] DEFAULT 1,
    [provider] NVARCHAR(1000),
    [sub] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_account_key] UNIQUE NONCLUSTERED ([account]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [Users_phone_key] UNIQUE NONCLUSTERED ([phone])
);

-- CreateTable
CREATE TABLE [dbo].[FileServices] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [FileServices_enabled_df] DEFAULT 1,
    [type] NVARCHAR(1000) NOT NULL,
    [configs] VARCHAR(2048) NOT NULL CONSTRAINT [FileServices_configs_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FileServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [FileServices_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FileServices_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[ChatModels] (
    [id] NVARCHAR(1000) NOT NULL,
    [modelVersion] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [rank] INT,
    [remarks] NVARCHAR(1000),
    [fileServerId] NVARCHAR(1000),
    [fileConfig] VARCHAR(2048) CONSTRAINT [ChatModels_fileConfig_df] DEFAULT '{}',
    [apiConfig] VARCHAR(2048) NOT NULL CONSTRAINT [ChatModels_apiConfig_df] DEFAULT '{}',
    [modelConfig] VARCHAR(2048) NOT NULL CONSTRAINT [ChatModels_modelConfig_df] DEFAULT '{}',
    [priceConfig] VARCHAR(2048) NOT NULL CONSTRAINT [ChatModels_priceConfig_df] DEFAULT '{}',
    [enabled] BIT NOT NULL CONSTRAINT [ChatModels_enabled_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChatModels_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ChatModels_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Sessions] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sessions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Sessions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserModels] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [models] NVARCHAR(1000) NOT NULL CONSTRAINT [UserModels_models_df] DEFAULT '[]',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserModels_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserModels_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [chatModelId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [prompt] NVARCHAR(1000),
    [messages] TEXT NOT NULL,
    [tokenCount] INT NOT NULL CONSTRAINT [Messages_tokenCount_df] DEFAULT 0,
    [chatCount] INT NOT NULL CONSTRAINT [Messages_chatCount_df] DEFAULT 0,
    [totalPrice] DECIMAL(32,16) NOT NULL CONSTRAINT [Messages_totalPrice_df] DEFAULT 0,
    [isDeleted] BIT CONSTRAINT [Messages_isDeleted_df] DEFAULT 0,
    [isShared] BIT NOT NULL CONSTRAINT [Messages_isShared_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserBalances] (
    [id] NVARCHAR(1000) NOT NULL,
    [balance] DECIMAL(32,16) NOT NULL CONSTRAINT [UserBalances_balance_df] DEFAULT 0,
    [userId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserBalances_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserBalances_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserBalances_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[BalanceLogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [createUserId] NVARCHAR(1000) NOT NULL,
    [value] DECIMAL(32,16) NOT NULL CONSTRAINT [BalanceLogs_value_df] DEFAULT 0,
    [type] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [BalanceLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [BalanceLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Orders] (
    [id] NVARCHAR(1000) NOT NULL,
    [createUserId] NVARCHAR(1000) NOT NULL,
    [amount] INT NOT NULL,
    [outTradeNo] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [payH5Url] NVARCHAR(1000),
    [prepayId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Orders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Counterfoils] (
    [id] NVARCHAR(1000) NOT NULL,
    [orderId] NVARCHAR(1000) NOT NULL,
    [info] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Counterfoils_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Counterfoils_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LoginServices] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [LoginServices_enabled_df] DEFAULT 1,
    [configs] VARCHAR(2048) NOT NULL CONSTRAINT [LoginServices_configs_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LoginServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LoginServices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserSms] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserSms_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserSms_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PayServices] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [enabled] BIT NOT NULL CONSTRAINT [PayServices_enabled_df] DEFAULT 1,
    [configs] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PayServices_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PayServices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RequestLogs] (
    [id] NVARCHAR(1000) NOT NULL,
    [ip] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [url] NVARCHAR(1000) NOT NULL,
    [method] NVARCHAR(1000) NOT NULL,
    [statusCode] INT NOT NULL,
    [responseTime] NVARCHAR(1000) NOT NULL,
    [requestTime] NVARCHAR(1000) NOT NULL,
    [headers] TEXT,
    [request] TEXT,
    [response] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RequestLogs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [RequestLogs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Sessions] ADD CONSTRAINT [Sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserModels] ADD CONSTRAINT [UserModels_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [Messages_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [Messages_chatModelId_fkey] FOREIGN KEY ([chatModelId]) REFERENCES [dbo].[ChatModels]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserBalances] ADD CONSTRAINT [UserBalances_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [Orders_createUserId_fkey] FOREIGN KEY ([createUserId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RequestLogs] ADD CONSTRAINT [RequestLogs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
