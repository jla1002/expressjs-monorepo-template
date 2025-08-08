# HMCTS Monorepo AI Development Guide

This guide contains specific instructions for AI assistants working on HMCTS projects.

## Core Development Commands

```bash
# Install dependencies (run from root)
yarn install

# Start development environment
yarn dev              # Start all services concurrently
yarn start:db        # Start PostgreSQL in Docker
yarn start:api       # Start API server on port 3001
yarn start:web       # Start web frontend on port 3000

# Testing
yarn test            # Run all tests across workspaces
yarn test:unit       # Unit tests only
yarn test:e2e        # Playwright E2E tests
yarn test:a11y       # Accessibility tests with axe-core

# Code quality
yarn lint            # Run Biome linter
yarn format          # Format code with Biome
yarn type-check      # TypeScript type checking
yarn test:coverage   # Run tests with coverage report

# Database operations
yarn workspace @hmcts/postgres run generate    # Generate Prisma client
yarn workspace @hmcts/postgres run migrate     # Run migrations
yarn workspace @hmcts/postgres run studio      # Open Prisma Studio

# Build and deployment
yarn build           # Build all packages
yarn docker:build    # Build Docker images
yarn helm:lint       # Validate Helm charts
```

## Naming Conventions (STRICT - MUST FOLLOW)

### 1. Database Tables and Fields
- **MUST be singular and snake_case**: `user`, `case`, `created_at`
- Use Prisma `@@map` and `@map` for aliases
```prisma
model Case {
  id         String   @id @default(cuid())
  caseNumber String   @unique @map("case_number")
  createdAt  DateTime @default(now()) @map("created_at")
  
  @@map("case")
}
```

### 2. TypeScript Variables
- Use camelCase: `userId`, `caseDetails`, `documentId`
- Booleans with `is/has/can`: `isActive`, `hasAccess`, `canEdit`

### 3. Classes and Interfaces
- Use PascalCase: `UserService`, `CaseRepository`
- NO `I` prefix: `UserRepository` not `IUserRepository`

### 4. Constants
- Use SCREAMING_SNAKE_CASE: `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`

### 5. Files and Directories
- Use kebab-case: `user-service.ts`, `case-management/`

### 6. API Endpoints
- Plural for collections: `/api/cases`, `/api/users`
- Singular for specific: `/api/case/:id`
- Singular for creation: `POST /api/case`

### 7. Package Names
- Use @hmcts scope: `@hmcts/auth`, `@hmcts/case-management`

## Module Development Guidelines

### Creating a New Feature Module

1. **Create module structure**:
```bash
mkdir -p libs/my-feature/{src,tests}
```

2. **Package.json requirements**:
```json
{
  "name": "@hmcts/my-feature",
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

3. **Export pattern**:
```typescript
// libs/my-feature/src/index.ts
export * from './routes/index.js';
export * from './middleware/index.js';
export * from './services/index.js';
```

### Express Middleware Pattern

```typescript
// libs/auth/src/middleware/authenticate.ts
import type { Request, Response, NextFunction } from 'express';

export function authenticate() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Authentication logic
      next();
    } catch (error) {
      res.status(401).render('errors/401');
    }
  };
}
```

### Nunjucks View Organization

```
libs/[module]/src/views/
├── layouts/              # Layout templates
├── pages/                # Full page templates
├── partials/             # Reusable components
└── macros/               # Nunjucks macros
```

## Testing Strategy

- **Unit/Integration Tests**: Vitest, co-located with source (`*.test.ts`)
- **E2E Tests**: Playwright in `e2e-tests/`
- **Accessibility Tests**: Axe-core with Playwright
- **Test Scripts**: All packages must use `"test": "vitest run"`
- **Coverage**: Aim for >80% on business logic

### Test File Pattern
```typescript
// user-service.test.ts (co-located with user-service.ts)
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './user-service';

vi.mock('@hmcts/postgres', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

describe('UserService', () => {
  it('should find user by id', async () => {
    // Test implementation
  });
});
```

## Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` without justification
- **ES Modules**: Use `"type": "module"` in all package.json files
- **Express**: Version 5.x only (`"express": "5.1.0"`)
- **Imports**: Use workspace aliases (`@hmcts/*`)
- **Formatting**: Biome with 160 character line width
- **Linting**: Fix all Biome warnings before commit
- **No CommonJS**: Use `import`/`export`, never `require()`/`module.exports`
- **Pinned dependencies**: Specific versions only (`"express": "5.1.0"`) - except peer dependencies

## Security Requirements

- Input validation on all endpoints
- CSRF protection on state-changing operations
- Content Security Policy headers
- Rate limiting on public endpoints
- Parameterized database queries (Prisma)
- No sensitive data in logs
- Encrypted session storage

## Welsh Language Implementation

```typescript
// libs/i18n/src/middleware/locale.ts
export function localeMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const locale = req.query.lng || req.cookies.locale || 'en';
    req.locale = locale;
    res.locals.locale = locale;
    res.locals.t = (key: string) => translate(key, locale);
    next();
  };
}
```

## Azure Application Insights

```typescript
// libs/monitoring/src/services/app-insights.ts
import { TelemetryClient } from 'applicationinsights';

export class MonitoringService {
  private client: TelemetryClient;

  trackRequest(req: Request, res: Response) {
    this.client.trackNodeHttpRequest({
      request: req,
      response: res
    });
  }

  trackException(error: Error, properties?: Record<string, any>) {
    this.client.trackException({
      exception: error,
      properties
    });
  }
}
```

## Common Pitfalls to Avoid

1. **Don't put business logic in apps/** - Use libs/ modules
2. **Don't hardcode values** - Use environment variables
3. **Don't skip Welsh translations** - Required for all user-facing text
4. **Don't use CommonJS** - ES modules only
5. **Don't ignore TypeScript errors** - Fix or justify with comments
6. **Don't duplicate dependencies** - Check root package.json first
7. **Don't create circular dependencies** between modules
8. **Don't skip accessibility testing** - WCAG 2.1 AA is mandatory
9. **Don't commit secrets** - Use environment variables
10. **Don't use relative imports across packages** - Use @hmcts/* aliases

## Development Workflow

### 1. Feature Development
- Create feature module in libs/
- Add routes, middleware, services
- Write co-located tests
- Import in relevant app

### 2. Database Changes
- Modify schema in apps/postgres/prisma/schema.prisma
- Run `yarn workspace @hmcts/postgres run generate`
- Create migration if needed

### 3. Adding Dependencies
- Check if available in root package.json
- Add to specific package only if needed
- Use exact versions (no ~ or ^)

## Debugging Tips

1. **Module Loading**: Check imports in apps/*/src/app.ts
2. **Database Issues**: Enable Prisma logging with `DEBUG=prisma:query`
3. **Welsh Translations**: Check locale middleware and translation files
4. **Azure Insights**: Check connection string and network access
5. **Docker Build**: Verify multi-stage build and dependencies

## AI Development Notes

This template is optimized for AI-assisted development:
- Clear separation between apps (thin) and libs (logic)
- Modular architecture for focused changes
- Comprehensive type definitions
- Test coverage validates AI-generated code
- Consistent patterns across modules

When developing:
- Always check existing modules for patterns
- Follow naming conventions exactly
- Write tests for new functionality
- Consider Welsh language from the start

