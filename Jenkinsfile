pipeline {
    agent any

    environment {
        CI_VENV = "${WORKSPACE}@tmp/ci-venv"

        PROD_ROOT = "/opt/sim2real"
        RELEASES_DIR = "/opt/sim2real/releases"
        CURRENT_LINK = "/opt/sim2real/current"
        PROD_VENV = "/opt/sim2real/shared/venv"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(false)
    }

    stages {

        /*
         * ============================================================
         * CI
         * ============================================================
         */

        stage('Environment') {
            steps {
                sh '''
                    set -eu

                    echo "========================================"
                    echo "ENVIRONMENT"
                    echo "========================================"

                    echo "Commit:  $(git rev-parse HEAD)"
                    echo "Branch:  $(git branch --show-current || true)"
                    echo "Tag:     ${TAG_NAME:-none}"

                    echo "Node:    $(node --version)"
                    echo "npm:     $(npm --version)"
                    echo "Python:  $(python3 --version)"

                    echo "========================================"
                '''
            }
        }

        stage('Python Setup') {
            steps {
                sh '''
                    set -eu

                    rm -rf "$CI_VENV"

                    python3 -m venv "$CI_VENV"

                    "$CI_VENV/bin/python" -m pip install --upgrade pip

                    "$CI_VENV/bin/pip" install -r requirements.txt
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

                    "$CI_VENV/bin/python" manage.py check
                '''
            }
        }

        stage('Django Tests') {
            steps {
                sh '''
                    set -eu

                    "$CI_VENV/bin/python" manage.py test
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

        /*
         * ============================================================
         * PRODUCTION DEPLOYMENT
         *
         * Deployment happens ONLY when Jenkins is building a tag.
         *
         * Example:
         *
         *     v1.0.0
         *     v1.0.1
         *     v1.1.0
         *
         * Normal branch builds stop after CI.
         * ============================================================
         */

        stage('Deploy Production') {

            when {
                buildingTag()
            }

            steps {
                sh '''
                    set -eu

                    RELEASE="${TAG_NAME}"
                    RELEASE_DIR="${RELEASES_DIR}/${RELEASE}"

                    echo ""
                    echo "========================================"
                    echo "PRODUCTION DEPLOYMENT"
                    echo "========================================"
                    echo "Release : ${RELEASE}"
                    echo "Commit  : $(git rev-parse HEAD)"
                    echo "========================================"
                    echo ""

                    #
                    # --------------------------------------------------
                    # Validate release name
                    # --------------------------------------------------
                    #

                    case "$RELEASE" in
                        v[0-9]*)
                            ;;
                        *)
                            echo "ERROR: Invalid release tag: ${RELEASE}"
                            echo "Production releases must look like v1.0.0"
                            exit 1
                            ;;
                    esac


                    #
                    # --------------------------------------------------
                    # Verify this is a clean checkout
                    # --------------------------------------------------
                    #

                    if [ -n "$(git status --porcelain)" ]; then
                        echo "ERROR: Jenkins workspace is not clean."
                        git status --short
                        exit 1
                    fi


                    #
                    # --------------------------------------------------
                    # Make sure production directories exist
                    # --------------------------------------------------
                    #

                    mkdir -p "$RELEASES_DIR"


                    #
                    # --------------------------------------------------
                    # Never overwrite an existing release
                    # --------------------------------------------------
                    #

                    if [ -e "$RELEASE_DIR" ]; then
                        echo "ERROR: Release already exists:"
                        echo "$RELEASE_DIR"
                        exit 1
                    fi


                    #
                    # --------------------------------------------------
                    # Create release directory
                    # --------------------------------------------------
                    #

                    echo "Creating release directory..."

                    mkdir "$RELEASE_DIR"


                    #
                    # --------------------------------------------------
                    # Copy EXACT Jenkins-tested workspace
                    # --------------------------------------------------
                    #

                    echo "Copying tested application..."

                    cp -a . "$RELEASE_DIR/"


                    #
                    # --------------------------------------------------
                    # Ensure application owns the release
                    # --------------------------------------------------
                    #

                    echo "Setting release ownership..."

                    chown -R sim2real-app:sim2real-app "$RELEASE_DIR"


                    #
                    # --------------------------------------------------
                    # Production Python dependencies
                    #
                    # requirements.txt was already validated by CI.
                    # --------------------------------------------------
                    #

                    echo "Installing production Python dependencies..."

                    "$PROD_VENV/bin/pip" install \
                        -r "$RELEASE_DIR/requirements.txt"


                    #
                    # --------------------------------------------------
                    # Django production validation
                    # --------------------------------------------------
                    #

                    echo "Running Django deployment checks..."

                    cd "$RELEASE_DIR"

                    sudo -u sim2real-app \
                        "$PROD_VENV/bin/python" \
                        manage.py check --deploy


                    #
                    # --------------------------------------------------
                    # Database migrations
                    #
                    # IMPORTANT:
                    # Production .env points to sim2real_prod.
                    # --------------------------------------------------
                    #

                    echo "Running database migrations..."

                    sudo -u sim2real-app \
                        "$PROD_VENV/bin/python" \
                        manage.py migrate --noinput


                    #
                    # --------------------------------------------------
                    # Collect static files
                    # --------------------------------------------------
                    #

                    echo "Collecting static files..."

                    sudo -u sim2real-app \
                        "$PROD_VENV/bin/python" \
                        manage.py collectstatic --noinput


                    #
                    # --------------------------------------------------
                    # Remember current release for rollback
                    # --------------------------------------------------
                    #

                    PREVIOUS_RELEASE=""

                    if [ -L "$CURRENT_LINK" ]; then
                        PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
                    fi

                    echo "Previous release:"
                    echo "${PREVIOUS_RELEASE:-none}"


                    #
                    # --------------------------------------------------
                    # Switch current atomically
                    # --------------------------------------------------
                    #

                    echo "Switching current release..."

                    ln -sfn "$RELEASE_DIR" "${CURRENT_LINK}.new"

                    mv -Tf "${CURRENT_LINK}.new" "$CURRENT_LINK"


                    #
                    # --------------------------------------------------
                    # Restart Gunicorn
                    # --------------------------------------------------
                    #

                    echo "Restarting Sim2Real service..."

                    sudo systemctl restart sim2real.service


                    #
                    # --------------------------------------------------
                    # Give Gunicorn a moment to start
                    # --------------------------------------------------
                    #

                    sleep 3


                    #
                    # --------------------------------------------------
                    # Check systemd state
                    # --------------------------------------------------
                    #

                    echo "Checking systemd service..."

                    if ! sudo systemctl is-active --quiet sim2real.service; then

                        echo ""
                        echo "========================================"
                        echo "DEPLOYMENT FAILED"
                        echo "========================================"
                        echo "Gunicorn failed to start."
                        echo ""
                        echo "Service status:"
                        sudo systemctl status sim2real.service --no-pager || true
                        echo ""
                        echo "Recent logs:"
                        sudo journalctl \
                            -u sim2real.service \
                            -n 100 \
                            --no-pager || true
                        echo ""

                        #
                        # Roll back current symlink
                        #

                        if [ -n "$PREVIOUS_RELEASE" ]; then
                            echo "Rolling back to:"
                            echo "$PREVIOUS_RELEASE"

                            ln -sfn "$PREVIOUS_RELEASE" "${CURRENT_LINK}.rollback"
                            mv -Tf "${CURRENT_LINK}.rollback" "$CURRENT_LINK"

                            sudo systemctl restart sim2real.service

                            sleep 3
                        fi

                        exit 1
                    fi


                    #
                    # --------------------------------------------------
                    # HTTP health check
                    # --------------------------------------------------
                    #

                    echo "Running local health check..."

                    HEALTH_OK=false

                    for i in 1 2 3 4 5; do

                        if curl \
                            --fail \
                            --silent \
                            --show-error \
                            --max-time 10 \
                            http://127.0.0.1:8000/ \
                            > /dev/null
                        then
                            HEALTH_OK=true
                            break
                        fi

                        echo "Health check attempt ${i}/5 failed."

                        sleep 2
                    done


                    #
                    # --------------------------------------------------
                    # Rollback if health check failed
                    # --------------------------------------------------
                    #

                    if [ "$HEALTH_OK" != "true" ]; then

                        echo ""
                        echo "========================================"
                        echo "HEALTH CHECK FAILED"
                        echo "========================================"

                        echo ""
                        echo "Service status:"
                        sudo systemctl status sim2real.service --no-pager || true

                        echo ""
                        echo "Recent application logs:"
                        sudo journalctl \
                            -u sim2real.service \
                            -n 100 \
                            --no-pager || true

                        echo ""

                        if [ -n "$PREVIOUS_RELEASE" ]; then

                            echo "Rolling back to previous release:"
                            echo "$PREVIOUS_RELEASE"

                            ln -sfn "$PREVIOUS_RELEASE" "${CURRENT_LINK}.rollback"

                            mv -Tf \
                                "${CURRENT_LINK}.rollback" \
                                "$CURRENT_LINK"

                            sudo systemctl restart sim2real.service

                            sleep 3

                            if sudo systemctl is-active --quiet sim2real.service; then
                                echo "Rollback service restart succeeded."
                            else
                                echo "WARNING: Rollback service is not active."
                                sudo systemctl status \
                                    sim2real.service \
                                    --no-pager || true
                            fi

                        else
                            echo "No previous release exists."
                        fi

                        exit 1
                    fi


                    #
                    # --------------------------------------------------
                    # Deployment succeeded
                    # --------------------------------------------------
                    #

                    echo ""
                    echo "========================================"
                    echo "DEPLOYMENT SUCCESSFUL"
                    echo "========================================"
                    echo "Release : ${RELEASE}"
                    echo "Commit  : $(git rev-parse HEAD)"
                    echo "Current : $(readlink -f "$CURRENT_LINK")"
                    echo "========================================"
                    echo ""


                    #
                    # --------------------------------------------------
                    # Keep only current + previous release
                    #
                    # IMPORTANT:
                    # Do this ONLY after successful health check.
                    # --------------------------------------------------
                    #

                    echo "Cleaning old releases..."

                    RELEASE_LIST="$(find "$RELEASES_DIR" \
                        -mindepth 1 \
                        -maxdepth 1 \
                        -type d \
                        -printf '%T@ %p\\n' \
                        | sort -nr \
                        | cut -d' ' -f2-)"

                    RELEASE_COUNT=0

                    while IFS= read -r OLD_RELEASE; do

                        [ -z "$OLD_RELEASE" ] && continue

                        RELEASE_COUNT=$((RELEASE_COUNT + 1))

                        if [ "$RELEASE_COUNT" -gt 2 ]; then

                            echo "Removing old release:"
                            echo "$OLD_RELEASE"

                            rm -rf -- "$OLD_RELEASE"

                        fi

                    done <<EOF
$RELEASE_LIST
EOF


                    echo ""
                    echo "Remaining releases:"
                    find "$RELEASES_DIR" \
                        -mindepth 1 \
                        -maxdepth 1 \
                        -type d \
                        -printf '%f\\n' \
                        | sort
                '''
            }
        }
    }

    /*
     * ================================================================
     * POST ACTIONS
     * ================================================================
     */

    post {

        always {
            sh '''
                set +e

                echo ""
                echo "========================================"
                echo "POST BUILD INFORMATION"
                echo "========================================"

                echo "Build: ${BUILD_NUMBER}"
                echo "Job:   ${JOB_NAME}"

                if [ -n "${TAG_NAME:-}" ]; then
                    echo "Tag:   ${TAG_NAME}"
                fi

                echo "Commit:"
                git rev-parse HEAD 2>/dev/null || true

                echo ""
                echo "========================================"
            '''

            sh '''
                rm -rf "$CI_VENV"
                rm -rf node_modules
            '''
        }

        success {
            echo '========================================'
            echo 'PIPELINE PASSED'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'PIPELINE FAILED'
            echo '========================================'
        }
    }
}