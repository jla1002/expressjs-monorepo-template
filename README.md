# HMCTS Express Monorepo Template

Production-ready Node.js starter with cloud-native capabilities for building HMCTS digital services using Express.js, TypeScript, and GOV.UK Design System.

## 🚀 Overview

A comprehensive monorepo template that demonstrates best practices for building government digital services. This template provides everything you need to create accessible, secure, and scalable applications that meet GDS and HMCTS standards.

## ✨ Key Features

### Cloud Native Platform
- **Health Checks**: Configurable health endpoints with readiness and liveness probes for Kubernetes deployments
- **Azure Integration**: Built-in support for Azure Key Vault secrets management and properties volume mounting
- **Application Insights**: Comprehensive monitoring with Azure Application Insights including custom metrics and distributed tracing
- **Properties Volume**: Secure configuration management through mounted volumes with automatic environment variable injection

### Express GOV.UK Starter for frontends
- **GOV.UK Design System**: Fully integrated GOV.UK Frontend with Nunjucks templates and automatic asset compilation
- **Internationalization**: Welsh language support with locale middleware and translation management system
- **Security Headers**: Pre-configured Helmet.js with CSP, HSTS, and nonce-based script protection
- **Simple Router**: File-based routing with automatic route discovery and HTTP method handlers
- **Asset Pipeline**: Vite-powered asset compilation with SCSS support and production optimization

### Monorepo Architecture
- Single repository for multiple applications (e.g. multiple frontends sharing common code, APIs or libraries)
- Workspace-based structure with Yarn workspaces
- Shared libraries for common functionality
- TypeScript with strict mode and ES modules
- Comprehensive testing with Vitest and Playwright
- Docker multi-stage builds for production
- Helm charts for Kubernetes deployment
- GitHub Actions CI/CD pipeline
- Biome for fast linting and formatting

## Project Structure

```
expressjs-monorepo-template/
├── apps/                       # Deployable applications
│   ├── api/                    # REST API server (Express 5.x)
│   ├── web/                    # Web frontend (Express 5.x + Nunjucks)
│   └── postgres/               # Database configuration (Prisma)
├── libs/                       # Modular packages
│   ├── cloud-native-platform/  # Cloud Native Platform features
│   └── express-gov-uk-starter/ # GOV.UK Frontend integration
├── e2e-tests/                  # End-to-end tests (Playwright)
├── docs/                       # Documentation and ADRs
└── package.json                # Root configuration
```

## 🏁 Getting Started

### Prerequisites

- Node.js 22+
- Yarn 4+
- Docker (optional, for PostgreSQL)

### Quick Setup

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Access the application
http://localhost:3000
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Web Application | http://localhost:3000 | Main web interface with GOV.UK styling |
| API Server | http://localhost:3001 | REST API backend |
| Health Check | http://localhost:3001/health | API health status |
| Prisma Studio | Run `yarn workspace @hmcts/postgres run studio` | Database management UI |

## 📦 Development

### Available Commands

```bash
# Development
yarn dev                        # Start all services concurrently
yarn start:web                  # Start web application only
yarn start:api                  # Start API server only
yarn start:db                   # Start PostgreSQL in Docker

# Testing
yarn test                       # Run all tests across workspaces
yarn test:unit                  # Unit tests only
yarn test:e2e                   # Playwright E2E tests
yarn test:a11y                  # Accessibility tests with axe-core
yarn test:coverage              # Generate coverage report

# Code Quality
yarn lint                       # Run Biome linter
yarn format                     # Format code with Biome
yarn type-check                 # TypeScript type checking

# Database Operations
yarn workspace @hmcts/postgres run generate    # Generate Prisma client
yarn workspace @hmcts/postgres run migrate     # Run database migrations
yarn workspace @hmcts/postgres run studio      # Open Prisma Studio GUI

# Build & Deployment
yarn build                      # Build all packages
yarn docker:build               # Build Docker images
yarn helm:lint                  # Validate Helm charts
```

### Creating a New Feature Module

1. **Create module structure**:
```bash
mkdir -p libs/my-feature/src
cd libs/my-feature
```

2. **Initialize package.json**:
```json
{
  "name": "@hmcts/my-feature",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "express": "^5.1.0"
  }
}
```

3. **Import in your application**:
```typescript
import { myFeature } from '@hmcts/my-feature';

// Use in Express app
app.use(myFeature());
```

## 🧪 Testing Strategy

| Type | Tool | Location | Purpose |
|------|------|----------|---------|
| **Unit Tests** | Vitest | Co-located `*.test.ts` | Business logic validation |
| **Integration Tests** | Vitest + Supertest | `apps/*/src/**/*.test.ts` | API endpoint testing |
| **E2E Tests** | Playwright | `e2e-tests/` | User journey validation |
| **Accessibility Tests** | Axe-core + Playwright | `e2e-tests/` | WCAG 2.1 AA compliance |

```bash
# Run specific test suites
yarn test                    # All tests
yarn test:unit              # Unit tests only
yarn test:e2e               # E2E tests
yarn test:a11y              # Accessibility tests
yarn test:coverage          # Coverage report
```

## License

MIT
