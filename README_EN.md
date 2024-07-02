**English** | **[简体中文](README.md)**

`Chats` is a website that integrates multiple AI chat models and allows for independent dynamic configuration of each AI model.

![image](https://github.com/greywen/chats/assets/1317141/2f73cfa6-6c0c-4edb-9e87-8c770b8f2fe1)

## Features

- Integration of various chat models
- Support for using multiple models in a single chat session
- Independent dynamic configuration for each model
- Multi-database support

## Supported Models:

- OpenAI
- Azure
- 通义千问
- Moonshot
- 文心一言
- 零一万物

## Running Locally

**1. Clone the Repository**

```bash
git clone https://github.com/greywen/chats
```

**2. Install Dependencies**

```bash
npm install
```

**3. Configure the Database**

- Modify the database type in package.json

```json
"prisma": {
    "schema":"./prisma/sqlserver/schema.prisma"
},
```

- Configure the database connection string by creating a .env file in the project's root directory.

For PostgreSQL

```bash
DATABASE_URL=postgresql://UserName:Password@localhost:5432/chats?schema=public
```

For SQL Server

```bash
DATABASE_URL=sqlserver://localhost:1433;database=chats;trustServerCertificate=true;
```

- Initialize the database

```
npx prisma migrate deploy
```

- Initialize admin account data admin/123456

```
npm run db:init
```

**4. Run the Website**

```bash
npm run dev
```

## Docker
```
docker build -t chats .
docker run -e DATABASE_URL=xxxxxxxx -p 3000:3000 chats
```
