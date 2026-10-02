pipeline {
    agent any

    environment {
        REGISTRY = "docker.io/${DOCKER_USERNAME}"
        IMAGE_NAME = "htcd-shop"
        SERVER_HOST = "103.20.96.174"
        SERVER_USER = "root"
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
                    
                    sh "docker build -t docker.io/$DOCKER_USER/$IMAGE_NAME:latest ."
                }
            }
        }

        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push docker.io/$DOCKER_USER/$IMAGE_NAME:latest"
                }
            }
        }

        stage('Deploy Server') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                    string(credentialsId: 'db-conn', variable: 'DB_CONN'),
                    file(credentialsId: 'docker-compose-file', variable: 'DOCKER_COMPOSE_PATH')
                ]) {
                    sshagent (credentials: ['server-ssh-key']) {
                        sh '''
                        # Tạo thư mục project và data trên server nếu chưa tồn tại
                        ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "mkdir -p ~/project/data"

                        # Copy docker-compose.prod.yml từ Jenkins sang server
                        scp -o StrictHostKeyChecking=no $DOCKER_COMPOSE_PATH $SERVER_USER@$SERVER_HOST:~/project/docker-compose.yml

                        # SSH vào production server để kéo image mới và khởi chạy container
                        ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "
                        cd ~/project && \
                        echo \\"DOCKER_USER=$DOCKER_USER\\" > .env && \
                        echo \\"IMAGE_NAME=$IMAGE_NAME\\" >> .env && \
                        echo \\"DB_CONNECTION_STRING=$DB_CONN\\" >> .env && \
                        echo \\"$DOCKER_PASS\\" | docker login -u $DOCKER_USER --password-stdin && \
                        docker compose --env-file .env pull && \
                        docker compose --env-file .env down && \
                        docker compose --env-file .env up -d && \
                        docker image prune -f
                        "
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Triển khai CI/CD HTCD Shop thành công lên production!"
        }
        failure {
            echo "❌ Pipeline CI/CD thất bại! Vui lòng kiểm tra console log."
        }
    }
}
