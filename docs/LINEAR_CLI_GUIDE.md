# Linear CLI User Guide

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Command Reference](#command-reference)
  - [Issues](#issues)
  - [Comments](#comments)
  - [Teams](#teams)
  - [Users](#users)
  - [Projects](#projects)
  - [Labels](#labels)
  - [Workflow States](#workflow-states)
  - [Cycles](#cycles)
- [Output Formats](#output-formats)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Overview

Linear CLI (`lc`) is a comprehensive command-line interface for Linear, designed to provide developers with fast, efficient access to Linear's features directly from the terminal. Built with TypeScript and the oclif framework, it offers GitHub CLI-style commands with human-readable output by default.

### Key Features
- **Non-interactive Commands**: All operations are non-interactive by design
- **Human-Readable Output**: Beautiful table formatting with proper Unicode support
- **JSON Support**: Optional JSON output for scripting and automation
- **Smart Resolution**: Automatic name-to-ID resolution for teams, users, projects, etc.
- **Comprehensive Coverage**: Full support for issues, comments, teams, projects, and more

## Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Install from npm
```bash
# Install globally
npm install -g linearctl

# Or use with npx
npx linearctl --help
```

### Install from Source
```bash
git clone https://github.com/nacyot/linearctl.git
cd linearctl
npm install
npm run build
npm link
```

### Verify Installation
```bash
lc --version
lc --help
```

## Configuration

### Initial Setup
Initialize Linear CLI with your API key:
```bash
lc init
```

You'll be prompted to enter your Linear API key. Get one from:
https://linear.app/settings/api

### Configuration File
The API key is stored in `~/.linearctl/config.json`:
```json
{
  "apiKey": "lin_api_..."
}
```

### Health Check
Verify your configuration and connection:
```bash
lc doctor
```

## Command Reference

### Issues

#### List Issues
```bash
# List all issues
lc issue list

# Filter by team
lc issue list --team ENG

# Filter by assignee
lc issue list --assignee "John Doe"

# Filter by state
lc issue list --state "In Progress"

# Combine filters
lc issue list --team ENG --state "In Progress" --limit 20

# JSON output
lc issue list --json
```

**Options:**
- `-t, --team <name>`: Filter by team name or ID
- `-a, --assignee <name>`: Filter by assignee name or ID
- `-s, --state <name>`: Filter by state name or ID
- `-l, --label <name>`: Filter by label name or ID
- `-p, --project <name>`: Filter by project name or ID
- `-c, --cycle <name>`: Filter by cycle name or ID
- `--limit <number>`: Number of issues to fetch (max 250)
- `--include-archived`: Include archived issues
- `--order-by <field>`: Order by field (createdAt, updatedAt)
- `--json`: Output as JSON

#### Get Issue Details
```bash
# Get issue by ID
lc issue get ENG-123

# JSON output
lc issue get ENG-123 --json
```

#### Create Issue
```bash
# Basic issue creation
lc issue create --title "Bug fix" --team ENG

# Full issue creation
lc issue create \
  --title "Implement new feature" \
  --team ENG \
  --description "Detailed description with **markdown**" \
  --assignee "John Doe" \
  --priority 2 \
  --labels "bug,urgent" \
  --due-date "2025-12-31" \
  --project "Q4 Goals" \
  --cycle "Sprint 23" \
  --delegate "reviewer@example.com" \
  --links "ENG-100,ENG-101"
```

**Options:**
- `-t, --title <text>`: Issue title (required)
- `--team <name>`: Team name, key, or ID (required)
- `-d, --description <text>`: Issue description (markdown supported)
- `-a, --assignee <name>`: Assignee name or ID
- `-s, --state <name>`: State name or ID
- `-p, --priority <0-4>`: Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
- `-l, --labels <names>`: Comma-separated label names or IDs
- `--due-date <YYYY-MM-DD>`: Due date
- `--project <name>`: Project name or ID
- `-c, --cycle <name>`: Cycle name or ID
- `--parent <id>`: Parent issue ID
- `--delegate <emails>`: Comma-separated delegate emails or names
- `--links <ids>`: Comma-separated issue IDs to link (e.g. ENG-123,ENG-124)

#### Update Issue

**Options:**
- `--title <text>`: Issue title
- `--description <text>`: Issue description (markdown supported)
- `-a, --assignee <name>`: Assignee name or ID (use "none" to clear)
- `-s, --state <name>`: State name or ID
- `-p, --priority <0-4>`: Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
- `-l, --labels <names>`: Comma-separated label names or IDs
- `--due-date <YYYY-MM-DD>`: Due date (use "none" to clear)
- `--project <name>`: Project name or ID
- `-c, --cycle <name>`: Cycle name or ID
- `--parent <id>`: Parent issue ID
- `-e, --estimate <number>`: Story points estimate
- `--delegate <emails>`: Comma-separated delegate emails (use "none" to clear)
- `--links <ids>`: Comma-separated issue IDs to link

```bash
# Update single field
lc issue update ENG-123 --state "In Progress"

# Update estimate (story points)
lc issue update ENG-123 --estimate 8

# Update multiple fields
lc issue update ENG-123 \
  --title "Updated title" \
  --assignee "Jane Doe" \
  --priority 1 \
  --state "In Review"

# Add estimate and delegates
lc issue update ENG-123 \
  --estimate 5 \
  --delegate "john@example.com,jane@example.com"

# Link to other issues
lc issue update ENG-123 --links "ENG-124,ENG-125"

# Remove assignee
lc issue update ENG-123 --assignee none

# Clear delegates
lc issue update ENG-123 --delegate none

# Clear due date
lc issue update ENG-123 --due-date none
```

#### List My Issues
```bash
# List issues assigned to you
lc issue mine

# Filter by state
lc issue mine --state "In Progress"

# Include archived
lc issue mine --include-archived

# Limit results
lc issue mine --limit 10
```

### Comments

#### List Comments
```bash
# List comments on an issue
lc comment list ENG-123

# JSON output
lc comment list ENG-123 --json
```

#### Add Comment
```bash
# Add a comment
lc comment add ENG-123 --body "This is a comment"

# Add comment with markdown
lc comment add ENG-123 --body "**Important:** Please review
- Item 1
- Item 2"

# Reply to a comment
lc comment add ENG-123 --body "Reply text" --parent <comment-id>
```

### Teams

#### List Teams
```bash
# List all teams
lc team list

# Search teams
lc team list --query "engineering"

# Include archived teams
lc team list --include-archived

# JSON output
lc team list --json
```

#### Get Team Details
```bash
# Get team by key
lc team get ENG

# Get team by name
lc team get "Engineering"

# JSON output
lc team get ENG --json
```

### Users

#### List Users
```bash
# List all users
lc user list

# Search users
lc user list --query "john"

# Include inactive users
lc user list --include-inactive

# JSON output
lc user list --json
```

#### Get User Details
```bash
# Get user by name
lc user get "John Doe"

# Get user by email
lc user get "john@example.com"

# JSON output
lc user get "John Doe" --json
```

### Projects

#### List Projects
```bash
# List all projects
lc project list

# Filter by team
lc project list --team ENG

# Filter by state
lc project list --state started

# Search projects
lc project list --query "Q4"

# Include archived
lc project list --include-archived
```

#### Get Project Details
```bash
# Get project by name or ID
lc project get "Q4 Goals"

# JSON output
lc project get "Q4 Goals" --json
```

#### Create Project
```bash
# Basic project creation
lc project create --name "New Project" --team ENG

# Full project creation
lc project create \
  --name "Q1 2026 Goals" \
  --team ENG \
  --description "Quarterly objectives" \
  --lead "John Doe" \
  --state planned \
  --start-date "2026-01-01" \
  --target-date "2026-03-31"
```

#### Update Project
```bash
# Update project fields
lc project update <project-id> \
  --name "Updated Name" \
  --state started \
  --lead "Jane Doe"
```

### Labels

#### List Labels
```bash
# List all labels
lc label list

# Filter by team
lc label list --team ENG

# Search labels
lc label list --name "bug"

# JSON output
lc label list --json
```

### Workflow States

#### List States
```bash
# List states for a team
lc status list --team ENG

# JSON output
lc status list --team ENG --json
```

### Cycles

#### List Cycles
```bash
# List all cycles for a team
lc cycle list --team ENG

# Get current cycle
lc cycle list --team ENG --type current

# Get previous cycle
lc cycle list --team ENG --type previous

# Get next/upcoming cycle
lc cycle list --team ENG --type next

# JSON output
lc cycle list --team ENG --json
```

## Output Formats

### Human-Readable Format (Default)

Linear CLI uses beautiful table formatting with:
- Proper Unicode and emoji support
- Colored output for better readability
- Automatic column width adjustment
- Korean/CJK character support

Example:
```
Found 5 issues:
ID       Title                          State        Assignee    
─────────────────────────────────────────────────────────────────
ENG-123  Fix login bug                  In Progress  John Doe    
ENG-124  Add dark mode                  Todo         Jane Smith  
ENG-125  Performance optimization       In Review    Bob Wilson  
```

### JSON Format

Use the `--json` flag for machine-readable output:
```bash
lc issue list --json | jq '.[].title'
lc issue get ENG-123 --json | jq '.state.name'
```

## Advanced Usage

### Shell Aliases

Add useful aliases to your shell configuration:
```bash
# ~/.bashrc or ~/.zshrc
alias lci="lc issue"
alias lcim="lc issue mine"
alias lcic="lc issue create"
alias lcil="lc issue list"
alias lct="lc team"
alias lcp="lc project"
```

### Scripting Examples

#### Create Multiple Issues from File
```bash
#!/bin/bash
while IFS=',' read -r title description assignee; do
  lc issue create \
    --title "$title" \
    --description "$description" \
    --assignee "$assignee" \
    --team ENG
done < issues.csv
```

#### Export Issues to CSV
```bash
lc issue list --team ENG --json | \
  jq -r '.[] | [.identifier, .title, .state.name, .assignee.name // "Unassigned"] | @csv' \
  > issues.csv
```

#### Daily Standup Report
```bash
#!/bin/bash
echo "=== My Issues ==="
echo "In Progress:"
lc issue mine --state "In Progress" --json | jq -r '.[].title'
echo ""
echo "Todo:"
lc issue mine --state "Todo" --json | jq -r '.[].title'
```

### Integration with Other Tools

#### fzf Integration
```bash
# Interactive issue picker
issue_id=$(lc issue list --team ENG --json | \
  jq -r '.[] | "\(.identifier) \(.title)"' | \
  fzf --preview 'lc issue get {1}' | \
  awk '{print $1}')
  
lc issue get "$issue_id"
```

#### Git Commit Integration
```bash
# Add Linear issue ID to commit message
git commit -m "$(lc issue get ENG-123 --json | jq -r '"[\(.identifier)] \(.title)"'): Your changes"
```

## Troubleshooting

### Common Issues

#### API Key Not Found
```
Error: No API key configured. Run "lc init" first.
```
**Solution:** Run `lc init` and enter your Linear API key.

#### Connection Issues
```
Error: Failed to connect to Linear API
```
**Solution:** 
1. Check your internet connection
2. Verify API key with `lc doctor`
3. Ensure Linear's API is accessible

#### Entity Not Found
```
Error: Entity not found: Issue - Could not find referenced Issue.
```
**Solution:** Verify the issue ID is correct and you have access to it.

#### Permission Denied
```
Error: You don't have permission to perform this action
```
**Solution:** Check your Linear workspace permissions for the resource.

### Debug Mode

Enable debug output with environment variables:
```bash
DEBUG=* lc issue list
NODE_ENV=development lc issue get ENG-123
```

### Getting Help

#### Command Help
```bash
# General help
lc --help

# Command-specific help
lc issue --help
lc issue create --help
```

#### Version Information
```bash
lc --version
```

## Best Practices

1. **Use Team Keys**: Use short team keys (e.g., `ENG`) instead of full names for faster typing
2. **Leverage JSON + jq**: Combine JSON output with jq for powerful data manipulation
3. **Set Defaults**: Create shell functions for common operations with default values
4. **Batch Operations**: Use shell loops for bulk operations instead of manual repetition
5. **Regular Updates**: Keep the CLI updated for latest features and bug fixes

## API Rate Limits

Linear API has rate limits. The CLI respects these limits but for bulk operations, consider:
- Adding delays between requests in scripts
- Using batch operations where available
- Caching results when appropriate

## Security

- API keys are stored locally in `~/.linearctl/config.json`
- Never commit your API key to version control
- Use environment variables for CI/CD: `LINEAR_API_KEY=xxx lc issue list`
- Regularly rotate your API keys

## Contributing

Contributions are welcome! Please see the project repository for:
- Contributing guidelines
- Development setup
- Testing procedures
- Code style guide

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: Report bugs on the GitHub repository
- **Documentation**: Check this guide and README.md
- **Linear API**: Refer to [Linear API Documentation](https://developers.linear.app)

---

*linearctl is not officially affiliated with Linear. It's a community tool built using Linear's public API.*