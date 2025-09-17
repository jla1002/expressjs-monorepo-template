# VIBE-69: Onboarding Form - Task Assignments

## Implementation Tasks (full-stack-engineer)

### Module Setup
- [ ] Create libs/onboarding module structure with package.json, tsconfig.json, vitest.config.ts
- [ ] Register module in root tsconfig.json paths
- [ ] Setup module scripts for build, dev, and test

### Page Implementation
- [ ] Implement homepage update - Add "See example form" button to libs/home/src/pages/index.njk
- [ ] Create name page (libs/onboarding/src/pages/name.ts and name.njk)
- [ ] Create date-of-birth page (libs/onboarding/src/pages/date-of-birth.ts and date-of-birth.njk)
- [ ] Create address page (libs/onboarding/src/pages/address.ts and address.njk)
- [ ] Create role page with conditional Other field (libs/onboarding/src/pages/role.ts and role.njk)
- [ ] Create summary page with change links (libs/onboarding/src/pages/summary.ts and summary.njk)
- [ ] Create confirmation page (libs/onboarding/src/pages/confirmation.ts and confirmation.njk)

### Core Functionality
- [ ] Implement session data management service (libs/onboarding/src/services/session-service.ts)
- [ ] Create validation schemas using Zod (libs/onboarding/src/validation/form-schemas.ts)
- [ ] Implement form data types and interfaces (libs/onboarding/src/form-data.ts)
- [ ] Create reference number generator utility (NNNN-NNNN-NNNN-NNNN format based on timestamp)
- [ ] Implement back button navigation logic
- [ ] Add database migration for onboarding_submission table
- [ ] Implement submission persistence service using Prisma

### Localization
- [ ] Create English locale file (libs/onboarding/src/locales/en.ts)
- [ ] Create Welsh locale file (libs/onboarding/src/locales/cy.ts)
- [ ] Ensure all page content is bilingual

### Testing
- [ ] Write unit tests for session service
- [ ] Write unit tests for validation schemas
- [ ] Write unit tests for each page controller
- [ ] Write unit tests for reference number generator
- [ ] Ensure 80%+ test coverage for business logic

## Testing Tasks (test-engineer)

### E2E Test Suite
- [ ] Create E2E test file for onboarding flow (e2e-tests/tests/onboarding.spec.ts)
- [ ] Test happy path - complete form flow from homepage to confirmation
- [ ] Test back button navigation throughout the form
- [ ] Test change links from summary page
- [ ] Test form validation for each field (empty values, invalid formats)
- [ ] Test English language flow only
- [ ] Test Other role field conditional display
- [ ] Test session persistence across page refreshes
- [ ] Test accessibility with Axe-core integration

### Edge Cases
- [ ] Test browser back/forward button behavior
- [ ] Test form submission with JavaScript disabled
- [ ] Test deep linking to form steps (should redirect to start)
- [ ] Test concurrent form submissions in different tabs

## Review Tasks (code-reviewer)

### Code Quality Review
- [ ] Review adherence to HMCTS naming conventions
- [ ] Check TypeScript strict mode compliance (no any without justification)
- [ ] Verify ES module usage with .js extensions
- [ ] Ensure no hardcoded values (use constants/config)
- [ ] Check for proper error handling across all pages
- [ ] Review session management implementation for security

### Standards Compliance
- [ ] Verify GOV.UK Design System patterns are followed
- [ ] Check WCAG 2.2 AA accessibility compliance
- [ ] Ensure Welsh translations are complete and accurate
- [ ] Validate HTML semantics and form accessibility
- [ ] Review validation error messages for clarity

### Testing & Coverage
- [ ] Verify test coverage is 80-90% for business logic
- [ ] Check that all form paths are tested
- [ ] Review E2E test coverage for happy path user journeys
- [ ] Ensure edge cases are properly handled

### Security
- [ ] Review session data handling for PII concerns
- [ ] Ensure no sensitive data is logged

### Improvements to Suggest
- [ ] Identify code refactoring opportunities
- [ ] Suggest any missing test cases
- [ ] Recommend accessibility enhancements
- [ ] Propose UX improvements based on implementation

## Post-Implementation Tasks (ui-ux-engineer)

### Verification
- [ ] Review implemented UI against original wireframes
- [ ] Verify all content matches specification (English and Welsh)
- [ ] Test complete user journey matches designed flow
- [ ] Check form field behaviors match specifications

### Documentation
- [ ] Update user journey map if implementation differs
- [ ] Document any design decisions made during implementation
- [ ] Create screenshots of implemented pages for reference
- [ ] Note any deviations from original specification

### Accessibility Audit
- [ ] Manual keyboard navigation testing
- [ ] Screen reader testing with NVDA/JAWS
- [ ] Color contrast verification
- [ ] Focus management review
- [ ] Error announcement testing

## Clarified Requirements

The following decisions have been made:

1. **Session Storage**: Handled by existing infrastructure
2. **Reference Numbers**: NNNN-NNNN-NNNN-NNNN format based on timestamp
3. **Data Persistence**: Store in PostgreSQL using Prisma
4. **Validation Rules**:
   - Names: Maximum 50 characters
   - UK postcodes: Regex validation only
   - Age restrictions: 0-120 years
5. **Error Recovery**: Handled by existing session infrastructure
6. **Role Options**: Fixed list (Frontend Developer, Backend Developer, Test Engineer, Other)
7. **Address Fields**: No address lookup service integration
8. **Testing**: E2E tests in English only

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All tests passing with 80%+ coverage
- [ ] Code review completed and feedback addressed
- [ ] E2E tests passing
- [ ] Accessibility audit passed
- [ ] UI matches specification
- [ ] Documentation updated
- [ ] No linting or TypeScript errors
- [ ] Feature works with JavaScript disabled
- [ ] Manual testing completed