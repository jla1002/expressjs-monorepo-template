# VIBE-119: Infrastructure Pipeline - Deploy to Preview

## Priority 1: Core Pipeline Setup

### GitHub Actions Workflow (full-stack-engineer)
- [ ] Create `.github/workflows/preview-deploy.yml`
  - [ ] Setup trigger on PR events (opened, synchronize, reopened)
  - [ ] Configure concurrency groups to cancel in-progress builds
  - [ ] Set up environment variables (PR_NUMBER, CHANGE_ID, etc.)
- [ ] Implement combined build-and-publish job
  - [ ] Matrix strategy for web and api apps
  - [ ] Generate build metadata (timestamp, short SHA)
  - [ ] Docker build and push with tag: `pr-{number}-{sha}-{timestamp}`
  - [ ] Helm chart packaging and publishing (version: `0.0.1-pr.{number}`)
  - [ ] Chart existence checking before publish
  - [ ] Output build artifacts for downstream jobs

### ACR Configuration (infrastructure-engineer)
- [ ] Setup Azure Container Registry access
  - [ ] Configure service principal with AcrPush/AcrPull permissions
  - [ ] Add GitHub Actions secrets: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
  - [ ] Verify access to hmctspublic.azurecr.io
- [ ] Configure image repositories
  - [ ] Create `/rpe/rpe-expressjs-monorepo-template-web` repository
  - [ ] Create `/rpe/rpe-expressjs-monorepo-template-api` repository
  - [ ] Setup Helm OCI repository at `/helm/`
- [ ] Optional: Configure ACR Build Tasks
  - [ ] Setup build task definitions for offloaded builds
  - [ ] Configure build caching policies

## Priority 2: Helm Chart Development

### Root/Umbrella Chart Creation (full-stack-engineer)
- [ ] Create `helm/expressjs-monorepo-template/` directory structure
- [ ] Create `Chart.yaml` with dependencies
  ```yaml
  dependencies:
    - name: rpe-expressjs-monorepo-template-web
      repository: "oci://hmctspublic.azurecr.io/helm"
    - name: rpe-expressjs-monorepo-template-api
      repository: "oci://hmctspublic.azurecr.io/helm"
  ```
- [ ] Create `values.preview.template.yaml`
  - [ ] Global configuration section
  - [ ] Web app subchart values
  - [ ] API app subchart values
  - [ ] PostgreSQL flexible server configuration

### App Chart Updates (full-stack-engineer)
- [ ] Update `apps/web/helm/Chart.yaml`
  - [ ] Set name to `rpe-expressjs-monorepo-template-web`
  - [ ] Add PostgreSQL dependency if needed
- [ ] Update `apps/api/helm/Chart.yaml`
  - [ ] Set name to `rpe-expressjs-monorepo-template-api`
  - [ ] Add PostgreSQL dependency if needed
- [ ] Create preview values templates for both apps
  - [ ] Use ${CHANGE_ID} for dynamic values
  - [ ] Configure resource limits (256Mi memory, 200m CPU)
  - [ ] Set up ingress hosts

### Database Configuration (infrastructure-engineer)
- [ ] Configure PostgreSQL flexible server
  - [ ] Server name: `rpe-preview`
  - [ ] Database naming: `pr-${CHANGE_ID}-expressjs-monorepo-template`
  - [ ] Ensure ephemeral storage for preview

## Priority 3: Deployment Implementation

### Deploy Job Configuration (full-stack-engineer)
- [ ] Implement deploy-preview job in workflow
  - [ ] Kubernetes context setup
  - [ ] Helm registry login
  - [ ] Environment variable export (PR_NUMBER, CHANGE_ID, SHORT_SHA, TIMESTAMP)
  - [ ] Template processing with envsubst
  - [ ] Helm dependency update
  - [ ] Helm upgrade --install command
