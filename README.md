**[English](README_EN.md)** | **简体中文** ![docker pulls](https://img.shields.io/docker/pulls/sdcb/chats)

Sdcb Chats 是一个强大且灵活的大语言模型前端，支持多种功能和平台。无论您是希望管理多种模型接口，还是需要一个简单的部署流程，Sdcb Chats 都能满足您的需求。

![image](https://github.com/user-attachments/assets/30658e52-1537-4b79-b711-1c43d3307c40)

## 功能特性

- **多语言模型支持**：动态管理多种大语言模型接口。
- **视觉模型支持**：集成视觉模型，增强用户交互体验。
- **用户权限管理**：提供精细的用户权限设置，确保安全性。
- **账户余额管理**：实时跟踪和管理用户账户余额。
- **模型管理**：轻松添加、删除和配置模型。
- **API 网关功能**：基于 OpenAI 协议透明地转发用户的聊天请求。
- **简单部署**：支持 4 种操作系统/平台架构的 Docker 镜像。此外，提供 7 种不同操作系统的可执行文件，方便不使用 Docker 的用户一键部署。
- **多数据库支持**: 兼容 SQLite、SQL Server 和 PostgreSQL 数据库，除了数据库外，不依赖其他组件。
- **多文件服务支持**: 兼容本地文件，AWS S3、Minio、Aliyun OSS、Azure Blob Storage等文件服务，可运行时配置修改。


## 快速开始

### 使用 Docker 部署应用

对于大多数用户而言，Docker 提供了最简单快速的部署方式。以下是一步到位的部署命令：

```bash
mkdir ./AppData && chmod 777 ./AppData && docker run --restart unless-stopped --name sdcb-chats -e DBType=sqlite -e ConnectionStrings__ChatsDB="Data Source=./AppData/chats.db" -v ./AppData:/app/AppData -p 8080:8080 sdcb/chats:latest
```

#### 说明：

- **数据库存储位置**：默认情况下，应用的 SQLite 数据库会在 `./AppData` 目录下创建。为了避免每次重新启动 Docker 容器时数据库被意外清空，我们首先创建一个 `AppData` 文件夹并将其权限设置为可写（`chmod 777`）。
  
- **端口映射**：该命令将容器的 8080 端口映射到主机的 8080 端口，使得您可以通过 `http://localhost:8080` 访问应用。

- **数据库类型配置**：`DBType` 环境变量指定数据库类型，默认值为 `sqlite`。除了 SQLite，该应用还支持使用 `mssql`（SQL Server）和 `postgresql`（PGSQL）作为数据库选项。

- **连接字符串**：`ConnectionStrings__ChatsDB` 的默认值为 `Data Source=./AppData/chats.db`，它是连接数据库的 ADO.NET 连接字符串。

- **简化运行命令**：如果您的 `AppData` 目录已经创建并且 Docker 用户对其有写入权限，可以简化启动命令如下：

    ```bash
    docker run --restart unless-stopped --name sdcb-chats -v ./AppData:/app/AppData -p 8080:8080 sdcb/chats:latest
    ```

- **数据库初始化**：容器启动后，如果数据库文件不存在，将自动创建并插入初始数据。初始管理员用户名为 `admin`，默认密码为 `please reset your password`。强烈建议您在首次登录后立即前往左下角的用户管理界面，设置一个新密码以确保安全。

通过以上步骤，您将能顺利使用 Docker 部署和运行应用。如果在部署过程中遇到任何问题，可以联系我们。

Chats提供了以下几个镜像：

| 描述                          | Docker 镜像                                          |
| ----------------------------- | --------------------------------------------------- |
| Latest                        | docker.io/sdcb/chats:latest                         |
| r{version}                    | docker.io/sdcb/chats:r{version}                     |
| Linux x64                     | docker.io/sdcb/chats:r{version}-linux-x64           |
| Linux ARM64                   | docker.io/sdcb/chats:r{version}-linux-arm64         |
| Windows Nano Server 1809      | docker.io/sdcb/chats:r{version}-nanoserver-1809     |
| Windows Nano Server LTSC 2022 | docker.io/sdcb/chats:r{version}-nanoserver-ltsc2022 |

**说明：**

- `Latest` 和 `r{version}` 镜像中已经包含了以下四个操作系统版本的支持：
  - Linux x64
  - Linux ARM64
  - Windows Nano Server 1809（适用于 Windows Server 2019）
  - Windows Nano Server LTSC 2022（适用于 Windows Server 2022）

因此，用户在使用 `docker pull` 时，无需指定具体的操作系统版本，Docker 会自动选择适合您系统的正确版本。这一功能是通过 Docker 的 manifest 创建实现的，确保了用户能够轻松获取与其环境兼容的镜像。

请注意，`r{version}` 中的 `{version}` 表示具体的版本号，例如 `r132`（在编写文档时的最新版本号）。

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
