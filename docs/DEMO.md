# Demo Outline: HMCTS Monorepo Agentic Capabilities

## Part 1: CLAUDE.md & Project Intelligence 
- Show how CLAUDE.md enforces HMCTS standards automatically
- Demonstrate naming conventions enforcement (snake_case DB, camelCase TS)
- Show YAGNI/KISS principles in action
- Demonstrate module ordering and import extension rules

## Part 2: Claude Commands
- **/plan** - Start with a JIRA ticket, auto-generate specs
- **/implement** - Show full-stack agent orchestration
- **/commit** - Demonstrate git workflow automation
- **/pr** - Create PR with auto-generated description
- **/optimize** - Run performance optimization
- **/prime** - Load project context

## Part 3: Claude Hooks - Automated Quality Gates
- **post-write.sh** - Show auto-formatting/linting after edits
- **pre-commit.sh** - Demonstrate test/build validation
- **pre-bash.sh** - Show command safety checks
- **pre-pr.sh** - PR validation workflow
- Show `.claude/hooks/run.log` for debugging

## Part 4: MCP Servers Integration
- **JIRA** - Pull ticket details and search issues
- **Playwright** - Automated browser testing

## Part 5: Plan Mode Demonstration
- Show how `/plan` command works
- Demonstrate planning without execution
- Show user approval workflow
- TodoWrite integration for task tracking

## Part 6: Specialized Agents
- **infrastructure-engineer** - Create Helm charts
- **test-engineer** - Generate Playwright tests
- **code-reviewer** - Proactive code review
- **full-stack-engineer** - Build GOV.UK components
- **ui-ux-engineer** - Accessibility audit

## Part 7: GitHub Actions Integration
- Show Claude Security Review on PR
- Demonstrate automated security analysis
- Show PR comment feedback

# Code Base Demo

- Walk through `apps/api` and `apps/web`
- Lib package structure
- Dev process with yarn dev
- Prisma, Prisma Studio
- Playwright tests
- Pipelines
