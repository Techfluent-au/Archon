# Archon - CI/CD Pipeline Specifications

## 1. Current CI Pipeline Overview

The Archon project currently utilizes a Continuous Integration (CI) pipeline implemented using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml`.

*   **Triggers:** The pipeline is triggered on:
    *   Pushes to the `main` and `unit-testing-ci` branches.
    *   Pull requests targeting the `main` branch.
    *   Manual dispatch (`workflow_dispatch`).

*   **Pipeline Structure:** The CI process is composed of three parallel jobs, followed by a summary job:
    1.  **`frontend-tests`:** Lints, type-checks, and runs tests for the React frontend. **(Note: Currently, most steps in this job are disabled).**
    2.  **`backend-tests`:** Lints, type-checks, and runs tests for the Python backend services.
    3.  **`docker-build-test`:** Builds a Docker image for each of the four microservices to ensure the Dockerfiles are valid and dependencies can be installed.
    4.  **`test-summary`:** Aggregates the results from the previous jobs into a summary report.

## 2. Current Quality Gates

The pipeline enforces several quality gates before code can be merged into `main`:

*   **Linting:** `ruff` for the backend and `eslint` for the frontend (disabled) are used to enforce code style and catch common errors.
*   **Type Checking:** `mypy` for the backend and `tsc` for the frontend (disabled) are used to ensure type safety.
*   **Unit & Integration Testing:** `pytest` is used for the backend and `vitest` for the frontend (disabled).
*   **Build Verification:** The `docker-build-test` job ensures that all services are buildable in a containerized environment.

**Critique:** The quality gates for the backend are active but rely on tests with weak assertions. The frontend gates, while defined, are currently disabled, representing a significant gap in the quality assurance process.

## 3. Current Deployment Process

**The project currently has Continuous Integration but does not have Continuous Deployment (CD).**

All deployments to any environment (staging, production) are a manual process. This involves manually building and pushing Docker images and deploying them to the target infrastructure. This process is not captured in the source-controlled CI/CD configuration, making it prone to human error and difficult to reproduce consistently.

## 4. Proposed "Desired State" CI/CD Pipeline

To mature the project from its current alpha state to a stable, production-ready application, the following enhancements to the CI/CD pipeline are recommended.

### 4.1. Enhanced CI Pipeline

The existing CI pipeline should be modified to include more robust quality and security gates.

```yaml
jobs:
  # ... (existing frontend-tests and backend-tests jobs) ...

  security-scan:
    name: Security Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Step 1: Scan for vulnerabilities in dependencies
      - name: Run Trivy vulnerability scanner for dependencies
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'HIGH,CRITICAL' # Fail on high or critical vulnerabilities

      # Step 2: Run CodeQL for static application security testing (SAST)
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: 'python,javascript'

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

**Key Changes:**
1.  **Re-enable Frontend Tests:** The steps in the `frontend-tests` job must be re-enabled and enforced as a required check for merging.
2.  **Add Security Scanning:** A new `security-scan` job should be added. This job will:
    *   Use a tool like **Trivy** or **Snyk** to scan all `package.json` and `requirements.txt` files for known vulnerabilities in dependencies.
    *   Use **GitHub CodeQL** to perform static analysis (SAST) on the Python and TypeScript code to find common security flaws.
    *   This job should be configured to **fail the build** if any critical vulnerabilities are found.

### 4.2. Continuous Delivery (CD) Pipeline

A new workflow file (e.g., `cd.yml`) should be created to handle deployments.

*   **Trigger:** This workflow should be triggered on a successful merge to the `main` branch (i.e., after the CI pipeline has passed).

*   **Pipeline Stages:**
    1.  **Build & Push Docker Images:**
        *   Build production-ready Docker images for each of the four services.
        *   Tag the images with the Git commit SHA and `latest`.
        *   Push the images to a container registry (e.g., Docker Hub, AWS ECR, Google Artifact Registry).
    2.  **Deploy to Staging:**
        *   Automatically deploy the newly built images to a dedicated **Staging** environment. This environment should be a mirror of production.
        *   Run automated smoke tests against the Staging environment to verify that all services are running and key API endpoints are responsive.
    3.  **Deploy to Production (Manual Gate):**
        *   The pipeline should pause and wait for manual approval before deploying to production. This can be implemented using a GitHub Actions environment with a required reviewer.
        *   Once approved, the pipeline will deploy the same images that were validated in Staging to the **Production** environment. This ensures that what was tested is what gets deployed.

## 5. Branching Strategy Recommendation

The project should formally adopt the **GitHub Flow** branching strategy.

1.  `main` is the primary branch and must always be in a deployable state.
2.  All new work (features, bug fixes) must be done on a descriptive feature branch created from `main` (e.g., `feat/add-new-dashboard`, `fix/login-bug`).
3.  When work on the feature branch is complete, a pull request is opened to merge it into `main`.
4.  The pull request must pass all CI checks (including the new security scans) and be approved by at least one other team member before it can be merged.
5.  Once merged into `main`, the CD pipeline automatically deploys the changes to Staging.
