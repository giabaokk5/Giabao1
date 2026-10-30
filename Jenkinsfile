pipeline {
    agent any

    environment {
        IMAGE_NAME     = "htcd-shop"
        SERVER_HOST    = "127.0.0.1"
        SERVER_USER    = "root"
        APP_PORT       = "5000"
        PUBLIC_HOST    = "103.20.96.174"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/giabaokk5/Giabao1.git',
                        credentialsId: 'github-pat'
                    ]]
                ])
            }
        }

        stage('Docker Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

                    sh "docker build -t docker.io/\$DOCKER_USER/\$IMAGE_NAME:latest ."
                }
            }
        }

        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker push docker.io/$DOCKER_USER/$IMAGE_NAME:latest'
                }
            }
        }

        stage('Deploy Server') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                    string(credentialsId: 'db-conn', variable: 'DB_CONN'),
                    file(credentialsId: 'docker-compose-file', variable: 'DOCKER_COMPOSE_PATH'),
                    sshUserPrivateKey(credentialsId: 'server-ssh-key', keyFileVariable: 'SSH_KEY')
                ]) {
                    sh '''
                    # 1. Tạo thư mục project và data trên server nếu chưa tồn tại
                    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SERVER_USER@$SERVER_HOST "mkdir -p ~/project/data"

                    # 2. Tạo file .env cục bộ an toàn (tránh lỗi ký tự ; trong chuỗi connection string qua SSH)
                    cat <<EOF > remote.env
DOCKER_USER=${DOCKER_USER}
IMAGE_NAME=${IMAGE_NAME}
DB_CONNECTION_STRING=${DB_CONN}
EOF

                    # 3. Copy docker-compose.yml và .env lên server
                    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $DOCKER_COMPOSE_PATH $SERVER_USER@$SERVER_HOST:~/project/docker-compose.yml
                    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null remote.env $SERVER_USER@$SERVER_HOST:~/project/.env
                    rm -f remote.env

                    # 4. Kéo image và khởi chạy container
                    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SERVER_USER@$SERVER_HOST \
                    "cd ~/project && \
                    echo \"$DOCKER_PASS\" | docker login -u $DOCKER_USER --password-stdin && \
                    docker compose --env-file .env pull && \
                    (docker compose --env-file .env down || true) && \
                    docker compose --env-file .env up -d && \
                    docker image prune -f"
                    '''
                }
            }
        }

        stage('Deploy Info') {
            steps {
                script {
                    def webUrl   = "http://${env.PUBLIC_HOST}:${env.APP_PORT}"
                    def apiUrl   = "http://${env.PUBLIC_HOST}:${env.APP_PORT}/api/health"
                    def imageUrl = "https://hub.docker.com/r/baone2k5/${env.IMAGE_NAME}"

                    echo """
╔═══════════════════════════════════════════════════════════╗
║         🚀 HTCD SHOP — DEPLOY THÀNH CÔNG!                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  🌐 Web App    : ${webUrl}              ║
║  🔗 API Health : ${apiUrl}  ║
║  🐳 Docker Hub : ${imageUrl}    ║
║  🖥️  Server    : ${env.PUBLIC_HOST}                      ║
║  📦 Port       : ${env.APP_PORT}                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"""
                    // Gắn link clickable vào Jenkins build history sidebar
                    currentBuild.description = "🌐 <a href='${webUrl}' target='_blank'>${webUrl}</a>"
                }
            }
        }
    }

    post {
        success {
            echo "✅ Triển khai CI/CD HTCD Shop thành công lên production! 🌐 http://${PUBLIC_HOST}:${APP_PORT}"
        }
        failure {
            echo "❌ Pipeline CI/CD thất bại! Vui lòng kiểm tra console log."
        }
    }
}
