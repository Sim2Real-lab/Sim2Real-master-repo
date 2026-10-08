pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(false)
    }

    stages {

        stage('Environment') {
            steps {
                sh '''
                    set -eu

                    echo "===== Environment ====="
                    echo "Commit:  $(git rev-parse HEAD)"
                    echo "Branch:  $(git branch --show-current || true)"
                    echo "Node:    $(node --version)"
                    echo "npm:     $(npm --version)"
                    echo "Python:  $(python3 --version)"
                    echo "======================="
                '''
            }
        }

        stage('Python Setup') {
            steps {
                sh '''
                    set -eu

                    rm -rf .ci-venv

                    python3 -m venv .ci-venv
                    . .ci-venv/bin/activate

                    python -m pip install --upgrade pip
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Frontend Dependencies') {
            steps {
                sh '''
                    set -eu

                    npm ci
                '''
            }
        }

        stage('Frontend Lint') {
            steps {
                sh '''
                    set -eu

                    npm run lint
                '''
            }
        }

        stage('Django Checks') {
            steps {
                sh '''
                    set -eu

                    . .ci-venv/bin/activate

                    python manage.py check
                '''
            }
        }

        stage('Django Tests') {
            steps {
                sh '''
                    set -eu

                    . .ci-venv/bin/activate

                    python manage.py test
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    set -eu

                    npm run build
                '''
            }
        }
    }

    post {
        always {
            sh '''
                rm -rf .ci-venv
                rm -rf node_modules
            '''
        }

        success {
            echo '================================'
            echo 'CI PIPELINE PASSED'
            echo '================================'
        }

        failure {
            echo '================================'
            echo 'CI PIPELINE FAILED'
            echo '================================'
        }
    }
}