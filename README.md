# Linear CLI

A powerful command-line interface for [Linear](https://linear.app), designed for developers who prefer working in the terminal.

## Installation

```bash
# Quick run with npx
npx linearcli --help

# Or install globally
npm install -g linearcli
```

## Setup

Initialize with your Linear API key (get one from [Linear Settings](https://linear.app/settings/api)):

```bash
lc init
# Enter your API key when prompted
```

## Usage

### Issues

```bash
# List issues
lc issue list --team ENG --limit 10

# Get issue details
lc issue get ENG-123

# Create issue
lc issue create --title "Fix bug" --team ENG --assignee "John Doe"

# Update issue
lc issue update ENG-123 --state "In Progress" --priority 2

# List my issues
lc issue mine --state "In Progress"
```

### Projects

```bash
# List projects
lc project list --team ENG

# Create project
lc project create --name "Q1 Goals" --team ENG
```

### Teams & Users

```bash
# List teams
lc team list

# List users
lc user list --query "john"
```

### Comments

```bash
# Add comment
lc comment add ENG-123 --body "Fixed in PR #456"

# List comments
lc comment list ENG-123
```

## Output Formats

All commands support both human-readable (default) and JSON output:

```bash
# Human-readable table format (default)
lc issue list --team ENG

# JSON format for scripting
lc issue list --team ENG --json | jq '.[].title'
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Release new version
mise release [major|minor|patch]
```

## License

MIT