# CampusFind - Lost & Found Management System

CampusFind is a robust MERN-stack (MongoDB, Express, React, Node) application designed for campus-wide lost and found management. This repository contains the complete codebase, container configurations, and declarative CI/CD pipelines to build and deploy the application.

---

## 🚀 VM Deployment Overview

Both CampusFind and Task Manager run concurrently on the same Azure VM by utilizing directory isolation and distinct port mappings:

| Application | VM Host Port | VM Container Directory |
|---|---|---|
| **Task Manager (To-Do)** | `8080` | `/home/azureuser/task-manager` |
| **CampusFind** | `8081` | `/home/azureuser/campus-find` |

---

## 🛠️ Jenkins CI/CD Pipeline Configuration

The deployment is fully automated using a declarative Jenkins pipeline defined in the [Jenkinsfile](file:///c:/RV/1-SEM/CampusFind/Jenkinsfile).

### 1. Required Jenkins Credentials
To run this pipeline successfully, you must add the following credentials under **Manage Jenkins > Credentials > System > Global credentials**:

| Credential ID | Kind | Description / Value |
|---|---|---|
| `taskflowregistry-acr-creds` | Username with Password | Azure Container Registry (ACR) credentials. |
| `azure-vm-ssh-creds` | SSH Username with private key | SSH private key file used to deploy to the Azure VM. |
| `wireguard-config` | Secret file | The `wg0.conf` client VPN configuration file. |
| `campusfind-prod-env` | Secret file | The production `.env` file containing backend environment variables. |

---

### 2. Pipeline Execution Stages
1. **Checkout**: Pulls the latest commits from the GitHub repository.
2. **Frontend Build Verification**: Installs npm dependencies and compiles React assets using Vite.
3. **Build Docker Images**: Builds multi-stage production Docker images (`campusfind-backend:latest` and `campusfind-frontend:latest`).
4. **Connect WireGuard VPN**: Installs and connects the Windows-native WireGuard service client to establish a secure private tunnel to the Azure virtual network.
5. **Push to Azure ACR**: Pushes compiled Docker images to Azure Container Registry (ACR).
6. **Deploy to Azure VM**: 
   - Checks for and stops any conflicting legacy container names.
   - Securely copies `docker-compose.prod.yml` and the `.env` secret file to the target subfolder (`/home/azureuser/campus-find`).
   - Logins to the remote Docker registry, pulls the latest images, and starts the container services.
   - Automatically executes the database seeding script (`node setup.js`) to generate initial accounts.
7. **Post Actions (Cleanup)**: Logs out of ACR, stops/uninstalls the WireGuard VPN tunnel, and prunes unused images to optimize host disk usage.

---

## 📂 Local Development Setup

To run CampusFind on your local computer:

1. Create a `backend/.env` file with these values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://mongodb:27017/campusfind
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=24h
   ADMIN_ACCOUNTS='[{"email":"admin@rvce.edu.in","password":"StrongPassword123!"}]'
   ```
2. Start the local multi-container composition:
   ```bash
   docker compose up --build
   ```
3. Access the web app at **`http://localhost:8081`**. The React application uses a dev-proxy defined in `vite.config.js` to route all `/api` and `/uploads` requests automatically.

---

## 🛡️ Sandbox & Testing Helpers

To facilitate manual testing and demo runs, the application has two special developer workflows built in:

### 1. Database Auto-Seeding
When the backend service starts, it automatically executes `node setup.js` to check the `ADMIN_ACCOUNTS` array inside the `.env` file and creates the accounts if they do not exist.
- **Default Admin Account**:
  - **Email**: `admin@rvce.edu.in`
  - **Password**: `StrongPassword123!`

### 2. Universal OTP Bypass
Since Gmail/SMTP networks are often blocked in sandbox environments or require app passwords, the OTP verification service is configured with a bypass code:
- Register any user ending in `@rvce.edu.in`.
- When prompted for the OTP code, enter **`123456`**. Verification will succeed instantly!
