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
│  │ 1. TRIGGER: Pull Request                                       │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 2. BUILD & PUBLISH (Parallel Matrix Jobs - Affected Apps)      │          │
│  │                                                                │          │
│  │  ┌───────────────────────────────────────────────────────┐     │          │
│  │  │    [APP] BUILD (Turbo --affected detection)           │     │          │
│  │  ├───────────────────────────────────────────────────────┤     │          │
│  │  │ • Detect affected apps via Turborepo                  │     │          │
│  │  │ • Build Docker Image                                  │     │          │
│  │  │ • Tag: pr-123-abc1234-20240922120000                  │     │          │
│  │  │ • Push to ACR                                         │     │          │
│  │  └───────────────────────────────────────────────────────┘     │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 3. DEPLOY ROOT CHART TO PREVIEW                                │          │
│  │                                                                │          │
│  │  • Reference app charts via file:// paths                      │          │
│  │  • Deploy umbrella chart with platform tags/labels             │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 4. RUN E2E TESTS                                               │          │
│  └────────────────────┬───────────────────────────────────────────┘          │
│                       ↓                                                      │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │ 5. CLEANUP (On PR Closure - via GitHub Labels)                 │          │
│  │                                                                │          │
│  │  • Platform detects PR labels (ns:, prd:, rel:)                │          │
│  │  • Delete Helm release (automated)                             │          │
│  │  • Remove Docker images from ACR                               │          │
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
│  │    Platform Services (ASO-managed):               │                       │
│  │    PostgreSQL Flexible Server, KeyVault           │                       │
│  └───────────────────────────────────────────────────┘                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 2. GitHub Actions Workflow Structure

### 2.1 Main Preview Deployment Workflow

**File**: `.github/workflows/preview-deploy.yml`

The workflow consists of the following jobs:

1. **Detect Affected Apps**: Use Turborepo to identify which apps have changed
2. **Build Images**: Build and push Docker images for affected apps only
3. **Deploy Preview**: Deploy root Helm chart with platform tags and PR labels
4. **E2E Tests**: Run Playwright tests against the deployed environment

### 2.2 Workflow Jobs Breakdown

#### Job 1: Build and Publish (Parallel per Affected App)
- **Purpose**: Build Docker images for affected apps only (detected via Turborepo)
- **Change Detection**: Use `turbo ls --affected --filter=./apps/* --output=json` to determine which apps changed
- **Matrix Strategy**: Process only affected apps in parallel
- **Steps per app**:
  1. Detect affected apps using Turborepo (includes lib dependency changes)
  2. Build and push Docker image with timestamp tag
- **Outputs**:
  - Image tags: `pr-{number}-{sha}-{timestamp}`
  - Affected apps list for deployment
- **Artifacts**: Build logs, image manifests
- **Note**: No Helm charts published to OCI - charts referenced locally via `file://`

#### Job 2: Deploy Root Chart
- **Purpose**: Deploy umbrella/root Helm chart that references app charts via `file://` paths
- **Dependencies**: Requires affected app images published
- **Configuration**: Uses values.preview.template.yaml with PR-specific overrides
- **Platform Tags**: Sets global tags for Azure resource management (teamName, applicationName, etc.)
- **GitHub Labels**: Adds labels for automated cleanup (ns:rpe, prd:rpe, rel:rpe-expressjs-monorepo-template-pr-{number})
- **Environment**: Preview namespace with GitHub environment protection
- **Outputs**: Preview URLs for testing

#### Job 3: E2E Tests
- **Purpose**: Run Playwright tests against deployed preview environment
- **Dependencies**: Requires successful deployment
- **Network Access**: Requires either:
  - Firewall access from GitHub Actions to Preview environment, OR
  - Azure Playwright Service for execution within Azure network
- **Test Suite**: Smoke tests and critical user journeys
- **Artifacts**: Test reports, screenshots, videos on failure

## 3. Change Detection

Use Turborepo to detect which apps have been affected by changes in the PR:

- Command: `turbo ls --affected --filter=./apps/* --output=json`
- Detects changes to:
  - App source code
  - Lib dependencies of apps
  - Shared configurations
- Output: JSON array of affected apps with their names and directories
- Only affected apps will have Docker images built

## 4. Docker Image Building

### 4.1 Registry Configuration

Using the DCD-CNP-DEV subscription (Tenant: CJS Common Platform)

**Registry**: `hmctspublic.azurecr.io`

**Image Naming Convention**:
- `rpe/rpe-expressjs-monorepo-template-{app}:pr-{number}-{sha}-{timestamp}`
- Example: `rpe/rpe-expressjs-monorepo-template-web:pr-123-abc1234-20240922120000`

### 4.2 Build Strategy

- Build only affected apps (from change detection)
- Use ACR Tasks for building (offloads work to Azure)
- Tag images with PR number, short SHA, and timestamp for traceability

### 4.3 Cleanup on PR Closure

When a PR is closed or merged:

1. **Helm Release Cleanup**: Platform automatically detects and removes Helm releases based on GitHub PR labels
2. **Docker Image Cleanup**: Remove all PR-specific images from ACR using tag pattern matching

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
    version: 0.1.0
    repository: "file://../web/helm"
    condition: web.enabled
  - name: expressjs-monorepo-template-api
    version: 0.1.0
    repository: "file://../api/helm"
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

### 5.3 Deployment Requirements

**Platform Tags** (required for Azure resource management):
- `global.tenantId`: Azure tenant ID
- `global.environment`: Environment name (preview)
- `global.enableKeyVaults`: Enable KeyVault integration
- `global.devMode`: Enable development mode features
- `global.tags.teamName`: Team/namespace identifier (rpe)
- `global.tags.applicationName`: Application name
- `global.tags.builtFrom`: Git repository URL
- `global.tags.businessArea`: Business area (CFT)
- `global.tags.environment`: Environment tag (development)
- `global.disableTraefikTls`: Disable Traefik TLS

**Deployment Process**:
1. Process values template with PR-specific variables
2. Update Helm dependencies (pulls from local `file://` paths)
3. Deploy root chart to preview namespace with all required tags


## 6. Environment Variables

### 6.1 Generated Variables
- `CHANGE_ID`: Pull request number

## 7. GitHub PR Labels for Cleanup

The following labels must be added to PRs to enable automated cleanup by the platform:

- `ns:rpe` - Namespace identifier
- `prd:rpe` - Product identifier
- `rel:rpe-expressjs-monorepo-template-pr-{number}` - Release name (must match Helm release)

These labels enable the platform to:
- Identify which namespace the preview environment belongs to
- Track the Helm release name for cleanup
- Automatically remove resources when the PR is closed

## 8. E2E Testing Network Access

Two options for running Playwright E2E tests against the preview environment:

### Option 1: Firewall Access from GitHub Actions
- Request platform team to allow GitHub Actions runner IPs to access preview environment
- Simpler setup but requires firewall rule maintenance
- GitHub Actions uses dynamic IP ranges that may change

### Option 2: Azure Playwright Service (Recommended)
- Execute tests within Azure network boundary
- More reliable and secure
- No firewall rule changes needed
- Better performance due to proximity to preview environment

## 9. Environment Configuration (Confirmed)

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

