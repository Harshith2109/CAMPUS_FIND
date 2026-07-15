pipeline {
    agent any

    environment {
        // Docker registry parameters
        ACR_REGISTRY   = 'taskflowregistry.azurecr.io'
        ACR_CREDS_ID   = 'azure-acr-login'
        
        // Target host VM parameters (Azure Virtual Network Private IP)
        AZURE_VM_PRIVATE_IP = '10.8.0.1'
        SSH_CREDS_ID        = 'azure-vm-ssh-key'
        
        // Image definitions
        BACKEND_IMAGE  = 'taskflowregistry.azurecr.io/campusfind-backend'
        FRONTEND_IMAGE = 'taskflowregistry.azurecr.io/campusfind-frontend'
        
        // WireGuard credentials binding ID
        WG_CREDS_ID    = 'wireguard-wg0-conf'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Build Verification') {
            steps {
                dir('frontend') {
                    script {
                        runCmd "npm install"
                        runCmd "npm run build"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Docker images for CampusFind..."
                    runCmd "docker build -t ${BACKEND_IMAGE}:latest ./backend"
                    runCmd "docker build -t ${FRONTEND_IMAGE}:latest ./frontend"
                }
            }
        }

        stage('Connect WireGuard VPN') {
            steps {
                script {
                    echo "Establishing secure WireGuard tunnel to Azure Virtual Network..."
                    withCredentials([file(credentialsId: "${WG_CREDS_ID}", variable: 'WG_CONFIG_PATH')]) {
                        if (isUnix()) {
                            echo "Executing Unix-native WireGuard interface establishment..."
                            sh "sudo cp -f ${WG_CONFIG_PATH} /etc/wireguard/wg0.conf"
                            sh "sudo wg-quick up wg0 || true"
                        } else {
                            echo "Executing Windows-native WireGuard service installation..."
                            bat "copy \"${WG_CONFIG_PATH}\" \"${WORKSPACE}\\wg0.conf\""
                            bat "\"C:\\Program Files\\WireGuard\\wireguard.exe\" /installtunnelservice \"${WORKSPACE}\\wg0.conf\" || exit 0"
                        }
                    }
                }
            }
        }

        stage('Push to Azure ACR') {
            steps {
                script {
                    echo "Publishing container images to Azure Container Registry..."
                    withCredentials([usernamePassword(credentialsId: "${ACR_CREDS_ID}", usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
                        runCmd "docker login ${ACR_REGISTRY} -u ${ACR_USER} -p ${ACR_PASS}"
                        runCmd "docker push ${BACKEND_IMAGE}:latest"
                        runCmd "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy to Azure VM (Secure Private IP)') {
            steps {
                script {
                    echo "Deploying CampusFind update to Azure Virtual Machine..."
                    withCredentials([
                        sshUserPrivateKey(credentialsId: "${SSH_CREDS_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
                        file(credentialsId: 'campusfind-prod-env', variable: 'ENV_FILE')
                    ]) {
                        if (!isUnix()) {
                            // Windows OpenSSH requires strict private key file permissions
                            echo "Securing temporary SSH key file permissions for Windows..."
                            bat "icacls.exe \"${SSH_KEY}\" /reset"
                            bat "icacls.exe \"${SSH_KEY}\" /inheritance:r"
                            bat "icacls.exe \"${SSH_KEY}\" /grant:r \"*S-1-5-18:(R)\""
                            bat "icacls.exe \"${SSH_KEY}\" /grant:r \"*S-1-5-32-544:(R)\" || exit 0"
                        }
                        
                        // 1. Clean up old root-level deployment on VM if it exists
                        runCmd "ssh -i \"${SSH_KEY}\" -o StrictHostKeyChecking=no ${SSH_USER}@${AZURE_VM_PRIVATE_IP} \"docker compose -f /home/${SSH_USER}/docker-compose.yml down --remove-orphans && rm -f /home/${SSH_USER}/docker-compose.yml || true\""

                        // 2. Create target directory on VM
                        runCmd "ssh -i \"${SSH_KEY}\" -o StrictHostKeyChecking=no ${SSH_USER}@${AZURE_VM_PRIVATE_IP} \"mkdir -p /home/${SSH_USER}/campus-find\""

                        // 3. Copy Docker Compose config to target directory
                        runCmd "scp -i \"${SSH_KEY}\" -o StrictHostKeyChecking=no docker-compose.prod.yml ${SSH_USER}@${AZURE_VM_PRIVATE_IP}:/home/${SSH_USER}/campus-find/docker-compose.yml"
                        
                        // 4. Copy the secure .env file to the target directory
                        runCmd "scp -i \"${SSH_KEY}\" -o StrictHostKeyChecking=no \"${ENV_FILE}\" ${SSH_USER}@${AZURE_VM_PRIVATE_IP}:/home/${SSH_USER}/campus-find/.env"

                        // 5. Fetch remote deployment variables and login remote docker to ACR
                        withCredentials([usernamePassword(credentialsId: "${ACR_CREDS_ID}", usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
                            runCmd "ssh -i \"${SSH_KEY}\" -o StrictHostKeyChecking=no ${SSH_USER}@${AZURE_VM_PRIVATE_IP} \"docker login ${ACR_REGISTRY} -u ${ACR_USER} -p ${ACR_PASS} && cd /home/${SSH_USER}/campus-find && docker compose pull && docker compose up -d --remove-orphans && docker image prune -f\""
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up local workspace..."
                if (isUnix()) {
                    sh "sudo wg-quick down wg0 || true"
                    sh "docker logout ${ACR_REGISTRY} || true"
                } else {
                    bat "\"C:\\Program Files\\WireGuard\\wireguard.exe\" /uninstalltunnelservice wg0 || exit 0"
                    bat "docker logout ${ACR_REGISTRY} || exit 0"
                }
            }
        }
    }
}

// Cross-Platform shell command executer
def runCmd(cmd) {
    if (isUnix()) {
        sh "${cmd}"
    } else {
        bat "${cmd}"
    }
}
