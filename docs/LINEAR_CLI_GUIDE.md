# Linear CLI Command Reference

## Setup

```bash
# Install
npm install -g linearctl

# Configure API key
lc init
```

## Issues

### List issues
```bash
lc issue list [options]
  -t, --team <name>           Filter by team
  -a, --assignee <name>       Filter by assignee
  -s, --state <name>          Filter by state
  -l, --label <name>          Filter by label
  -p, --project <name>        Filter by project
  -c, --cycle <name>          Filter by cycle
  --limit <number>            Number of issues (max 250)
  --include-archived          Include archived issues
  --order-by <field>          Order by field (createdAt, updatedAt)
  --json                      Output as JSON
```

### Get issue
```bash
lc issue get <id> [--json]
```

### Create issue
```bash
lc issue create [options]
  -t, --title <text>          Issue title (required)
  --team <name>               Team name or key (required)
  -d, --description <text>    Issue description
  -a, --assignee <name>       Assignee
  -s, --state <name>          State
  -p, --priority <0-4>        Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
  -l, --labels <names>        Comma-separated labels
  --due-date <YYYY-MM-DD>     Due date
  --project <name>            Project
  -c, --cycle <name>          Cycle
  --parent <id>               Parent issue ID
  --delegate <emails>         Comma-separated delegate emails
  --links <ids>               Comma-separated issue IDs to link
```

### Update issue
```bash
lc issue update <id> [options]
  --title <text>              Issue title
  --description <text>        Issue description
  -a, --assignee <name>       Assignee (use "none" to clear)
  -s, --state <name>          State
  -p, --priority <0-4>        Priority
  -l, --labels <names>        Comma-separated labels
  --due-date <YYYY-MM-DD>     Due date (use "none" to clear)
  --project <name>            Project
  -c, --cycle <name>          Cycle
  --parent <id>               Parent issue ID
  -e, --estimate <number>     Story points
  --delegate <emails>         Comma-separated delegates (use "none" to clear)
  --links <ids>               Comma-separated issue IDs to link
```

### My issues
```bash
lc issue mine [options]
  -s, --state <name>          Filter by state
  --limit <number>            Number of issues
  --include-archived          Include archived issues
  --json                      Output as JSON
```

## Comments

### List comments
```bash
lc comment list <issue-id> [--json]
```

### Add comment
```bash
lc comment add <issue-id> [options]
  -b, --body <text>           Comment body (required)
  -p, --parent <id>           Parent comment ID for replies
```

## Teams

### List teams
```bash
lc team list [options]
  -q, --query <text>          Search teams
  --limit <number>            Number of teams
  --include-archived          Include archived teams
  --json                      Output as JSON
```

### Get team
```bash
lc team get <name-or-key> [--json]
```

## Users

### List users
```bash
lc user list [options]
  -q, --query <text>          Search users
  --active                    Only active users
  --include-archived          Include archived users
  --limit <number>            Number of users
  --json                      Output as JSON
```

### Get user
```bash
lc user get <name-or-email> [--json]
```

## Projects

### List projects
```bash
lc project list [options]
  -t, --team <name>           Filter by team
  -s, --state <name>          Filter by state
  -q, --query <text>          Search projects
  --limit <number>            Number of projects
  --include-archived          Include archived projects
  --json                      Output as JSON
```

### Get project
```bash
lc project get <name-or-id> [--json]
```

### Create project
```bash
lc project create [options]
  -n, --name <text>           Project name (required)
  -t, --team <name>           Team (required)
  -d, --description <text>    Description
  --lead <name>               Lead user
  -s, --state <name>          State (planned, started, completed, canceled)
  --start-date <YYYY-MM-DD>   Start date
  --target-date <YYYY-MM-DD>  Target date
```

### Update project
```bash
lc project update <id> [options]
  -n, --name <text>           Project name
  -d, --description <text>    Description
  --lead <name>               Lead user
  -s, --state <name>          State
  --start-date <YYYY-MM-DD>   Start date
  --target-date <YYYY-MM-DD>  Target date
```

## Labels

### List labels
```bash
lc label list [options]
  -t, --team <name>           Filter by team
  --limit <number>            Number of labels
  --json                      Output as JSON
```

### Create label
```bash
lc label create [options]
  -n, --name <text>           Label name (required)
  -c, --color <hex>           Color in hex format (required)
  -d, --description <text>    Description
  -t, --team <name>           Team (optional, workspace label if not specified)
```

## Workflow States

### List states
```bash
lc status list --team <name> [--json]
```

### Get state
```bash
lc status get <name-or-id> --team <name> [--json]
```

## Cycles

### List cycles
```bash
lc cycle list --team <name> [options]
  --type <type>               Type (current, previous, next, all)
  --limit <number>            Number of cycles
  --json                      Output as JSON
```

## Documents

### List documents
```bash
lc document list [options]
  -q, --query <text>          Search documents
  --project <id>              Filter by project
  --creator <id>              Filter by creator
  --limit <number>            Number of documents
  --include-archived          Include archived documents
  --json                      Output as JSON
```

### Get document
```bash
lc document get <id-or-slug> [--json]
```

## Other Commands

```bash
lc doctor                     Check configuration and connection
lc version                    Show version
lc --help                     Show help
lc <command> --help          Show command help
```

## Output Formats

- **Default**: Human-readable table format with colors
- **JSON**: Use `--json` flag for machine-readable output

```bash
# Examples
lc issue list --team ENG --json | jq '.[].title'
lc issue get ENG-123 --json | jq '.state.name'
```