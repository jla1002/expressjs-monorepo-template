# VIBE-69 Onboarding Form - Implementation Tasks

## Implementation Tasks (full-stack-engineer)

### Module Setup
- [ ] Create `libs/onboarding` module structure with package.json, tsconfig.json, vitest.config.ts
- [ ] Register module in root tsconfig.json paths as `@hmcts/onboarding`
- [ ] Setup build scripts including Nunjucks template copying

### Homepage Update
- [ ] Update homepage template to include "See example form" link to `/onboarding/start`
- [ ] Add Welsh translation for the link text

### Page Implementation
- [ ] Implement `/onboarding/start` page (controller + template) with service information and requirements
- [ ] Implement `/onboarding/name` page (controller + template) with name collection
- [ ] Implement `/onboarding/date-of-birth` page with date fields (day, month, year) on same row
- [ ] Implement `/onboarding/address` page with address fields (line 1, line 2, town, postcode)
- [ ] Implement `/onboarding/role` page with radio buttons and conditional "Other" text field
- [ ] Implement `/onboarding/summary` page with all collected data and change links
- [ ] Implement `/onboarding/confirmation` page with submission confirmation

### Session Management
- [ ] Create session management utilities for form data storage
- [ ] Implement data preservation between pages
- [ ] Add session cleanup on confirmation

### Validation with Zod
- [ ] Install and configure Zod for validation
- [ ] Create Zod schemas for each form page (name, dob, address, role)
- [ ] Implement server-side validation using Zod schemas
- [ ] Add age validation (minimum 16 years) using Zod refinement
- [ ] Add UK postcode format validation with Zod regex
- [ ] Create Zod error formatter for GOV.UK error display
- [ ] Implement discriminated union for role conditional validation

### Navigation
- [ ] Implement back navigation functionality with data preservation
- [ ] Add navigation helpers for page flow (getPreviousPage, getNextPage)
- [ ] Add change links on summary page with return context (?return=summary)
- [ ] Setup proper URL routing under `/onboarding/` path
- [ ] Ensure start page has no back link, name page goes back to start

### Localization
- [ ] Create English locale file with common strings
- [ ] Create Welsh locale file with all translations
- [ ] Add start page content in both languages
- [ ] Ensure all 8 pages render correctly in both languages

### Unit Tests
- [ ] Write unit tests for validation utilities (90% coverage)
- [ ] Write unit tests for session management utilities
- [ ] Write unit tests for each page controller
- [ ] Test error handling scenarios

## Testing Tasks (test-engineer)

### E2E Testing
- [ ] Create E2E test for happy path (start page through confirmation)
- [ ] Create E2E test for back navigation functionality (including start page)
- [ ] Create E2E test for validation errors and recovery
- [ ] Create E2E test for summary page change links with return context
- [ ] Create E2E test for Welsh language journey (all 8 pages)
- [ ] Test form with accessibility tools (screen reader, keyboard navigation)
- [ ] Test date input fields appear on same row

### Cross-Browser Testing
- [ ] Test form in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (responsive design)
- [ ] Verify progressive enhancement (JavaScript disabled)

### Performance Testing
- [ ] Measure page load times for all 8 form pages
- [ ] Test session handling under load
- [ ] Verify no memory leaks in session management

## Review Tasks (code-reviewer)

### Code Quality Review
- [ ] Review adherence to HMCTS coding standards
- [ ] Check TypeScript strict mode compliance (no `any` without justification)
- [ ] Verify ES module usage (no CommonJS)
- [ ] Review naming conventions (camelCase, PascalCase, kebab-case)
- [ ] Check file organization and module structure

### Testing Review
- [ ] Verify 80-90% test coverage achieved
- [ ] Review test quality and edge case coverage
- [ ] Check E2E test comprehensiveness

### Security Review
- [ ] Verify input validation on all form fields
- [ ] Check for XSS vulnerabilities in form handling
- [ ] Review session data handling for security
- [ ] Ensure no sensitive data in logs

### Accessibility Review
- [ ] Verify WCAG 2.2 AA compliance
- [ ] Check proper form labeling and ARIA attributes
- [ ] Review error message accessibility
- [ ] Test keyboard navigation flow

### Performance Review
- [ ] Check for unnecessary re-renders or calculations
- [ ] Review session data size and cleanup
- [ ] Verify efficient validation logic

### Suggestions for Improvement
- [ ] Identify code optimization opportunities
- [ ] Suggest UX enhancements based on implementation
- [ ] Recommend testing improvements
- [ ] Document any technical debt created

## Post-Implementation (ui-ux-engineer)

### Verification
- [ ] Verify all pages match wireframe specifications
- [ ] Check form flow matches user journey diagram
- [ ] Validate all content appears in English and Welsh
- [ ] Test user experience with actual users if possible

### Documentation Updates
- [ ] Update user journey map based on final implementation
- [ ] Document any deviations from original specification
- [ ] Create user testing feedback summary if conducted

### Database Tasks
- [ ] Add OnboardingSubmission model to Prisma schema
- [ ] Create database migration for onboarding_submission table
- [ ] Implement database queries for saving submissions
- [ ] Add submission timestamp and optional session ID tracking

### Accessibility Validation
- [ ] Conduct manual accessibility testing
- [ ] Verify color contrast ratios
- [ ] Test with assistive technologies
- [ ] Document any accessibility improvements made

## Definition of Done

- [ ] All implementation tasks completed
- [ ] All tests passing with >80% coverage
- [ ] Code review feedback addressed
- [ ] Accessibility standards met (WCAG 2.2 AA)
- [ ] Both English and Welsh languages fully functional
- [ ] No linting or TypeScript errors
- [ ] Documentation updated
- [ ] Ready for deployment

## Notes

- Clarifying questions from specification should be addressed before implementation
- Consider optional database persistence for future enhancement
- Progressive enhancement approach - core functionality works without JavaScript
- Follow GOV.UK Design System patterns throughout