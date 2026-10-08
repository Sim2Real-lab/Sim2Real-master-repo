pipeline {

    agent any

    parameters {
        string(
            name: 'RELEASE_TAG',
            defaultValue: '',
            description: 'Production release tag. Example: v1.0.0. Leave empty for CI-only builds.'
        )
    }

    environment {
        CI_VENV = "${WORKSPACE}@tmp/ci-venv"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)

        // Prevent Jenkins from keeping unnecessary old workspaces
        buildDiscarder(
            logRotator(
                numToKeepStr: '20',
                artifactNumToKeepStr: '10'
            )
        )
    }

    stages {

        // ============================================================
        // 1. CHECKOUT
        // ============================================================

        stage('Checkout') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "CHECKOUT"
                    echo "========================================"

                    git fetch --all --tags --prune

                    if [ -n "${RELEASE_TAG}" ]; then

                        echo "Production release requested:"
                        echo "  ${RELEASE_TAG}"

                        case "${RELEASE_TAG}" in
                            v[0-9]*.[0-9]*.[0-9]*)
                                ;;
                            *)
                                echo ""
                                echo "ERROR: Invalid release tag:"
                                echo "  ${RELEASE_TAG}"
                                echo ""
                                echo "Expected format:"
                                echo "  v1.0.0"
                                exit 1
                                ;;
                        esac

                        if ! git rev-parse --verify \
                            "refs/tags/${RELEASE_TAG}" >/dev/null 2>&1; then

                            echo ""
                            echo "ERROR: Release tag does not exist:"
                            echo "  ${RELEASE_TAG}"
                            exit 1
                        fi

                        git checkout --force "${RELEASE_TAG}"
                        git reset --hard "${RELEASE_TAG}"

                    else

                        echo "CI build."
                        echo "Using Jenkins-selected revision."

                        git checkout --force "${GIT_COMMIT}"
                        git reset --hard "${GIT_COMMIT}"

                    fi

                    echo ""
                    echo "========================================"
                    echo "SOURCE INFORMATION"
                    echo "========================================"

                    echo "Commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "Branch:"
                    git branch --show-current || true

                    echo ""
                    echo "Tags:"
                    git tag --points-at HEAD || true

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 2. VERIFY SOURCE
        // ============================================================

        stage('Verify Source') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "VERIFY SOURCE"
                    echo "========================================"

                    if [ -n "${RELEASE_TAG}" ]; then

                        ACTUAL_COMMIT="$(git rev-parse HEAD)"
                        TAG_COMMIT="$(git rev-parse "${RELEASE_TAG}^{commit}")"

                        echo "Release tag: ${RELEASE_TAG}"
                        echo "Tag commit:  ${TAG_COMMIT}"
                        echo "HEAD commit: ${ACTUAL_COMMIT}"

                        if [ "${ACTUAL_COMMIT}" != "${TAG_COMMIT}" ]; then
                            echo ""
                            echo "ERROR: HEAD does not match release tag."
                            exit 1
                        fi

                        echo ""
                        echo "Release tag verification: PASSED"

                    else

                        echo "CI-only build."
                        echo "No production release tag supplied."

                    fi

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 3. ENVIRONMENT
        // ============================================================

        stage('Environment') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "BUILD ENVIRONMENT"
                    echo "========================================"

                    echo "Jenkins:"
                    echo "${JENKINS_VERSION:-unknown}"

                    echo ""
                    echo "Node:"
                    node --version

                    echo ""
                    echo "npm:"
                    npm --version

                    echo ""
                    echo "Python:"
                    python3 --version

                    echo ""
                    echo "Git:"
                    git --version

                    echo ""
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Release:"
                    if [ -n "${RELEASE_TAG}" ]; then
                        echo "${RELEASE_TAG}"
                    else
                        echo "CI"
                    fi

                    echo ""
                    echo "Commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 4. PYTHON CI ENVIRONMENT
        // ============================================================

        stage('Python Setup') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "PYTHON SETUP"
                    echo "========================================"

                    rm -rf "${CI_VENV}"

                    python3 -m venv "${CI_VENV}"

                    "${CI_VENV}/bin/python" \
                        -m pip install --upgrade pip

                    "${CI_VENV}/bin/pip" \
                        install -r requirements.txt

                    echo ""
                    echo "Python environment ready."

                    echo ""
                    echo "Installed Django:"
                    "${CI_VENV}/bin/python" -m django --version

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 5. FRONTEND DEPENDENCIES
        // ============================================================

        stage('Frontend Dependencies') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "FRONTEND DEPENDENCIES"
                    echo "========================================"

                    npm install

                    echo ""
                    echo "Frontend dependencies installed."

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 6. LINT
        // ============================================================

        stage('Frontend Lint') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "FRONTEND LINT"
                    echo "========================================"

                    npm run lint

                    echo ""
                    echo "Lint: PASSED"

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 7. DJANGO CHECKS
        // ============================================================

        stage('Django Checks') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "DJANGO CHECKS"
                    echo "========================================"

                    "${CI_VENV}/bin/python" \
                        manage.py check

                    echo ""
                    echo "Django checks: PASSED"

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 8. DJANGO TESTS
        // ============================================================

        stage('Django Tests') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "DJANGO TESTS"
                    echo "========================================"

                    "${CI_VENV}/bin/python" \
                        manage.py test \
                        --verbosity 1

                    echo ""
                    echo "Django tests: PASSED"

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 9. FRONTEND BUILD
        // ============================================================

        stage('Frontend Build') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "FRONTEND BUILD"
                    echo "========================================"

                    npm run build

                    echo ""
                    echo "Frontend build: PASSED"

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 10. RELEASE VALIDATION
        // ============================================================

        stage('Release Validation') {
            when {
                expression {
                    return params.RELEASE_TAG?.trim()
                }
            }

            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "RELEASE VALIDATION"
                    echo "========================================"

                    echo "Release:"
                    echo "${RELEASE_TAG}"

                    echo ""
                    echo "Commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "Exact tag:"
                    git describe \
                        --tags \
                        --exact-match \
                        HEAD

                    echo ""
                    echo "Release validation: PASSED"

                    echo ""
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 11. PRODUCTION DEPLOYMENT
        // ============================================================

        stage('Deploy Production') {
            when {
                expression {
                    return params.RELEASE_TAG?.trim()
                }
            }

            steps {
                sh '''
                    set -eu

                    echo ""
                    echo "========================================"
                    echo "PRODUCTION DEPLOYMENT"
                    echo "========================================"

                    echo ""
                    echo "Release:"
                    echo "${RELEASE_TAG}"

                    echo ""
                    echo "Commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "Deployment helper:"
                    echo "/usr/local/sbin/sim2real-deploy"

                    echo ""
                    echo "Starting deployment..."
                    echo ""

                    sudo /usr/local/sbin/sim2real-deploy \
                        "${RELEASE_TAG}"

                    echo ""
                    echo "========================================"
                    echo "DEPLOYMENT COMMAND COMPLETED"
                    echo "========================================"
                '''
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================

    post {

        always {
            sh '''
                set +e

                echo ""
                echo "========================================"
                echo "CLEANUP"
                echo "========================================"

                rm -rf "${CI_VENV}"
                rm -rf node_modules

                echo "CI workspace cleanup completed."

                echo ""
                echo "========================================"
            '''
        }


        success {
            echo ""
            echo "========================================"
            echo "JENKINS BUILD SUCCESSFUL"
            echo "========================================"

            if (params.RELEASE_TAG?.trim()) {
                echo "Type:       PRODUCTION RELEASE"
                echo "Release:    ${params.RELEASE_TAG}"
            } else {
                echo "Type:       CI"
            }

            echo "Commit:     ${env.GIT_COMMIT}"
            echo "Build:      #${env.BUILD_NUMBER}"

            echo ""
            echo "========================================"
        }


        failure {
            echo ""
            echo "========================================"
            echo "JENKINS BUILD FAILED"
            echo "========================================"

            echo "Build:      #${env.BUILD_NUMBER}"
            echo "Commit:     ${env.GIT_COMMIT}"

            if (params.RELEASE_TAG?.trim()) {
                echo "Release:    ${params.RELEASE_TAG}"
            }

            echo ""
            echo "Check the failed stage above."
            echo ""
            echo "========================================"
        }


        aborted {
            echo ""
            echo "========================================"
            echo "JENKINS BUILD ABORTED"
            echo "========================================"
        }
    }
}