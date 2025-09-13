Use `lc` (after installing globally) or `npx linearctl` (without installation).

## Issues

### lc issue list
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

### lc issue get
```bash
lc issue get <id> [--json]
```

### lc issue create
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

### lc issue update
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

### lc issue mine
```bash
lc issue mine [options]
  -s, --state <name>          Filter by state
  --limit <number>            Number of issues
  --include-archived          Include archived issues
  --json                      Output as JSON
```

## Comments

### lc comment list
```bash
lc comment list <issue-id> [--json]
```

### lc comment add
```bash
lc comment add <issue-id> [options]
  -b, --body <text>           Comment body (required)
  -p, --parent <id>           Parent comment ID for replies
```

## Teams

### lc team list
```bash
lc team list [options]
  -q, --query <text>          Search teams
  --limit <number>            Number of teams
  --include-archived          Include archived teams
  --json                      Output as JSON
```

### lc team get
```bash
lc team get <name-or-key> [--json]
```

## Users

### lc user list
```bash
lc user list [options]
  -q, --query <text>          Search users
  --active                    Only active users
  --include-archived          Include archived users
  --limit <number>            Number of users
  --json                      Output as JSON
```

### lc user get
```bash
lc user get <name-or-email> [--json]
```

## Projects

### lc project list
```bash
lc project list [options]
  -t, --team <name>           Filter by team
  -s, --state <name>          Filter by state
  -q, --query <text>          Search projects
  --limit <number>            Number of projects
  --include-archived          Include archived projects
  --json                      Output as JSON
```

### lc project get
```bash
lc project get <name-or-id> [--json]
```

### lc project create
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

### lc project update
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

### lc label list
```bash
lc label list [options]
  -t, --team <name>           Filter by team
  --limit <number>            Number of labels
  --json                      Output as JSON
```

### lc label create
```bash
lc label create [options]
  -n, --name <text>           Label name (required)
  -c, --color <hex>           Color in hex format (required)
  -d, --description <text>    Description
  -t, --team <name>           Team (optional, workspace label if not specified)
```

## Workflow States

### lc status list
```bash
lc status list --team <name> [--json]
```

### lc status get
```bash
lc status get <name-or-id> --team <name> [--json]
```

## Cycles

### lc cycle list
```bash
lc cycle list --team <name> [options]
  --type <type>               Type (current, previous, next, all)
  --limit <number>            Number of cycles
  --json                      Output as JSON
```

## Documents

### lc document list
```bash
lc document list [options]
  -q, --query <text>          Search documents
  --project <id>              Filter by project
  --creator <id>              Filter by creator
  --limit <number>            Number of documents
  --include-archived          Include archived documents
  --json                      Output as JSON
```

### lc document get
```bash
lc document get <id-or-slug> [--json]
```

## Rules

### lc rule add
```bash
lc rule add <path>            Copy Linear CLI guide to project
```

## Other Commands

### lc init
```bash
lc init                       Configure API key
```

### lc doctor
```bash
lc doctor                     Check configuration
```

### lc version
```bash
lc version                    Show version
```

### lc help
```bash
lc --help                     Show help
lc <command> --help          Show command help
```