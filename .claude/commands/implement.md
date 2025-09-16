---
description: Implement a JIRA ticket with parallel engineering, testing, and infrastructure work
argument-hint: <ticket-id>
allowed-tools:
  - Task
  - TodoWrite
  - Bash
  - mcp__jira__*
  - Read
  - Write
  - Edit
  - MultiEdit
  - Glob
  - Grep
---

# Implement Task: $ARGUMENT

## Initialize TodoWrite Progress Tracking
Use TodoWrite to create this checklist:
```
- [ ] Retrieve $ARGUMENT specifications in /docs/tickets/$ARGUMENT/
- [ ] Execute parallel implementation (engineering, testing, infrastructure)
- [ ] Run code quality checks (lint, format, unit test)
- [ ] Perform code review
- [ ] Execute all tests (unit and E2E)
- [ ] Apply review feedback
- [ ] Final verification
```

## PHASE 1: Setup and Preparation
*Mark "Retrieve $ARGUMENT specifications in /docs/tickets/$ARGUMENT/" as in_progress*

### Step 1.1: Documentation Loading
```
ACTION: Read specification and test plan
READ: docs/tickets/$ARGUMENT/specification.md
READ: docs/tickets/$ARGUMENT/test-plan.md
READ: docs/tickets/$ARGUMENT/tasks.md
VERIFY: All documentation available
```
*Mark "Retrieve $ARGUMENT specifications in /docs/tickets/$ARGUMENT/" as completed*

## PHASE 2: Parallel Implementation
*Mark "Execute parallel implementation" as in_progress*

### Step 2.1: Launch Parallel Agents [EXECUTE IN PARALLEL]

#### Engineering Implementation Agent
```
AGENT: full-stack-engineer
TASK: Implement all engineering tasks from docs/tickets/$ARGUMENT/tasks.md

PROMPT FOR AGENT:
"Implement the engineering tasks for ticket $ARGUMENT:
1. Read the specification at docs/tickets/$ARGUMENT/specification.md
2. Read the task list at docs/tickets/$ARGUMENT/tasks.md
3. Implement ALL items under 'Implementation Tasks' section
4. AS YOU COMPLETE EACH TASK:
   - Use the Edit tool to update docs/tickets/$ARGUMENT/tasks.md
   - Change '- [ ]' to '- [x]' for each completed task
   - Update the checklist after completing each major section
5. Follow CLAUDE.md conventions strictly:
6. Write unit tests for all new code (co-located .test.ts files)
7. Ensure >80% test coverage on business logic
8. BEFORE FINISHING: Verify all your tasks in docs/tickets/$ARGUMENT/tasks.md are marked as [x]
IMPORTANT: You MUST update tasks.md to track your progress"
```

#### Testing Implementation Agent
```
AGENT: test-engineer
TASK: Implement all testing tasks from docs/tickets/$ARGUMENT/tasks.md

PROMPT FOR AGENT:
"Implement the testing tasks for ticket $ARGUMENT:
1. Read the test plan at docs/tickets/$ARGUMENT/test-plan.md
2. Read the task list at docs/tickets/$ARGUMENT/tasks.md
3. Implement ALL items under 'Testing Tasks' section
4. AS YOU COMPLETE EACH TASK:
   - Use the Edit tool to update docs/tickets/$ARGUMENT/tasks.md
   - Change '- [ ]' to '- [x]' for each completed test category
   - Update the checklist after completing each test suite
5. Create E2E tests for the happy path using Playwright in e2e-tests/
6. Include accessibility tests using axe-core in the happy path tests (not separate tests)
9. BEFORE FINISHING: Verify all your tasks in docs/tickets/$ARGUMENT/tasks.md are marked as [x]
IMPORTANT: You MUST update tasks.md to track your progress"
```

#### Infrastructure Implementation Agent
```
AGENT: infrastructure-engineer
TASK: Implement infrastructure requirements if needed

PROMPT FOR AGENT:
"Review and implement infrastructure needs for ticket $ARGUMENT:
1. Read specification at docs/tickets/$ARGUMENT/specification.md
2. Check if infrastructure section exists
3. IF infrastructure changes needed:
   - Update Helm charts if needed
   - Modify Docker configurations if required
   - Update CI/CD pipeline if needed
   - Use Edit tool to mark infrastructure tasks as [x] in docs/tickets/$ARGUMENT/tasks.md
4. IF no infrastructure changes needed:
   - Report 'No infrastructure changes required'
   - If infrastructure tasks exist in docs/tickets/$ARGUMENT/tasks.md, mark them as N/A
5. DO NOT run migrations or builds - coordinator will handle
6. Update docs/tickets/$ARGUMENT/tasks.md with your findings
IMPORTANT: Document your infrastructure assessment in tasks.md"
```

WAIT FOR ALL AGENTS TO COMPLETE
VERIFY: All three agents have finished their tasks

