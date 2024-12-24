**English** | **[简体中文](README.md)** ![docker pulls](https://img.shields.io/docker/pulls/sdcb/chats) [![QQ](https://img.shields.io/badge/QQ_Group-498452653-52B6EF?style=social&logo=tencent-qq&logoColor=000&logoWidth=20)](https://qm.qq.com/q/AM8tY9cAsS)

Sdcb Chats is a powerful and flexible frontend for large language models that supports various features and platforms. Whether you want to manage multiple model interfaces or need a simple deployment process, Sdcb Chats can meet your needs.

![image](https://github.com/user-attachments/assets/30658e52-1537-4b79-b711-1c43d3307c40)

## Features

- **Multi-model support**: Dynamically manage multiple large language model interfaces.
- **Visual model support**: Integrate visual models to enhance user interaction experience.
- **User permission management**: Provide fine-grained user permission settings to ensure security.
- **Account balance management**: Track and manage user account balances in real-time.
- **Model management**: Easily add, delete, and configure models.
- **API gateway functionality**: Transparently forward user chat requests based on the OpenAI protocol.
- **Simple deployment**: Support Docker images for 4 operating system/platform architectures. Additionally, provide executables for 8 different operating systems for users who do not use Docker for one-click deployment.
- **Multi-database support**: Compatible with SQLite, SQL Server, and PostgreSQL databases, with no dependence on other components besides the database.
- **Multi-file service support**: Compatible with local files, AWS S3, Minio, Aliyun OSS, Azure Blob Storage, etc., with runtime configuration modifications.
- **Multiple login method support**: Supports Keycloak SSO and phone SMS code login.

## Quick Start

### Development Documentation

Chats is developed using `C#`/`TypeScript`. For information on how to compile Chats, please refer to the [development documentation link](./doc/en-US/build.md).

### Docker Deployment

For most users, Docker provides the simplest and fastest way to deploy. Here is an all-in-one deployment command:

```bash
mkdir ./AppData && chmod 777 ./AppData && docker run --restart unless-stopped --name sdcb-chats -e DBType=sqlite -e ConnectionStrings__ChatsDB="Data Source=./AppData/chats.db" -v ./AppData:/app/AppData -p 8080:8080 sdcb/chats:latest
```

#### Explanation:

- **Database storage location**: By default, the SQLite database for Chats will be created in the `./AppData` directory. To avoid accidental clearing of the database each time the Docker container is restarted, we first create an `AppData` folder and set its permissions to writable (`chmod 777`).
  
- **Port mapping**: This command maps port 8080 of the container to port 8080 of the host, allowing you to access the application via `http://localhost:8080`.

- **Database type configuration**: The `DBType` environment variable specifies the database type, with the default value being `sqlite`. Besides SQLite, the application also supports using `mssql` (or `sqlserver`) and `postgresql` (or `pgsql`) as database options.

- **Connection string**: The default value of `ConnectionStrings__ChatsDB` is `Data Source=./AppData/chats.db`, which is the ADO.NET connection string for connecting to the database.

- **Non-first-time run**: If your `AppData` directory is already created and Docker has write permission to it, you can simplify the start command as follows:

    ```bash
    docker run --restart unless-stopped --name sdcb-chats -v ./AppData:/app/AppData -p 8080:8080 sdcb/chats:latest
    ```

- **Database initialization**: After the container starts, if the database file does not exist, it will be automatically created and initial data inserted. The initial admin username is `chats`, and the default password is `RESET!!!`. It is strongly recommended that you immediately set a new password in the user management interface at the bottom left after logging in for the first time to ensure security.

By following the above steps, you will be able to use Docker to successfully deploy and run the application. If you encounter any problems during deployment, feel free to contact us.

Chats provides the following images:

| Description                     | Docker Image                                    |
| ------------------------------- | ------------------------------------------------|
| Latest                          | docker.io/sdcb/chats:latest                     |
| r{version}                      | docker.io/sdcb/chats:r{version}                 |
| Linux x64                       | docker.io/sdcb/chats:r{version}-linux-x64       |
| Linux ARM64                     | docker.io/sdcb/chats:r{version}-linux-arm64     |
| Windows Nano Server 1809        | docker.io/sdcb/chats:r{version}-nanoserver-1809 |
| Windows Nano Server LTSC 2022   | docker.io/sdcb/chats:r{version}-nanoserver-ltsc2022 |

**Note:**

- The `Latest` and `r{version}` images already include support for the following four operating system versions:
  - Linux x64
  - Linux ARM64
  - Windows Nano Server 1809 (suitable for Windows Server 2019)
  - Windows Nano Server LTSC 2022 (suitable for Windows Server 2022)

Therefore, when using `docker pull`, users do not need to specify a particular operating system version, as Docker will automatically choose the correct version suitable for your system. This functionality is achieved through Docker's manifest creation, ensuring that users can easily obtain the image compatible with their environment.

Please note, in `r{version}`, `{version}` represents the specific version number, such as `r141` (the latest version number at the time of writing this document).

### Executable Deployment Guide

For environments where using Docker is inconvenient, Chats provides direct deployment options for 8 types of operating systems or architectures. You can obtain the corresponding compiled package from the following links:

| Platform              | GitHub Download Link                                                                                              | Alternative Download Link                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Windows 64-bit        | [chats-win-x64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-win-x64.zip)                     | [chats-win-x64.7z](https://io.starworks.cc:88/chats/latest/chats-win-x64.7z)                               |
| Linux 64-bit          | [chats-linux-x64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-linux-x64.zip)                 | [chats-linux-x64.7z](https://io.starworks.cc:88/chats/latest/chats-linux-x64.7z)                           |
| Linux ARM64           | [chats-linux-arm64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-linux-arm64.zip)             | [chats-linux-arm64.7z](https://io.starworks.cc:88/chats/latest/chats-linux-arm64.7z)                       |
| Linux musl x64        | [chats-linux-musl-x64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-linux-musl-x64.zip)       | [chats-linux-musl-x64.7z](https://io.starworks.cc:88/chats/latest/chats-linux-musl-x64.7z)                 |
| Linux musl ARM64      | [chats-linux-musl-arm64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-linux-musl-arm64.zip)   | [chats-linux-musl-arm64.7z](https://io.starworks.cc:88/chats/latest/chats-linux-musl-arm64.7z)             |
| macOS ARM64           | [chats-osx-arm64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-osx-arm64.zip)                 | [chats-osx-arm64.7z](https://io.starworks.cc:88/chats/latest/chats-osx-arm64.7z)                           |
| macOS x64             | [chats-osx-x64.zip](https://github.com/sdcb/chats/releases/latest/download/chats-osx-x64.zip)                     | [chats-osx-x64.7z](https://io.starworks.cc:88/chats/latest/chats-osx-x64.7z)                               |
| Generic package dependent on .NET | [chats.zip](https://github.com/sdcb/chats/releases/latest/download/chats.zip)                                      | [chats.7z](https://io.starworks.cc:88/chats/latest/chats.7z)                                  |
| Pure front-end files  | [chats-fe.zip](https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip)                               | [chats-fe.7z](https://io.starworks.cc:88/chats/latest/chats-fe.7z)                                         |

### Version and Download Instructions

1. **Specific Version Download Address**:
   - To download a specific version of Chats, replace `release/latest/download` in the link with `releases/download/r-{version}`. For example, the Linux ARM64 file link for version `141` is:
     ```
     https://github.com/sdcb/chats/releases/download/r-141/chats-linux-arm64.zip
     ```

2. **Alternative Download Base Address**:
   - In case of access issues, you can use the alternative download address, adjust {version} to the specific version number or use `latest`:
     ```
     https://io.starworks.cc:88/chats/r{version}/{artifact-id}.zip
     ```
   - For example, to directly download the latest Windows 64-bit version via the alternative download:
     ```
     https://io.starworks.cc:88/chats/latest/chats-win-x64.7z
     ```

### Executable Directory Structure and Running Instructions

The directory structure after extracting the AOT executable files is as follows:

```
C:\Users\ZhouJie\Downloads\chats-win-x64>dir
 2024/12/06  16:35    <DIR>          .
 2024/12/06  16:35    <DIR>          ..
 2024/12/06  16:35               119 appsettings.Development.json
 2024/12/06  16:35               417 appsettings.json
 2024/12/06  16:35           367,144 aspnetcorev2_inprocess.dll
 2024/12/06  16:35        84,012,075 Chats.BE.exe
 2024/12/06  16:35           200,296 Chats.BE.pdb
 2024/12/06  16:35         1,759,232 e_sqlite3.dll
 2024/12/06  16:35           504,872 Microsoft.Data.SqlClient.SNI.dll
 2024/12/06  16:35               465 web.config
 2024/12/06  16:35    <DIR>          wwwroot
```

- **Start Application**: Run `Chats.BE.exe` to start the Chats application. Although this filename indicates "backend," it actually contains both frontend and backend components.
- **Database Configuration**: By default, the application will create a directory named `AppData` in the current directory and use SQLite as the database. Command-line parameters can be used to specify a different database type:
  ```pwsh
  .\Chats.BE.exe --DBType=mssql --ConnectionStrings:ChatsDB="Data Source=(localdb)\mssqllocaldb; Initial Catalog=ChatsDB; Integrated Security=True"
  ```
  - Parameter `DBType`: Options are `sqlite`, `mssql`, or `pgsql`.
  - Parameter `--ConnectionStrings:ChatsDB`: For specifying the ADO.NET connection string for the database.

#### Special Note

- For the downloaded `chats.zip`, .NET SDK support will be required. Install the .NET runtime, then use `dotnet Chats.BE.dll` to start the program.

### Supported LLMs

- Azure OpenAI
- Tencent HunYuan
- 01.ai
- Moonshot
- OpenAI (or OpenAI API compatible APIs, like ollama)
- Wenxin Qianfan
- Aliyun DashScope
- Xunfei Sparkdesk
- DeepSeek
- x.AI
- GitHub Models
