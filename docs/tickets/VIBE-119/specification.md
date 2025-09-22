# VIBE-119: Infrastructure Pipeline: Deploy to Preview

## Overview

This specification outlines the infrastructure pipeline implementation for automated deployment to Preview environments when Pull Requests are created. The pipeline will build Docker images for each application, push them to Azure Container Registry, deploy using Helm charts, and run end-to-end tests against the deployed application.

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Pipeline Flow                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 1. TRIGGER: Pull Request (opened/synchronize/reopened)         │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 2. BUILD & PUBLISH (Parallel Matrix Jobs)                      │          │
│  │                                                                │          │
│  │  ┌─────────────────────────┐                                   │          │
│  │  │    [APP] BUILD          │                                   │          │
│  │  ├─────────────────────────┤                                   │          │
│  │  │ • Build Docker Image                  │                     │          │
│  │  │ • Tag: pr-123-abc1234-20240922120000 │                      │          │
│  │  │ • Push to ACR │                                             │          │
│  │  ├─────────────────────────┤                                   │          │
│  │  │ • Package Helm Chart    │                                   │          │
│  │  │ • Version: 0.0.1-pr.123 │                                   │          │
│  │  │ • Push to OCI: oci://hmctspublic.azurecr.io/helm/ |         │          │
│  │  └─────────────────────────┘                                   │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 3. DEPLOY ROOT CHART TO PREVIEW                                │          │
│  │                                                                │          │
│  │  • Pull dependencies from OCI registry                         │          │
│  │  • Deploy umbrella chart                                       │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 4. RUN E2E TESTS                                               │          │
│  │                                                                │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 5. CLEANUP (On PR Closure)                                     │          │
│  │                                                                │          │
│  │  • Delete Helm release                                         │          │
│  │  • Remove Docker images & charts from ACR                      │          │
│  │  • Database cleanup (platform-managed)                         │          │
│  └────────────────────────────────────────────────────────────────┘          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         Azure Preview Environment                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐        ┌────────────────────┐                        │
│  │   Web (pr-123)     │◄───────┤   API (pr-123)     │                        │
│  │    Port: 3000      │        │    Port: 3001      │                        │
│  └────────┬───────────┘        └────────┬───────────┘                        │
│           └──────────────┬───────────────┘                                   │
│                          ↓                                                   │
│  ┌───────────────────────────────────────────────────┐                       │
│  │                     Redis                         │                       │
│  └───────────────────────────────────────────────────┘                       │
│                                                                              │
│  ┌───────────────────────────────────────────────────┐                       │
│  │      Shared Services: Postgres, KeyVault, Insights   │                    │
│  └───────────────────────────────────────────────────┘                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 2. GitHub Actions Workflow Structure

### 2.1 Main Preview Deployment Workflow

**File**: `.github/workflows/preview-deploy.yml`

```yaml
name: Preview Environment Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [master, main]

concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

env:
  CHANGE_ID: ${{ github.event.pull_request.number }}

jobs:
  build-and-publish:
    name: Build Images and Charts
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web, api]

    steps:
      # 1. Build and push Docker image
      # 2. Package and publish Helm chart
      # Both done in parallel for each app
      # See sections 3.4 and 4.5 for detailed implementation

  deploy-preview:
    name: Deploy Root Chart to Preview
    runs-on: ubuntu-latest
    needs: build-and-publish
    environment: preview

    steps:
      # Deploy umbrella/root chart that references the published app charts
      # See section 5.3 for deployment commands

  # Already defined in the workflow file @.github/workflows/e2e.yml
  e2e-tests:
    name: Run E2E Tests
    runs-on: ubuntu-latest
    needs: deploy-preview
```

### 2.2 Workflow Jobs Breakdown

#### Job 1: Build and Publish (Parallel per App)
- **Purpose**: Build Docker images AND Helm charts for each app in parallel
- **Matrix Strategy**: Process web and api apps simultaneously
- **Steps per app**:
  1. Build and push Docker image with timestamp tag
  2. Check if Helm chart version exists
  3. Package and publish Helm chart if new
- **Outputs**:
  - Image tags: `pr-{number}-{sha}-{timestamp}`
  - Chart versions: `0.0.1-pr.{number}`
- **Artifacts**: Build logs, image manifests, chart packages

#### Job 2: Deploy Root Chart
- **Purpose**: Deploy umbrella/root Helm chart that references published app charts
- **Dependencies**: Requires all app images and charts published
- **Configuration**: Uses values.preview.template.yaml with PR-specific overrides
- **Environment**: Preview namespace with GitHub environment protection
- **Outputs**: Preview URLs for testing

#### Job 3: E2E Tests
- **Purpose**: Run Playwright tests against deployed preview environment
- **Dependencies**: Requires successful deployment
- **Test Suite**: Smoke tests and critical user journeys
- **Artifacts**: Test reports, screenshots, videos on failure

