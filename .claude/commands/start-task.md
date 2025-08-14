# Start a task

- Use the JIRA MCP server to look up the ticket $ARGUMENT
- Run `git stash; git checkout master; git pull`
- Read @TODO.md to find a task that sounds like $ARGUMENT, if no argument is given, pick the next task in the list
- Create a new branch with the ticket number and a short description of the task `git checkout -b feature/[$ARGUMENT]-[feature-name]`, e.g. `git checkout -b feature/DEV-123-add-address-details`
- Create a folder in `docs/tickets/$ARGUMENT`
- Created a detailed specification in `docs/tickets/$ARGUMENT/spec.md` using the ui-ux-engineer agent to look at the requirements and acceptance criteria of the user story and plan out the user journey, including any pages, the structure of the forms on the pages and the language and content. Include wireframes where necessary. Ask clarifying questions where the detail in the ticket is ambiguous.
- Use the test-engineer agent to create a comprehensive test plan in `docs/tickets/$ARGUMENT/test-plan.md`
- Use the infrastructure-engineer agent to update the specification with any infrastructure changes if they are needed for the user story
- Turn the specification into actionable tasks for each sub agent / engineering discipline in `docs/tickets/$ARGUMENT/tasks.md`:
  - The frontend-engineer agent should be responsible for implementing the design of the ui-ux-engineer
  - The backend-engineer agent should be responsible for the backend code, such as handling form submission, persistance, API endpoints and scripts
  - The test-engineer agent should ensure there are unit tests for all new code
  - The code-reviewer agent should review all code from the other agents and suggest improvements 
