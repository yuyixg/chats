-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "account" TEXT,
    "username" TEXT,
    "password" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rank" INTEGER,
    "remarks" TEXT,
    "fileServerId" TEXT,
    "fileConfig" VARCHAR(2048) DEFAULT '{}',
    "apiConfig" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "modelConfig" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "priceConfig" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserModels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "models" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatModelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "messages" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "chatCount" INTEGER NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalances" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBalances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceLogs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createUserId" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalanceLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "createUserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "outTradeNo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payH5Url" TEXT,
    "prepayId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counterfoils" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Counterfoils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginServices" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configs" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSms" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayServices" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configs" VARCHAR(2048) NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLogs" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "userId" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "Users_account_key" ON "Users"("account");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "FileServices_name_key" ON "FileServices"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserBalances_userId_key" ON "UserBalances"("userId");

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModels" ADD CONSTRAINT "UserModels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chatModelId_fkey" FOREIGN KEY ("chatModelId") REFERENCES "ChatModels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBalances" ADD CONSTRAINT "UserBalances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_createUserId_fkey" FOREIGN KEY ("createUserId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestLogs" ADD CONSTRAINT "RequestLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