## 3. Azure Container Registry Setup Requirements

### 3.1 Registry Configuration

Using the DCD-CNP-DEV subscription (Tenant: CJS Common Platform)

```yaml
# Required Registry Structure
hmctspublic.azurecr.io/
├── rpe/
│   ├── rpe-expressjs-monorepo-template-web:pr-{number}-{sha}-{timestamp}
│   ├── rpe-expressjs-monorepo-template-api:pr-{number}-{sha}-{timestamp}
│   └── [older versions for retention]
```


```yaml
build-images-acr:
  name: Build Images with ACR Tasks
  runs-on: ubuntu-latest

  strategy:
    matrix:
      app: [web, api]

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Build with ACR Task
      run: |
        # Generate tag with timestamp
        PR_NUMBER=${{ github.event.pull_request.number }}
        SHORT_SHA=${GITHUB_SHA:0:7}
        TIMESTAMP=$(date +%Y%m%d%H%M%S)
        IMAGE_TAG="pr-${PR_NUMBER}-${SHORT_SHA}-${TIMESTAMP}"

        # Build using ACR (offloaded to Azure)
        az acr build \
          --registry hmctspublic \
          --image rpe/expressjs-monorepo-template-${{ matrix.app }}:${IMAGE_TAG} \
          --file apps/${{ matrix.app }}/Dockerfile \
          --build-arg REGISTRY_NAME=hmctspublic \
          .
```

## 4. Helm Chart Packaging and Publishing

### 4.1 Chart Version Management

Helm charts will be versioned specifically for each PR to ensure isolation and traceability:

```yaml
# Chart.yaml version override for PR builds
version: 0.0.1-pr.${CHANGE_ID}
appVersion: pr-${CHANGE_ID}
```

### 4.2 Chart Packaging Process

```bash
# Package App Chart
helm package ./apps/[app]/helm \
  --version "0.0.1-pr.${CHANGE_ID}" \
  --app-version "pr-${CHANGE_ID}"

```

### 4.3 Publishing to ACR (OCI Format)

Azure Container Registry supports Helm charts as OCI artifacts:

```bash
# Enable OCI support
export HELM_EXPERIMENTAL_OCI=1

# Login to ACR for Helm
helm registry login hmctspublic.azurecr.io \
  --username ${AZURE_CLIENT_ID} \
  --password ${AZURE_CLIENT_SECRET}

# Push Web Chart
helm push rpe-expressjs-monorepo-template-web-0.0.1-pr.${CHANGE_ID}.tgz \
  oci://hmctspublic.azurecr.io/helm/

# Push API Chart
helm push rpe-expressjs-monorepo-template-api-0.0.1-pr.${CHANGE_ID}.tgz \
  oci://hmctspublic.azurecr.io/helm/
```

### 4.4 Chart Repository Structure

```
oci://hmctspublic.azurecr.io/helm/
├── rpe-expressjs-monorepo-template-web:0.0.1-pr.123
├── rpe-expressjs-monorepo-template-api:0.0.1-pr.123
└── [Other PR versions...]
```

### 4.5 Combined Build and Publish Workflow

This shows how Docker image building and Helm chart publishing are done together in a single job:

