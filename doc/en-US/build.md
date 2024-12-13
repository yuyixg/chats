# Chats Development Guide

Welcome to Chats! This guide will help you quickly get started with development and understand how to use and configure the Chats project during the development phase. In the development phase, Chats adopts a front-end and back-end separation model, but in production, they will be combined into a single deployment package.

## Technology Stack

- **Backend:** Developed using C#/ASP.NET Core.
- **Frontend:** Developed using Next.js/React/TypeScript.
- **CSS:** Utilizes Tailwind CSS.

## Environment Requirements

- Git
- .NET SDK 8.0
- Node.js >= 20
- Visual Studio Code
- Visual Studio 2022 (optional but recommended)

## Obtaining the Code

First, clone the Chats code repository:

```bash
git clone https://github.com/sdcb/chats.git
```

## Joint Frontend and Backend Development

### Backend Development Guide

1. Use Visual Studio to open the solution:

    Locate the `chats/Chats.sln` solution file in the root directory and open it. In Visual Studio, you'll see a website project named `Chats.BE`.

2. Run the project:

    - Press F5 to run the project. The default configuration will check if the SQLite database file `chats.db` exists, and if not, it will automatically create it in the `./AppData` directory and initialize the database.
    - The service will run on `http://localhost:5146`, providing API services. If running in development mode (`ASPNETCORE_ENVIRONMENT=Development`), Swagger UI will be available at `http://localhost:5146/swagger`.

3. Configuration file explanation:

   The default configuration is located in `appsettings.json`, but it is strongly recommended to manage sensitive information using `userSecrets.json`. This can prevent accidental exposure of sensitive development configurations in the code base.

   **Default configuration structure:**

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

   **Configuration options explanation:**

   - `Logging`: Manages log level; defaults to recording information level logs.
   - `AllowedHosts`: Configures allowed host names; `*` accepts all hosts.
   - `FE_URL`: Frontend URL, defaults to `http://localhost:3001`. The frontend can access the backend via CORS, with no extra configuration required for port 3000.
   - `DBType`: Database type, supporting `sqlite` (default), `mssql`, and `postgresql`.
   - `ConnectionStrings:ChatsDB`: Database `ADO.NET` connection string, varying based on `DBType`.
   - `ENCRYPTION_PASSWORD`: Used for encrypting auto-increment integer IDs. In a production environment, it should be set to a random string to avoid direct exposure of IDs.

   **Why use integer + encryption instead of GUID?**
   
   Initially, the Chats project used GUIDs, but due to the following two reasons and careful consideration, it was switched to auto-increment integer IDs:
   - GUID fields are larger, taking up more space;
   - GUIDs as clustered indexes can lead to index fragmentation, affecting performance;
   

   **Managing sensitive configurations:**

   It's not recommended to directly modify configuration items in `appsettings.json`. Instead, use `userSecrets.json` via Visual Studio:

   - Visual Studio: Right-click the `Chats.BE` project -> `Manage User Secrets`.
   - CLI: Manage user secrets with the following commands.

     ```bash
     dotnet user-secrets init
     dotnet user-secrets set "key" "value"
     dotnet user-secrets list
     ```

   This helps avoid accidentally uploading sensitive information when committing code.

4. Running without Visual Studio:

   Navigate to the backend directory:

   ```bash
   cd ./chats/src/BE
   dotnet run
   ```

### Frontend Development Guide

1. Navigate to the frontend directory:

    ```bash
    cd ./chats/src/FE
    ```

2. Create a `.env.local` file and specify the backend URL:

    ```bash
    echo "API_URL=http://localhost:5146" > .env.local
    ```

3. Install dependencies and run the development server:

    ```bash
    npm i
    npm run dev
    ```

After running, the frontend service will listen on `http://localhost:3000`. The backend already supports CORS configuration with no extra setup needed.

## Frontend Only Development

For frontend-focused development scenarios, we provide a pre-deployed backend development environment:

1. Clone the repository:

    ```bash
    git clone https://github.com/sdcb/chats.git
    ```

2. Enter the frontend directory and specify the remote backend:

    ```bash
    cd ./chats/src/FE
    echo "API_URL=https://chats-dev.starworks.cc:88" > .env.local
    ```

    This environment already allows cross-origin access behavior from http://localhost:3000.

3. Install dependencies and run:

    ```bash
    npm i
    npm run dev
    ```

### Notes

To simulate a production build process, execute:

```bash
npm run build
```

This command will generate an `./out` folder in the current directory containing all necessary static files.

## Backend Only Development

For backend-focused development scenarios, you can use packaged frontend files:

1. Clone the repository and navigate to the backend directory:

    ```bash
    git clone https://github.com/sdcb/chats.git
    cd ./chats/src/BE
    ```

2. Download and extract frontend static files into `wwwroot`:

   **On Linux:**

   ```bash
   curl -O https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip
   unzip chats-fe.zip
   cp -r chats-fe/* wwwroot/
   ```

   **On Windows:**

   ```powershell
   Invoke-WebRequest -Uri "https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip" -OutFile "chats-fe.zip"
   Expand-Archive -Path "chats-fe.zip" -DestinationPath "."
   Copy-Item -Path ".\chats-fe\*" -Destination ".\wwwroot" -Recurse -Force
   ```

   ### Note
   1. I have also uploaded the above https://github.com/sdcb/chats/releases/latest/download/chats-fe.zip to my personal Minio file server at: http://io.starworks.cc:88/chats/latest/chats-fe.zip
   
      If downloading directly from GitHub is too slow, you can use this address instead.
   
   2. The attached `chats-fe.zip` is automatically generated by GitHub Actions when code is merged into the `main` branch, not triggered for `dev` branch merges.

3. Run the backend:

    ```bash
    dotnet run
    ```

    Alternatively, open `Chats.sln` in Visual Studio and run the `Chats.BE` project.

Once running, visiting `http://localhost:5146/login` will directly take you to the Chats login page, realizing a deployment mode where front-end and back-end are not separated.

I hope this guide will assist you in successfully developing the Chats project. If you have any questions, please refer to the documentation in the source code or create an issue at https://github.com/sdcb/chats to receive support.