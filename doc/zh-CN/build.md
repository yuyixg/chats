# Chats 开发指南

欢迎使用 Chats！这个指南将帮助您快速上手开发，了解如何在开发阶段使用和配置 Chats 项目。Chats 在开发阶段采用前后端分离的模式，但在生产环境中前后端会合并为一个发布包。

## 技术基础

- **后端：** 使用 C#/ASP.NET Core 开发。
- **前端：** 使用 Next.js/React/TypeScript 开发。
- **CSS：** 使用 Tailwind CSS。

## 环境需求

- Git
- .NET SDK 8.0
- Node.js >= 20
- Visual Studio Code
- Visual Studio 2022（可选但推荐）

## 获取代码

首先，克隆 Chats 的代码仓库：

```bash
git clone https://github.com/sdcb/chats.git
```

## 前后端共同开发

### 后端开发指南

1. 使用 Visual Studio 打开解决方案：

    在根目录下找到 `chats/Chats.sln` 解决方案文件并打开。在 Visual Studio 中，您将看到一个名为 `Chats.BE` 的网站项目。

2. 运行项目：

    - 按 F5 运行项目。默认配置会检查 SQLite 数据库文件 `chats.db` 是否存在，如果不存在，会自动创建在 `./AppData` 目录并初始化数据库。
    - 服务将在 `http://localhost:5146` 上运行，并提供 API 服务。如果在开发模式下运行 (`ASPNETCORE_ENVIRONMENT=Development`)，Swagger UI 将在 `http://localhost:5146/swagger` 上可用。

3. 配置文件说明：

   默认配置在 `appsettings.json` 中，但强烈建议使用 `userSecrets.json` 管理敏感信息。这可以避免在代码库中泄露敏感的开发配置。

   **默认配置结构如下：**

   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AllowedHosts": "*",
     "FE_URL": "http://localhost:3001",
     "ENCRYPTION_PASSWORD": "this is used for encrypt auto increment int id, please set as a random string.",
     "DBType": "sqlite",
     "ConnectionStrings": {
       "ChatsDB": "Data Source=./AppData/chats.db"
     }
   }
   ```

   **配置选项解释：**

   - `Logging`: 管理日志级别，默认记录信息级别的日志。
   - `AllowedHosts`: 配置允许访问的主机名，`*` 表示接受所有。
   - `FE_URL`: 前端的URL，默认指向 `http://localhost:3001`。前端可以通过 CORS 跨域访问后端。默认3000端口无需额外配置。
   - `DBType`: 数据库类型，支持 `sqlite`（默认）、`mssql` 和 `postgresql`。
   - `ConnectionStrings:ChatsDB`: 数据库 `ADO.NET` 连接字符串，随 `DBType` 而变。
   - `ENCRYPTION_PASSWORD`: 用于加密自增 ID。生产环境中应设置为随机字符串，避免直接暴露 ID。

   **为什么使用整数+加密而非 GUID？**
   
   在 Chats 项目初期，我们确实是使用的GUID，但是由于下列2个原因并经过慎重考虑，我换成了自增整数Id：
   - GUID 字段较大，占用更多空间；
   - GUID 作为聚集索引会导致索引碎片，影响性能；
   

   **管理敏感配置：**

   不建议在 `appsettings.json` 中直接修改配置项。可以通过 Visual Studio 使用 `userSecrets.json`：

   - Visual Studio: 右键点击 `Chats.BE` 项目 -> `管理用户机密`。
   - CLI: 使用以下命令管理用户机密。

     ```bash
     dotnet user-secrets init
     dotnet user-secrets set "key" "value"
     dotnet user-secrets list
     ```

   这可以避免在提交代码时不小心将敏感信息上传。

4. 不使用 Visual Studio 的运行方式：

   进入后端目录：

   ```bash
   cd ./chats/src/BE
   dotnet run
   ```

### 前端开发指南

1. 进入前端目录：

    ```bash
    cd ./chats/src/FE
    ```

2. 创建 `.env.local` 文件并指定后端 URL：

    ```bash
    echo "API_URL=http://localhost:5146" > .env.local
    ```

3. 安装依赖并运行开发服务器：

    ```bash
    npm i
    npm run dev
    ```

运行后，前端服务将监听 `http://localhost:3000`。后端已有 CORS 配置支持无需额外配置。

## 仅前端开发

对于专注于前端开发的场景，我们提供了一个已经部署好的后端开发环境：

1. 克隆仓库：

    ```bash
    git clone https://github.com/sdcb/chats.git
    ```

2. 进入前端目录并指定远程后端：

    ```bash
    cd ./chats/src/FE
    echo "API_URL=https://chats-dev.starworks.cc:88" > .env.local
    ```

    这个环境已经默认允许了 http://localhost:3000 这个地址的跨域访问行为。

3. 安装依赖并运行：

    ```bash
    npm i
    npm run dev
    ```

### 注意事项

如果想模拟生产打包过程，请执行：

```bash
npm run build
```

此命令会在当前目录生成 `./out` 文件夹，其中包含所有必要的静态文件。

## 仅后端开发

对于专注于后端开发的场景，可以使用打包好的前端文件：

1. 克隆仓库并进入后端目录：

    ```bash
    git clone https://github.com/sdcb/chats.git
    cd ./chats/src/BE
    ```

2. 下载并解压前端静态文件放置到 `wwwroot`：

   **Linux 下执行：**

   ```bash
   curl -O https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip
   unzip chats-fe.zip
   cp -r chats-fe/* wwwroot/
   ```

   **Windows 下执行：**

   ```powershell
   Invoke-WebRequest -Uri "https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip" -OutFile "chats-fe.zip"
   Expand-Archive -Path "chats-fe.zip" -DestinationPath "."
   Copy-Item -Path ".\chats-fe\*" -Destination ".\wwwroot" -Recurse -Force
   ```

   ### 注意
   1. 我同时还将上述的 https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip 地址上传到了我个人的 Minio 文件服务器，地址为：http://io.starworks.cc:88/chats/latest/chats-fe.zip
   
      如果您直接从 Github 上下载速度太慢，可以换成这个地址。
   
   2. 这个地址对应的 `chats-fe.zip` 附件是由 Github Actions 在代码合入 `main` 分支时自动生成来而，合入 `dev` 分支时并不会触发更新这个文件。

3. 运行后端：

    ```bash
    dotnet run
    ```

    或者在 Visual Studio 中打开 `Chats.sln` 并运行 `Chats.BE` 项目。

运行后，访问 `http://localhost:5146/login` 可以直接进入 Chats 的登录界面，实现前后端不分离的部署模式。

希望此指南可以帮助您顺利开展 Chats 项目的开发工作。如有任何问题，请查看源码中的文档或在 https://github.com/sdcb/chats 中创建issue来获得支持。