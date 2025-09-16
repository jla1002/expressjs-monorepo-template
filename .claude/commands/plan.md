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
2. Create wireframes for every page using ascii art
3. Define form structures, including inputs, input types and validation rules
4. Write content in English and Welsh
5. If there are any ambiguities, ask the user for clarification
IMPORTANT: Focus ONLY on user experience, NOT implementation. Only focus on issues related to this ticket, do not try to solve cross-cutting concerns."

VERIFY: File created WITHOUT technical implementation details
```
*Mark "Create UI/UX specification" as completed*

*Mark "Add technical implementation details" as in_progress*

### Step 2.2: Technical Enhancement [ISOLATED AGENT]
```
AGENT: full-stack-engineer  
TASK: Add implementation details to existing specification
INPUT: docs/tickets/$ARGUMENT/specification.md
ACTION: SUPPLEMENT with technical details

PROMPT FOR AGENT:
"Review the UI/UX specification and ADD:
1. High level technical implementation approach
2. File structure and routing (paying attention to the guidelines in @CLAUDE.md - use libs/ instead of apps/ where possible)
3. Error handling implementation
4. RESTful API endpoints if the user story requires them
5. Database schema if the user story requires it
6. If there are any ambiguities, ask the user for clarification
IMPORTANT: ADD to existing content, do not remove UI/UX sections. Only focus on issues related to this ticket, do not try to solve cross-cutting concerns."

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
1. Database changes needed
2. Environment variables that need to be added
3. Helm chart updates
4. Docker/Kubernetes updates
5. CI/CD pipeline changes
ADD infrastructure section ONLY if changes needed"
IMPORTANT: Only focus on issues related to this ticket, do not try to solve cross-cutting concerns like sessions, CSRF or other tangential issues.

VERIFY: Infrastructure section complete or confirmed not needed
```
*Mark "Review infrastructure requirements" as completed*

## PHASE 3: Planning
*Mark "Create task assignments" as in_progress*

### Step 3.1: Task Assignment Document
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
- [ ] Create E2E tests for happy path

## Review Tasks (code-reviewer)
- [ ] Review code quality and standards
- [ ] Ensure 80-90% test coverage
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

### Step 4: Clarifying Questions

Consolidate all clarifying questions from the sub-agents and relay to the user.

## Success Output
"Task $ARGUMENT setup complete. Documentation created at docs/tickets/$ARGUMENT/"