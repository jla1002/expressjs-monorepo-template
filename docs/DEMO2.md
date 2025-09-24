# HMCTS Monorepo

## Structure

Project is a yarn monorepo:
 - `apps` - Main applications (e.g., `api`, `web`)
 - `libs` - Shared libraries
 - `e2e-tests` - End-to-end tests
 - `docs` - Documentation

## Cloud Native Platform Integration

 - Application insights integration
 - Properties volumes & local secret management
 - Healthchecks
 - Dockerfiles
 - Helm charts

## GOV\.UK Design System

 - Asset loading
 - Welsh language support
 - Cookie manager
 - Session storage (Redis or Postgres)

## Automatic Module Registration

 - Simple router will auto-register pages and routes in `libs/`
 - Postgres app will aggregate Prisma ORM schemas from `libs/`
 - Typical lib structure:
```
libs/my-feature/
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── routes/
    │   └── api.ts
    ├── pages/
    │   ├── page.ts
    │   └── page.njk
    ├── locales/
    │   ├── en.ts
    │   └── cy.ts
    ├── views/
    └── assets/
        ├── css/
        │   └── module.scss
        └── js/
            └── module.ts
```


## GitHub Action Pipelines
 
 - Lint and test
 - Playwright UI testing
 - Sonar
 - AI security review
 - OSV Scanner for CVEs

## Developer Experience

 - Setup with `yarn install` and `yarn dev`
 - Live reloading of templates, styles and backend code
 - Linting with biome `yarn lint`
 - Unit testing with vitest `yarn test`
 - e2e testing with Playwright `yarn test:e2e`
 - Prisma Studio `http://localhost:5555`
 - Turborepo
 - Docker compose provides support services (Postgres, Redis)

## Example packages

 - `libs/footer-pages` - Example pages
 - `libs/onboarding` - Example form