- [ ] Configure preview URLs output
  - [ ] Web: `https://web-pr-{number}.preview.platform.hmcts.net`
  - [ ] API: `https://expressjs-monorepo-template-api-pr-{number}.preview.platform.hmcts.net`

### Cleanup Automation (infrastructure-engineer)
- [ ] Create PR closure workflow
  - [ ] Trigger on PR closed event
  - [ ] Delete Helm release from Kubernetes
  - [ ] Remove Docker images from ACR
  - [ ] Clean up Helm charts from OCI registry
- [ ] Verify database cleanup (handled by platform)

## Priority 4: Testing & Validation

### E2E Test Integration (test-engineer)
- [ ] Update Playwright configuration
  - [ ] Create `playwright-preview.config.ts`
  - [ ] Configure preview URLs dynamically
  - [ ] Set appropriate timeouts and retries
- [ ] Create smoke test suite
  - [ ] Health check validation
  - [ ] Basic user journey tests
  - [ ] API endpoint verification
- [ ] GitHub Actions integration
  - [ ] Add e2e-tests job to workflow
  - [ ] Configure test reporting
  - [ ] Upload artifacts on failure

### Deployment Validation (test-engineer)
- [ ] Health check endpoints
  - [ ] Verify `/health` endpoints respond
  - [ ] Check readiness and liveness probes
- [ ] Connectivity tests
  - [ ] Web to API communication
  - [ ] Database connectivity
  - [ ] External service access

## Priority 5: Documentation & Monitoring

### Documentation (full-stack-engineer)
- [ ] Update README with pipeline information
- [ ] Create troubleshooting guide
  - [ ] Common failure scenarios
  - [ ] Debug commands
  - [ ] ACR access issues
  - [ ] Helm deployment failures
- [ ] Document environment variables
- [ ] Create architecture diagrams

### Monitoring Setup (infrastructure-engineer)
- [ ] Deployment metrics
  - [ ] Build duration tracking
  - [ ] Deployment success rate
  - [ ] Resource utilization
- [ ] Cost monitoring
  - [ ] ACR storage costs
  - [ ] Compute resource usage
  - [ ] Preview environment costs
- [ ] Alerting configuration
  - [ ] Deployment failures
  - [ ] Resource exhaustion
  - [ ] Cost thresholds

## Acceptance Criteria

### Functional Requirements
- [ ] PR creation triggers automatic deployment
- [ ] Docker images tagged with `pr-{number}-{sha}-{timestamp}`
- [ ] Helm charts versioned as `0.0.1-pr.{number}`
- [ ] Root chart deploys both web and API apps
- [ ] Preview URLs accessible within 10 minutes
- [ ] E2E tests run automatically
- [ ] Resources cleaned up on PR closure

### Non-Functional Requirements
- [ ] Build and deployment < 10 minutes
- [ ] E2E test feedback < 5 minutes
- [ ] Zero manual intervention for standard PRs
- [ ] Automatic cleanup within 1 hour of PR closure
- [ ] Cost tracking and optimization in place

## Dependencies
- **Azure**: DCD-CNP-DEV subscription access
- **ACR**: hmctspublic.azurecr.io with push/pull permissions
- **Kubernetes**: rpe-preview namespace configured
- **DNS**: Wildcard certificate for *.preview.platform.hmcts.net
- **GitHub**: Secrets configured for Azure authentication

## Risk Mitigation
- **Build failures**: Implement ACR Build Tasks as fallback
- **Chart conflicts**: Version checking before publish
- **Resource exhaustion**: Platform-managed limits and quotas
- **Cost overrun**: Automated cleanup and retention policies
- **Security**: Service principal with minimal permissions

## Definition of Done
- [ ] All GitHub Actions workflows passing
- [ ] Successfully deployed 3 consecutive PRs
- [ ] Cleanup verified on PR closure
- [ ] Documentation reviewed and approved
- [ ] Security scan passed
- [ ] Cost analysis completed
- [ ] Team training delivered