# VIBE-125: Module Autoloading Refactor - Implementation Tasks

## Phase 1: Create Module Export Structure
- [ ] Add index.ts exports for @hmcts/onboarding module
- [ ] Add index.ts exports for @hmcts/postgres module
- [ ] Add index.ts exports for @hmcts/footer-pages module

## Phase 2: Update Web App
- [ ] Delete apps/web/src/modules.ts
- [ ] Update apps/web/src/app.ts to use explicit imports
- [ ] Update apps/web/package.json with lib dependencies

## Phase 3: Update API App
- [ ] Update apps/api/src/app.ts to use explicit imports
- [ ] Update apps/api/package.json with lib dependencies

## Phase 4: Database Schema Integration
- [ ] Create libs/postgres/src/schema-discovery.ts if needed
- [ ] Update schema discovery to use explicit imports

## Phase 5: Documentation Updates
- [ ] Update CLAUDE.md with new module creation process
- [ ] Update README.md module registration section
- [ ] Update full-stack-engineer.md to remove auto-discovery references

## Testing & Verification
- [ ] Verify web app starts and pages load correctly
- [ ] Verify API app starts and routes work correctly
- [ ] Verify turborepo dependency tracking works
- [ ] Run existing test suites to ensure no regressions

## Success Criteria
- [ ] All modules use explicit imports instead of glob discovery
- [ ] Turborepo can track dependencies and optimize builds
- [ ] Documentation updated for new patterns
- [ ] Unit tests are passing with >80% coverage
- [ ] e2e tests are passing
