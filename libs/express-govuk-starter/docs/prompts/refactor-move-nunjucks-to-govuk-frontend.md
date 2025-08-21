# Refactor: Move Nunjucks Components to GOV.UK Frontend Directory

## Task
Move contents from the `src/nunjucks/` directory to the `src/govuk-frontend/` directory to consolidate all GOV.UK related components in a single location.

## Why
Better organization and improved developer experience by:
- Consolidating all GOV.UK Frontend related files in one logical location
- Reducing confusion about where to find or add GOV.UK components
- Creating a cleaner project structure with clearer separation of concerns

## What Was Done

### Directory Structure Changes
- **Moved** `src/nunjucks/filters/` directory to `src/govuk-frontend/filters/`
- **Moved** `src/nunjucks/views/` directory to `src/govuk-frontend/views/`
- **Removed** the now-empty `src/nunjucks/` directory

### Code Updates
- **Updated import paths** in `src/govuk-frontend/configure-govuk.ts` to reference the new filter locations
- **Updated build script** in `package.json` to copy views from the new location (`src/govuk-frontend/views`)

### Verification
- All existing tests continue to pass
- Build process works correctly with new directory structure
- Import paths resolve correctly after the move

## Files Affected

### Key Modified Files
- `/home/linus/Work/solirius/expressjs-monorepo-template/libs/express-govuk-starter/src/govuk-frontend/configure-govuk.ts`
  - Updated filter imports to use `./filters/index.js`
- `/home/linus/Work/solirius/expressjs-monorepo-template/libs/express-govuk-starter/package.json`
  - Updated build script to copy from `src/govuk-frontend/views`

### Moved Files
- **Filters**: All filter files moved from `src/nunjucks/filters/` to `src/govuk-frontend/filters/`
  - `currency.ts` and `currency.test.ts`
  - `date.ts` and `date.test.ts`
  - `error-summary.ts` and `error-summary.test.ts`
  - `kebab-case.ts` and `kebab-case.test.ts`
  - `time.ts` and `time.test.ts`
  - `index.ts`

- **Views**: All view templates moved from `src/nunjucks/views/` to `src/govuk-frontend/views/`
  - `errors/404.njk`
  - `errors/500.njk`
  - `layouts/default.njk`
  - `layouts/full-width.njk`

## Result
The refactoring successfully consolidated all GOV.UK Frontend related components under a single directory structure, improving code organization while maintaining full functionality and test coverage.