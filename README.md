**[English](README_EN.md)** | **简体中文**

`Chats`是一个集成多AI聊天大模型并可以独立动态管理配置每个AI大模型的网站

![Chats](chats.png)

## 功能

- 集成多种聊天大模型
- 支持单个聊天使用多个模型
- 独立动态配置每个大模型
- 多数据库支持

## 支持大模型

- OpenAI
- Azure
- 通义千问
- 月之暗面
- 文心一言
- 零一万物

## 在本地运行

**1. 克隆仓库**

```bash
git clone https://github.com/greywen/chats
```

**2. 安装依赖项**

```bash
npm install
```

**3. 配置数据库**

- 修改 package.json 数据库类型

```json
"prisma": {
    "schema":"./prisma/sqlserver/schema.prisma"
},
```

- 配置数据库连接字符串，project 的根目录中创建一个.env 文件。

postgresql

```bash
DATABASE_URL=postgresql://UserName:Password@localhost:5432/chats?schema=public
```

sqlserver

```bash
DATABASE_URL=sqlserver://localhost:1433;database=chats;trustServerCertificate=true;
```

- 初始化数据库

```
npx prisma migrate deploy
```

- 初始化管理员账号数据 admin/123456

```
npm run db:init
```

**4. 运行网站**

```bash
npm run dev
```

## Docker
```
docker build -t chats .
docker run -e DATABASE_URL=xxxxxxxx -p 3000:3000 chats
```
