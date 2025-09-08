---
description: Start working on a JIRA ticket with full specification and planning
argument-hint: <ticket-id>
allowed-tools: 
  - Task
  - TodoWrite
  - Bash
  - mcp__jira__*
  - Write
  - MultiEdit
---

# Start Task: $ARGUMENT

## Initialize TodoWrite Progress Tracking
Use TodoWrite to create this checklist:
```
- [ ] Retrieve JIRA ticket $ARGUMENT
- [ ] Setup git branch
- [ ] Create documentation folder
- [ ] Create UI/UX specification
- [ ] Add technical implementation details
- [ ] Review infrastructure requirements  
- [ ] Create test plan
- [ ] Create task assignments
```

## PHASE 1: Setup
*Mark "Retrieve JIRA ticket" as in_progress*

### Step 1.1: JIRA Retrieval
```
ACTION: Use mcp__jira__jira_get_issue
INPUT: issue_key=$ARGUMENT
VERIFY: Ticket summary and acceptance criteria understood
```
*Mark "Retrieve JIRA ticket" as completed*

*Mark "Setup git branch" as in_progress*

### Step 1.2: Git Branch Setup
```
EXECUTE IN ORDER:
1. git stash
2. git checkout master  
3. git pull
4. git checkout -b feature/$ARGUMENT-[derive-name-from-ticket]
VERIFY: On new feature branch
```
*Mark "Setup git branch" as completed*

*Mark "Create documentation folder" as in_progress*

### Step 1.3: Documentation Structure
```
ACTION: mkdir -p docs/tickets/$ARGUMENT
VERIFY: Folder exists at docs/tickets/$ARGUMENT
```
*Mark "Create documentation folder" as completed*

## PHASE 2: Specification Development
*Mark "Create UI/UX specification" as in_progress*

### Step 2.1: UI/UX Specification [ISOLATED AGENT]
```
AGENT: ui-ux-engineer
TASK: Create user-focused specification
OUTPUT: docs/tickets/$ARGUMENT/specification.md

PROMPT FOR AGENT:
"Based on ticket $ARGUMENT requirements:
1. Design the user journey with clear flow diagram, illustrated with ascii art
2. Create page wireframes and layouts
3. Define form structures and validation rules
4. Write content in English and Welsh
IMPORTANT: Focus ONLY on user experience, NOT implementation"

VERIFY: File created WITHOUT technical implementation details
```
*Mark "Create UI/UX specification" as completed*

*Mark "Add technical implementation details" as in_progress*

### Step 2.2: Technical Enhancement [ISOLATED AGENT]
```
AGENT: full-stack-engineer  
TASK: Add implementation details to existing specification
INPUT: docs/tickets/$ARGUMENT/specification.md
ACTION: UPDATE (not replace) with technical details

PROMPT FOR AGENT:
"Review the UI/UX specification and ADD:
1. Technical implementation approach
2. File structure and routing
3. State management strategy
4. API endpoints needed
5. Database schema if required
6. Error handling implementation
IMPORTANT: ADD to existing content, do not remove UI/UX sections"

VERIFY: Implementation details added to specification
```
*Mark "Add technical implementation details" as completed*

*Mark "Review infrastructure requirements" as in_progress*

### Step 2.3: Infrastructure Review [ISOLATED AGENT]
```
AGENT: infrastructure-engineer
TASK: Assess infrastructure needs
INPUT: docs/tickets/$ARGUMENT/specification.md
ACTION: UPDATE with infrastructure section if needed

PROMPT FOR AGENT:
"Review specification and determine:
1. Session/storage requirements
2. Database changes needed
3. Environment variables
4. Docker/Kubernetes updates
5. CI/CD pipeline changes
ADD infrastructure section ONLY if changes needed"

VERIFY: Infrastructure section complete or confirmed not needed
```
*Mark "Review infrastructure requirements" as completed*

## PHASE 3: Planning
*Mark "Create test plan" as in_progress*

### Step 3.1: Test Planning [ISOLATED AGENT]
```
AGENT: test-engineer
TASK: Create comprehensive test plan
OUTPUT: docs/tickets/$ARGUMENT/test-plan.md

PROMPT FOR AGENT:
"Based on specification, create test plan including:
1. E2E test cases (Playwright)
2. Accessibility testing (axe-core)

VERIFY: Test plan created at correct location
```
*Mark "Create test plan" as completed*

*Mark "Create task assignments" as in_progress*

### Step 3.2: Task Assignment Document
```
ACTION: Create docs/tickets/$ARGUMENT/tasks.md
EXAMPLE CONTENT STRUCTURE:

## Implementation Tasks (full-stack-engineer)
- [ ] Implement each page/component from specification
- [ ] Create validation utilities
- [ ] Setup routing and navigation
- [ ] Implement form handling
- [ ] Write unit tests for all new code

## Testing Tasks (test-engineer)  
- [ ] Ensure 80-90% test coverage on unit tests
- [ ] Create E2E tests for happy path
- [ ] Test error scenarios
- [ ] Verify accessibility

## Review Tasks (code-reviewer)
- [ ] Review code quality and standards
- [ ] Check security implementation
- [ ] Suggest improvements to user

## Post-Implementation (ui-ux-engineer)
- [ ] Update user journey map based on final implementation
- [ ] Verify UI matches specification

VERIFY: All agents have assigned tasks
```
*Mark "Create task assignments" as completed*

## COMPLETION CHECK
```
Review TodoWrite list - all items should be marked completed.
If any items remain incomplete, identify and complete them.
```

## Success Output
"Task $ARGUMENT setup complete. Documentation created at docs/tickets/$ARGUMENT/"