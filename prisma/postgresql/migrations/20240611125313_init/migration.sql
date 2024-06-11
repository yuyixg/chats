-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "avatar" TEXT,
    "account" TEXT,
    "username" TEXT,
    "password" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT '-',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "provider" TEXT,
    "sub" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileServices" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "configs" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModels" (
    "id" UUID NOT NULL,
    "modelProvider" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "remarks" TEXT,
    "modelKeysId" UUID,
    "fileServiceId" UUID,
    "fileConfig" VARCHAR(2048) DEFAULT '{}',
    "modelConfig" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "priceConfig" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserModels" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "models" VARCHAR(4000) NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chats" (
    "id" UUID NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "userId" UUID NOT NULL,
    "chatModelId" UUID,
    "userModelConfig" TEXT NOT NULL DEFAULT '{}',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessages" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "parentId" UUID,
    "chatModelId" UUID,
    "role" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "calculatedPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tokenUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalances" (
    "id" UUID NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBalances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceLogs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "messageId" UUID,
    "createUserId" UUID NOT NULL,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" UUID NOT NULL,
    "createUserId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "outTradeNo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payH5Url" TEXT,
    "prepayId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counterfoils" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Counterfoils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginServices" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configs" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sms" (
    "id" UUID NOT NULL,
    "signName" VARCHAR(50) NOT NULL,
    "type" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayServices" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLogs" (
    "id" UUID NOT NULL,
    "ip" TEXT,
    "userId" UUID,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" TEXT NOT NULL,
    "requestTime" TEXT NOT NULL,
    "headers" TEXT,
    "request" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelKeys" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "configs" VARCHAR(2028) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" SMALLINT NOT NULL,
    "content" VARCHAR(2048),
    "description" VARCHAR(100),
    "createUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInitialConfig" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "loginType" VARCHAR(50),
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "models" VARCHAR(4000) NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInitialConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configs" (
    "key" TEXT NOT NULL,
    "value" VARCHAR(1000) NOT NULL,
    "description" VARCHAR(50)
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "count" SMALLINT NOT NULL,
    "createUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvitation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "invitationCodeId" UUID NOT NULL,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBalances_userId_key" ON "UserBalances"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Configs_key_key" ON "Configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_value_key" ON "InvitationCode"("value");

-- AddForeignKey
ALTER TABLE "ChatModels" ADD CONSTRAINT "ChatModels_modelKeysId_fkey" FOREIGN KEY ("modelKeysId") REFERENCES "ModelKeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModels" ADD CONSTRAINT "UserModels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_chatModelId_fkey" FOREIGN KEY ("chatModelId") REFERENCES "ChatModels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBalances" ADD CONSTRAINT "UserBalances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_createUserId_fkey" FOREIGN KEY ("createUserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestLogs" ADD CONSTRAINT "RequestLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_createUserId_fkey" FOREIGN KEY ("createUserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCode" ADD CONSTRAINT "InvitationCode_createUserId_fkey" FOREIGN KEY ("createUserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_invitationCodeId_fkey" FOREIGN KEY ("invitationCodeId") REFERENCES "InvitationCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
