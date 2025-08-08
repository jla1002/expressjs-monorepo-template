# HMCTS Express.js Monorepo Template

A production-ready monorepo template for HMCTS applications built with Express.js, TypeScript, Nunjucks, and GOV.UK Frontend.

## Features

- 🏗️ **Modular Architecture**: Clean separation between apps (thin deployment layer) and libs (business logic)
- 🎨 **GOV.UK Design System**: Full integration with GOV.UK Frontend for consistent government service design
- 🏴 **Welsh Language Support**: Built-in i18n with English and Welsh translations
- 🔒 **Security First**: Authentication, authorization, CSRF protection, and secure headers
- 📊 **Azure Integration**: Application Insights monitoring and Azure-ready deployment
- 🧪 **Comprehensive Testing**: Unit tests (Vitest), E2E tests (Playwright), and accessibility testing
- 🔄 **CI/CD Ready**: GitHub Actions, Renovate for dependencies, SonarQube for code quality

## Project Structure

```
expressjs-monorepo-template/
├── apps/                       # Deployable applications
│   ├── api/                    # REST API server (Express 5.x)
│   ├── web/                    # Web frontend (Express 5.x + Nunjucks)
│   └── postgres/               # Database configuration (Prisma)
├── libs/                       # Modular packages
│   ├── auth/                   # Authentication & authorization
│   ├── nunjucks/               # Template engine configuration
│   ├── govuk-frontend/         # GOV.UK Frontend integration
│   ├── i18n/                   # Internationalization (Welsh support)
│   └── monitoring/             # Azure Application Insights
├── e2e-tests/                  # End-to-end tests (Playwright)
├── docs/                       # Documentation and ADRs
└── package.json                # Root configuration
```

## Quick Start

### Prerequisites

- Node.js 22+
- Yarn 4+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd expressjs-monorepo-template
```

2. Install dependencies:
```bash
yarn install
```

3. Start development servers:
```bash
yarn dev
```

### Access Services

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: `yarn workspace @hmcts/postgres run studio`

## Development

### Commands

```bash
# Development
yarn dev                        # Start all services
yarn start:web                  # Start web app only
yarn start:api                  # Start API only
yarn start:db                   # Start PostgreSQL

# Testing
yarn test                       # Run all tests
yarn test:unit                  # Unit tests only
yarn test:e2e                   # E2E tests
yarn test:coverage              # With coverage report

# Code Quality
yarn lint                       # Run linter
yarn format                     # Format code

# Database
yarn workspace @hmcts/postgres run generate    # Generate Prisma client
yarn workspace @hmcts/postgres run migrate     # Run migrations
yarn workspace @hmcts/postgres run studio      # Open Prisma Studio

# Build
yarn build                      # Build all packages
yarn docker:build               # Build Docker images
```

### Creating a New Module

1. Create module structure:
```bash
mkdir -p libs/my-module/src
```

2. Add package.json:
```json
{
  "name": "@hmcts/my-module",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

3. Import in app:
```typescript
import { myFunction } from '@hmcts/my-module';
```

## Architecture Decisions

### Modular Design
Business logic is organized into reusable modules in `libs/`, keeping applications thin and focused on configuration and orchestration.

### Database Design
- Tables use singular names with snake_case
- Prisma provides TypeScript types and migrations
- Multi-tenant support built-in

### Security
- JWT-based authentication
- Role-based authorization
- CSRF protection
- Content Security Policy
- Rate limiting

### Testing Strategy
- Unit tests co-located with source files
- Integration tests for API endpoints
- E2E tests for user journeys
- Accessibility testing with axe-core

### Welsh Language

The application supports English and Welsh languages. Set the locale:
- Query parameter: `?lng=cy`
- Cookie: `locale=cy`
- Default: `DEFAULT_LOCALE=en`

### Coding Standards

- **Database**: Singular snake_case (`user`, `case_number`)
- **TypeScript**: camelCase variables, PascalCase classes
- **Files**: kebab-case (`user-service.ts`)
- **API**: Plural resources (`/api/users`)
- **Packages**: @hmcts scope (`@hmcts/auth`)

## Testing

Run the test suite:
```bash
yarn test               # All tests
yarn test:unit          # Unit tests only
yarn test:e2e           # E2E tests
yarn test:coverage      # Coverage report
```

## License

MIT