### Step 2.2: Validate Task Completion
```
ACTION: Read docs/tickets/$ARGUMENT/tasks.md
VERIFY:
- Implementation Tasks section has [x] markers for completed items
- Testing Tasks section has [x] markers for completed items
- Infrastructure assessment is documented

IF tasks are NOT properly marked:
  WARNING: Agents did not update task tracking
  ACTION: Manually verify implementation by checking:
    - ls libs/*/src/pages/ for new modules
    - ls e2e-tests/tests/ for new tests
    - git status for all changes
```
*Mark "Execute parallel implementation" as completed*

## PHASE 3: Code Quality and Testing
*Mark "Run code quality checks" as in_progress*

### Step 3.1: Code Quality Checks
```
EXECUTE IN SEQUENCE:
1. yarn format (format code with Biome)
2. yarn lint (run Biome linter)
3. IF database changes made:
   - yarn workspace @hmcts/postgres run generate
   - yarn workspace @hmcts/postgres run migrate
4. yarn test
VERIFY: All checks pass, fix any issues found
```
*Mark "Run code quality checks" as completed*

*Mark "Execute all tests" as in_progress*

### Step 3.2: Test Execution
```
EXECUTE IN SEQUENCE:
1. yarn dev (test the app boots)
2. yarn test (run unit tests)
3. yarn test:e2e (run Playwright E2E tests)
4. yarn test:coverage (verify coverage >80%)
VERIFY: All tests pass
IF tests fail:
  - Identify failing tests
  - Fix implementation or test issues
  - Re-run until all pass
```
*Mark "Execute all tests" as completed*

## PHASE 4: Code Review
*Mark "Perform code review" as in_progress*

### Step 4.1: Code Review [ISOLATED AGENT]
```
AGENT: code-reviewer
TASK: Review all changes and provide feedback

PROMPT FOR AGENT:
"Review all changes made for ticket $ARGUMENT:
1. Run git diff to see all changes
2. Check adherence to CLAUDE.md conventions:
   - Naming conventions followed
   - Module structure correct
   - Welsh translations included
   - No business logic in apps/
   - TypeScript strict mode compliance
3. Verify security requirements:
   - Input validation present
   - No hardcoded secrets
   - Parameterized queries used
4. Check test coverage and quality
5. Create a review report with:
   - Issues that MUST be fixed (blocking)
   - Suggestions for improvement (non-blocking)
   - Positive observations
OUTPUT: Save review to docs/tickets/$ARGUMENT/review.md"

VERIFY: Review document created
```
*Mark "Perform code review" as completed*

## PHASE 5: Apply Feedback
*Mark "Apply review feedback" as in_progress*

### Step 5.1: Process Review Feedback
```
ACTION: Read docs/tickets/$ARGUMENT/review.md
IDENTIFY: Blocking issues that must be fixed

IF blocking issues exist:
  LAUNCH APPROPRIATE AGENT(S) TO FIX:
  - full-stack-engineer for code issues
  - test-engineer for test issues
  - infrastructure-engineer for infrastructure issues

  PROMPT: "Fix the following blocking issues from code review:
  [List specific issues]
  After fixing, re-run relevant tests to verify"

  AFTER FIXES:
  - Re-run yarn lint && yarn format
  - Re-run relevant tests
  - Verify all blocking issues resolved
```
*Mark "Apply review feedback" as completed*

## PHASE 6: Final Verification
*Mark "Final verification" as in_progress*

### Step 6.1: Final Checks
```
EXECUTE FINAL VERIFICATION:
1. yarn lint (ensure no linting errors)
2. yarn format (ensure proper formatting)
3. yarn test (all unit tests pass)
4. yarn dev (app boots successfully)
5. yarn test:e2e (all E2E tests pass)
6. git status (review all changes)

VERIFY ALL:
- No linting or formatting issues
- All tests passing
- Coverage >80% on business logic
- All tasks from docs/tickets/$ARGUMENT/tasks.md completed
- All blocking review issues resolved
```
*Mark "Final verification" as completed*

## COMPLETION CHECK
```
ACTION: Final validation of task tracking
1. Read docs/tickets/$ARGUMENT/tasks.md
2. Count total tasks vs completed [x] tasks
3. Generate completion report:
   - Implementation Tasks: X/Y completed
   - Testing Tasks: X/Y completed
   - Infrastructure Tasks: X/Y completed or N/A

IF any tasks remain unchecked:
  - Identify which specific tasks are incomplete
  - Verify if work was actually done (check git status)
  - Either complete missing work OR document why task cannot be completed
  - Update tasks.md accordingly

FINAL VALIDATION:
- All critical tasks must be marked [x] or have documented exceptions
- Definition of Done checklist should reflect actual state
```

## Success Output
"Implementation of $ARGUMENT complete:
- ✅ All engineering tasks implemented
- ✅ All tests written and passing
- ✅ Infrastructure updated (if needed)
- ✅ Code review completed and feedback applied
- ✅ Lint and format checks passing
Ready for PR creation"