```yaml
build-and-publish:
  name: Build Images and Charts
  runs-on: ubuntu-latest

  strategy:
    matrix:
      app: [web, api]

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Generate build metadata
      id: meta
      run: |
        SHORT_SHA=${GITHUB_SHA:0:7}
        TIMESTAMP=$(date +%Y%m%d%H%M%S)
        IMAGE_TAG="pr-${{ github.event.pull_request.number }}-${SHORT_SHA}-${TIMESTAMP}"
        echo "image-tag=${IMAGE_TAG}" >> $GITHUB_OUTPUT
        echo "short-sha=${SHORT_SHA}" >> $GITHUB_OUTPUT
        echo "timestamp=${TIMESTAMP}" >> $GITHUB_OUTPUT

    # ============ DOCKER IMAGE BUILD ============
    - name: Login to ACR for Docker
      uses: azure/docker-login@v1
      with:
        login-server: hmctspublic.azurecr.io
        username: ${{ secrets.AZURE_CLIENT_ID }}
        password: ${{ secrets.AZURE_CLIENT_SECRET }}

    - name: Build and Push Docker Image
      run: |
        docker build \
          -t hmctspublic.azurecr.io/rpe/rpe-expressjs-monorepo-template-${{ matrix.app }}:${{ steps.meta.outputs.image-tag }} \
          -f apps/${{ matrix.app }}/Dockerfile \
          .
        docker push hmctspublic.azurecr.io/rpe/rpe-expressjs-monorepo-template-${{ matrix.app }}:${{ steps.meta.outputs.image-tag }}

    # ============ HELM CHART PUBLISH ============
    - name: Install Helm
      uses: azure/setup-helm@v4
      with:
        version: '3.14.0'

    - name: Update Chart dependencies
      run: |
        helm dependency update ./apps/${{ matrix.app }}/helm

    - name: Login to ACR for Helm
      run: |
        helm registry login hmctspublic.azurecr.io \
          --username ${{ secrets.AZURE_CLIENT_ID }} \
          --password ${{ secrets.AZURE_CLIENT_SECRET }}

    - name: Check if chart version exists
      id: chart-exists
      run: |
        export HELM_EXPERIMENTAL_OCI=1
        CHART_VERSION="0.0.1-pr.${{ github.event.pull_request.number }}"

        # Try to pull the chart to check if it exists
        if helm pull oci://hmctspublic.azurecr.io/helm/rpe-expressjs-monorepo-template-${{ matrix.app }} \
           --version ${CHART_VERSION} 2>/dev/null; then
          echo "Chart version ${CHART_VERSION} already exists"
          echo "exists=true" >> $GITHUB_OUTPUT
          rm -f rpe-expressjs-monorepo-template-${{ matrix.app }}-${CHART_VERSION}.tgz
        else
          echo "Chart version ${CHART_VERSION} does not exist, will publish"
          echo "exists=false" >> $GITHUB_OUTPUT
        fi

    - name: Package Helm chart
      if: steps.chart-exists.outputs.exists == 'false'
      run: |
        helm package ./apps/${{ matrix.app }}/helm \
          --version "0.0.1-pr.${{ github.event.pull_request.number }}" \
          --app-version "pr-${{ github.event.pull_request.number }}-${{ github.sha }}-$(date +%Y%m%d%H%M%S)"

    - name: Push chart to ACR
      if: steps.chart-exists.outputs.exists == 'false'
      run: |
        export HELM_EXPERIMENTAL_OCI=1
        helm push rpe-expressjs-monorepo-template-${{ matrix.app }}-0.0.1-pr.${{ github.event.pull_request.number }}.tgz \
          oci://hmctspublic.azurecr.io/helm/

    - name: Output build artifacts
      id: output
      run: |
        echo "${{ matrix.app }}-image=hmctspublic.azurecr.io/rpe/rpe-expressjs-monorepo-template-${{ matrix.app }}:${{ steps.meta.outputs.image-tag }}" >> $GITHUB_OUTPUT
        echo "${{ matrix.app }}-chart-version=0.0.1-pr.${{ github.event.pull_request.number }}" >> $GITHUB_OUTPUT
```

### 4.6 Chart Cleanup on PR Closure

When a PR is closed or merged, the associated Helm charts should be cleaned up:

```yaml
cleanup-charts:
  name: Cleanup Preview Charts
  runs-on: ubuntu-latest
  if: github.event.action == 'closed'

  steps:
    - name: Login to ACR
      run: |
        az acr login --name hmctspublic

    - name: Delete PR-specific charts
      run: |
        # Delete web chart
        az acr repository delete \
          --name hmctspublic \
          --image helm/expressjs-monorepo-template-web:0.0.1-pr.${{ github.event.pull_request.number }} \
          --yes

        # Delete API chart
        az acr repository delete \
          --name hmctspublic \
          --image helm/expressjs-monorepo-template-api:0.0.1-pr.${{ github.event.pull_request.number }} \
          --yes
```

## 5. Helm Chart Deployment Approach for Preview Environment

### 5.1 Root/Umbrella Chart Structure

The deployment uses a root chart that orchestrates the deployment of both web and api applications:

**File**: `helm/expressjs-monorepo-template/Chart.yaml`

```yaml
apiVersion: v2
name: expressjs-monorepo-template
description: Umbrella chart for deploying all services
type: application
version: 0.0.1
dependencies:
  - name: expressjs-monorepo-template-web
    version: "0.0.1-pr.${CHANGE_ID}"
    repository: "oci://hmctspublic.azurecr.io/helm"
    condition: web.enabled
  - name: expressjs-monorepo-template-api
    version: "0.0.1-pr.${CHANGE_ID}"
    repository: "oci://hmctspublic.azurecr.io/helm"
    condition: api.enabled
```

### 5.2 Root Chart Values for Preview

**File**: `helm/expressjs-monorepo-template/values.preview.template.yaml`

```yaml
# Global values shared by all subcharts
global:
  environment: preview

# Web application configuration
web:
  enabled: true
  expressjs-monorepo-template-web:
    nodejs:
      image: "hmctspublic.azurecr.io/rpe/expressjs-monorepo-template-web:pr-${CHANGE_ID}-${SHORT_SHA}-${TIMESTAMP}"
      ingressHost: "web-pr-${CHANGE_ID}.preview.platform.hmcts.net"
      environment:
        NODE_ENV: "preview"
        API_URL: "http://api-pr-${CHANGE_ID}:3001"
        DATABASE_URL: "postgresql://{{ .Release.Name }}-postgresql:5432/vibe_pr_${CHANGE_ID}"
      resources:
        limits:
          memory: "256Mi"
          cpu: "200m"
        requests:
          memory: "128Mi"
          cpu: "50m"

# API application configuration
api:
  enabled: true
  expressjs-monorepo-template-api:
    nodejs:
      image: "hmctspublic.azurecr.io/rpe/expressjs-monorepo-template-api:pr-${CHANGE_ID}-${SHORT_SHA}-${TIMESTAMP}"
      ingressHost: "expressjs-monorepo-template-api-pr-${CHANGE_ID}.preview.platform.hmcts.net"
      environment:
        NODE_ENV: "preview"
        DATABASE_URL: "postgresql://{{ .Release.Name }}-postgresql:5432/pr-${CHANGE_ID}-expressjs-monorepo-template"
      resources:
        limits:
          memory: "256Mi"
          cpu: "200m"
        requests:
          memory: "128Mi"
          cpu: "50m"

# Shared PostgreSQL database
postgresql:
  enabled: true
  flexibleserver: rpe-preview
  setup:
    databases:
      - name: "pr-${CHANGE_ID}-expressjs-monorepo-template"

```

### 5.3 Deployment Commands for Root Chart

```bash
# Set environment variables for template processing
export PR_NUMBER=${GITHUB_EVENT_PULL_REQUEST_NUMBER}
export CHANGE_ID=${PR_NUMBER}  # For compatibility with Jenkins naming
export SHORT_SHA=${GITHUB_SHA:0:7}
export TIMESTAMP=$(date +%Y%m%d%H%M%S)
export ARM_TENANT_ID=${{ secrets.AZURE_TENANT_ID }}

# Process root chart template
envsubst < ./helm/expressjs-monorepo-template/Chart.yaml.template > ./helm/expressjs-monorepo-template/Chart.yaml

# Process values template
envsubst < ./helm/expressjs-monorepo-template/values.preview.template.yaml > /tmp/root-values-pr-${PR_NUMBER}.yaml

# Update dependencies to pull the published app charts
helm dependency update ./helm/expressjs-monorepo-template

# Deploy the root/umbrella chart
helm upgrade --install \
  "expressjs-monorepo-template-pr-${PR_NUMBER}" \
  ./helm/expressjs-monorepo-template \
  --namespace "rpe-preview" \
  --values /tmp/root-values-pr-${PR_NUMBER}.yaml \
  --wait --timeout 15m
```


## 8. Environment Variable Requirements

### 8.2 Preview Environment Variables

```yaml
# Generated during pipeline
PREVIEW_WEB_URL: "https://web-pr-{number}.preview.platform.hmcts.net"
PREVIEW_API_URL: "https://api-pr-{number}.preview.platform.hmcts.net"
PR_NUMBER: "{{ github.event.pull_request.number }}"
SHORT_SHA: "{{ github.sha | slice(0, 7) }}"

# Static configuration
NODE_ENV: "preview"
ENVIRONMENT: "preview"
LOG_LEVEL: "debug"
```


## Environment Configuration (Confirmed)

Based on platform requirements, the following configurations have been confirmed:

1. **Azure Subscription**: Using DCD-CNP-DEV subscription
   - Tenant ID: `531ff96d-0ae9-462a-8d2d-bec7c0b42082`
   - Tenant: CJS Common Platform (HMCTS.NET)

2. **Database Strategy**: Each PR gets its own PostgreSQL database using the HMCTS PostgreSQL chart
   - Chart: https://github.com/hmcts/chart-postgresql
   - Configuration in `values.preview.template.yaml`:
   ```yaml
   postgresql:
     enabled: true
     flexibleserver: rpe-preview
     setup:
       databases:
         - name: "pr-${CHANGE_ID}-expressjs-monorepo-template"
   ```

3. **Resource Limits**: Managed by platform team - no additional configuration needed

4. **Retention Policy**: Managed by platform team - automatic cleanup provided

5. **Security Approval**: Managed by platform team - fully automated deployments

6. **Cost Constraints**: Managed by platform team - monitoring in place

7. **External Dependencies**: Not required for this implementation

8. **SSL Certificates**: Platform provides wildcard certificates - no additional setup needed

9. **Monitoring Integration**: Managed by platform team

10. **Backup Strategy**: Preview databases are ephemeral - no backup required

## Implementation Priority

1. **Phase 1**: Basic pipeline with Docker builds and ACR push
2. **Phase 2**: Helm deployment to preview environment
3. **Phase 3**: E2E test integration
4. **Phase 4**: Monitoring and alerting setup
5. **Phase 5**: Cost optimization and cleanup automation