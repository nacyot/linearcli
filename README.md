linearcli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/linearcli.svg)](https://npmjs.org/package/linearcli)
[![Downloads/week](https://img.shields.io/npm/dw/linearcli.svg)](https://npmjs.org/package/linearcli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g linearcli
$ lc COMMAND
running command...
$ lc (--version)
linearcli/0.1.0 darwin-arm64 node-v22.18.0
$ lc --help [COMMAND]
USAGE
  $ lc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lc comment add ISSUE`](#lc-comment-add-issue)
* [`lc comment list ISSUE`](#lc-comment-list-issue)
* [`lc cycle list`](#lc-cycle-list)
* [`lc doctor`](#lc-doctor)
* [`lc help [COMMAND]`](#lc-help-command)
* [`lc init`](#lc-init)
* [`lc issue create`](#lc-issue-create)
* [`lc issue get ID`](#lc-issue-get-id)
* [`lc issue list`](#lc-issue-list)
* [`lc issue mine`](#lc-issue-mine)
* [`lc issue update ID`](#lc-issue-update-id)
* [`lc label list`](#lc-label-list)
* [`lc plugins`](#lc-plugins)
* [`lc plugins add PLUGIN`](#lc-plugins-add-plugin)
* [`lc plugins:inspect PLUGIN...`](#lc-pluginsinspect-plugin)
* [`lc plugins install PLUGIN`](#lc-plugins-install-plugin)
* [`lc plugins link PATH`](#lc-plugins-link-path)
* [`lc plugins remove [PLUGIN]`](#lc-plugins-remove-plugin)
* [`lc plugins reset`](#lc-plugins-reset)
* [`lc plugins uninstall [PLUGIN]`](#lc-plugins-uninstall-plugin)
* [`lc plugins unlink [PLUGIN]`](#lc-plugins-unlink-plugin)
* [`lc plugins update`](#lc-plugins-update)
* [`lc project create`](#lc-project-create)
* [`lc project get IDENTIFIER`](#lc-project-get-identifier)
* [`lc project list`](#lc-project-list)
* [`lc project update IDENTIFIER`](#lc-project-update-identifier)
* [`lc status list`](#lc-status-list)
* [`lc team get IDENTIFIER`](#lc-team-get-identifier)
* [`lc team list`](#lc-team-list)
* [`lc user get IDENTIFIER`](#lc-user-get-identifier)
* [`lc user list`](#lc-user-list)

## `lc comment add ISSUE`

Add a comment to a Linear issue

```
USAGE
  $ lc comment add ISSUE -b <value> [-p <value>]

ARGUMENTS
  ISSUE  Issue ID (e.g., ENG-123)

FLAGS
  -b, --body=<value>    (required) Comment body (markdown supported)
  -p, --parent=<value>  Parent comment ID (for replies)

DESCRIPTION
  Add a comment to a Linear issue

EXAMPLES
  $ lc comment add ENG-123 --body "This is a comment"

  $ lc comment add ENG-123 --body "This is a reply" --parent comment-id
```

_See code: [src/commands/comment/add.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/comment/add.ts)_

## `lc comment list ISSUE`

List comments on a Linear issue

```
USAGE
  $ lc comment list ISSUE [--json]

ARGUMENTS
  ISSUE  Issue ID (e.g., ENG-123)

FLAGS
  --json  Output as JSON

DESCRIPTION
  List comments on a Linear issue

EXAMPLES
  $ lc comment list ENG-123

  $ lc comment list ENG-123 --json
```

_See code: [src/commands/comment/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/comment/list.ts)_

## `lc cycle list`

List cycles for a team

```
USAGE
  $ lc cycle list -t <value> [--json] [-n <value>] [--type current|previous|next|all]

FLAGS
  -n, --limit=<value>  [default: 50] Number of cycles to fetch
  -t, --team=<value>   (required) Team key or name (required)
      --json           Output as JSON
      --type=<option>  [default: all] Cycle type (current, previous, next, all)
                       <options: current|previous|next|all>

DESCRIPTION
  List cycles for a team

EXAMPLES
  $ lc cycle list --team ENG

  $ lc cycle list --team ENG --type current

  $ lc cycle list --team Engineering --json
```

_See code: [src/commands/cycle/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/cycle/list.ts)_

## `lc doctor`

Check Linear CLI configuration and connection

```
USAGE
  $ lc doctor

DESCRIPTION
  Check Linear CLI configuration and connection

EXAMPLES
  $ lc doctor
```

_See code: [src/commands/doctor.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/doctor.ts)_

## `lc help [COMMAND]`

Display help for lc.

```
USAGE
  $ lc help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for lc.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `lc init`

Initialize Linear CLI with your API key

```
USAGE
  $ lc init [-k <value>]

FLAGS
  -k, --api-key=<value>  Linear API key

DESCRIPTION
  Initialize Linear CLI with your API key

EXAMPLES
  $ lc init

  $ lc init --api-key lin_api_xxx
```

_See code: [src/commands/init.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/init.ts)_

## `lc issue create`

Create a new Linear issue

```
USAGE
  $ lc issue create --team <value> -t <value> [-a <value>] [-c <value>] [-d <value>] [--due-date <value>] [-l
    <value>] [--parent <value>] [-p <value>] [--project <value>] [-s <value>]

FLAGS
  -a, --assignee=<value>     Assignee name or ID
  -c, --cycle=<value>        Cycle name or ID
  -d, --description=<value>  Issue description (markdown supported)
  -l, --labels=<value>       Comma-separated label names or IDs
  -p, --priority=<value>     Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
  -s, --state=<value>        State name or ID
  -t, --title=<value>        (required) Issue title
      --due-date=<value>     Due date (YYYY-MM-DD)
      --parent=<value>       Parent issue ID
      --project=<value>      Project name or ID
      --team=<value>         (required) Team name, key, or ID

DESCRIPTION
  Create a new Linear issue

EXAMPLES
  $ lc issue create --title "Fix login bug" --team Engineering

  $ lc issue create --title "New feature" --team ENG --description "Add dark mode" --assignee "John Doe"

  $ lc issue create --title "Bug" --team ENG --labels "bug,high" --priority 2
```

_See code: [src/commands/issue/create.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/issue/create.ts)_

## `lc issue get ID`

Get details of a Linear issue

```
USAGE
  $ lc issue get ID [--json]

ARGUMENTS
  ID  Issue ID (e.g., ENG-123)

FLAGS
  --json  Output as JSON

DESCRIPTION
  Get details of a Linear issue

EXAMPLES
  $ lc issue get ENG-123
```

_See code: [src/commands/issue/get.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/issue/get.ts)_

## `lc issue list`

List Linear issues

```
USAGE
  $ lc issue list [-a <value>] [-c <value>] [--include-archived] [--json] [-l <value>] [--limit <value>]
    [--order-by createdAt|updatedAt] [-p <value>] [-s <value>] [-t <value>]

FLAGS
  -a, --assignee=<value>   Filter by assignee name or ID
  -c, --cycle=<value>      Filter by cycle name or ID
  -l, --label=<value>      Filter by label name or ID
  -p, --project=<value>    Filter by project name or ID
  -s, --state=<value>      Filter by state name or ID
  -t, --team=<value>       Filter by team name or ID
      --include-archived   Include archived issues
      --json               Output as JSON
      --limit=<value>      [default: 50] Number of issues to fetch (max 250)
      --order-by=<option>  [default: updatedAt] Order by field
                           <options: createdAt|updatedAt>

DESCRIPTION
  List Linear issues

EXAMPLES
  $ lc issue list

  $ lc issue list --team Engineering

  $ lc issue list --assignee "John Doe"

  $ lc issue list --state "In Progress"

  $ lc issue list --limit 100
```

_See code: [src/commands/issue/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/issue/list.ts)_

## `lc issue mine`

List issues assigned to you

```
USAGE
  $ lc issue mine [--include-archived] [--json] [-n <value>] [-s <value>]

FLAGS
  -n, --limit=<value>     [default: 50] Number of issues to fetch
  -s, --state=<value>     Filter by state name
      --include-archived  Include archived issues
      --json              Output as JSON

DESCRIPTION
  List issues assigned to you

EXAMPLES
  $ lc issue mine

  $ lc issue mine --state "In Progress"

  $ lc issue mine --json
```

_See code: [src/commands/issue/mine.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/issue/mine.ts)_

## `lc issue update ID`

Update an existing Linear issue

```
USAGE
  $ lc issue update ID [-a <value>] [-c <value>] [-d <value>] [--due-date <value>] [-e <value>] [-l <value>]
    [--parent <value>] [-p <value>] [--project <value>] [-s <value>] [-t <value>]

ARGUMENTS
  ID  Issue ID (e.g., ENG-123)

FLAGS
  -a, --assignee=<value>     Assignee name or ID
  -c, --cycle=<value>        Cycle name or ID
  -d, --description=<value>  Issue description (markdown supported)
  -e, --estimate=<value>     Estimate value
  -l, --labels=<value>       Comma-separated label names or IDs
  -p, --priority=<value>     Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)
  -s, --state=<value>        State name or ID
  -t, --title=<value>        Issue title
      --due-date=<value>     Due date (YYYY-MM-DD)
      --parent=<value>       Parent issue ID
      --project=<value>      Project name or ID

DESCRIPTION
  Update an existing Linear issue

EXAMPLES
  $ lc issue update ENG-123 --title "Updated title"

  $ lc issue update ENG-123 --state Done --assignee "John Doe"

  $ lc issue update ENG-123 --priority 1 --labels "bug,urgent"
```

_See code: [src/commands/issue/update.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/issue/update.ts)_

## `lc label list`

List issue labels in your Linear workspace

```
USAGE
  $ lc label list [--json] [-n <value>] [-t <value>]

FLAGS
  -n, --limit=<value>  [default: 50] Number of labels to fetch
  -t, --team=<value>   Filter labels by team
      --json           Output as JSON

DESCRIPTION
  List issue labels in your Linear workspace

EXAMPLES
  $ lc label list

  $ lc label list --team ENG

  $ lc label list --json
```

_See code: [src/commands/label/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/label/list.ts)_

## `lc plugins`

List installed plugins.

```
USAGE
  $ lc plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ lc plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/index.ts)_

## `lc plugins add PLUGIN`

Installs a plugin into lc.

```
USAGE
  $ lc plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into lc.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the LC_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the LC_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ lc plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ lc plugins add myplugin

  Install a plugin from a github url.

    $ lc plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ lc plugins add someuser/someplugin
```

## `lc plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ lc plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ lc plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/inspect.ts)_

## `lc plugins install PLUGIN`

Installs a plugin into lc.

```
USAGE
  $ lc plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into lc.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the LC_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the LC_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ lc plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ lc plugins install myplugin

  Install a plugin from a github url.

    $ lc plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ lc plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/install.ts)_

## `lc plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ lc plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ lc plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/link.ts)_

## `lc plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ lc plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lc plugins unlink
  $ lc plugins remove

EXAMPLES
  $ lc plugins remove myplugin
```

## `lc plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ lc plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/reset.ts)_

## `lc plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ lc plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lc plugins unlink
  $ lc plugins remove

EXAMPLES
  $ lc plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/uninstall.ts)_

## `lc plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ lc plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lc plugins unlink
  $ lc plugins remove

EXAMPLES
  $ lc plugins unlink myplugin
```

## `lc plugins update`

Update installed plugins.

```
USAGE
  $ lc plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/update.ts)_

## `lc project create`

Create a new project

```
USAGE
  $ lc project create -n <value> -t <value> [-d <value>] [--json] [--lead <value>] [--start-date <value>] [-s
    planned|started|completed|canceled] [--target-date <value>]

FLAGS
  -d, --description=<value>  Project description
  -n, --name=<value>         (required) Project name
  -s, --state=<option>       Project state (planned, started, completed, canceled)
                             <options: planned|started|completed|canceled>
  -t, --team=<value>         (required) Team key or name
      --json                 Output as JSON
      --lead=<value>         Lead user (name, email, or ID)
      --start-date=<value>   Start date (ISO format or YYYY-MM-DD)
      --target-date=<value>  Target date (ISO format or YYYY-MM-DD)

DESCRIPTION
  Create a new project

EXAMPLES
  $ lc project create --name "Q2 Planning" --team ENG

  $ lc project create --name "Product Launch" --team ENG --description "New product launch planning" --state planned
```

_See code: [src/commands/project/create.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/project/create.ts)_

## `lc project get IDENTIFIER`

Get details of a specific project

```
USAGE
  $ lc project get IDENTIFIER [--json]

ARGUMENTS
  IDENTIFIER  Project ID or name

FLAGS
  --json  Output as JSON

DESCRIPTION
  Get details of a specific project

EXAMPLES
  $ lc project get "Q1 Goals"

  $ lc project get project-uuid
```

_See code: [src/commands/project/get.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/project/get.ts)_

## `lc project list`

List projects in your Linear workspace

```
USAGE
  $ lc project list [--include-archived] [--json] [-n <value>] [-q <value>] [-s <value>] [-t <value>]

FLAGS
  -n, --limit=<value>     [default: 50] Number of projects to fetch
  -q, --query=<value>     Search projects by name
  -s, --state=<value>     Filter by state (planned, started, completed, canceled)
  -t, --team=<value>      Filter by team key or name
      --include-archived  Include archived projects
      --json              Output as JSON

DESCRIPTION
  List projects in your Linear workspace

EXAMPLES
  $ lc project list

  $ lc project list --team ENG

  $ lc project list --state started

  $ lc project list --json
```

_See code: [src/commands/project/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/project/list.ts)_

## `lc project update IDENTIFIER`

Update an existing project

```
USAGE
  $ lc project update IDENTIFIER [-d <value>] [--json] [--lead <value>] [-n <value>] [--start-date <value>] [-s
    planned|started|completed|canceled] [--target-date <value>]

ARGUMENTS
  IDENTIFIER  Project ID or name

FLAGS
  -d, --description=<value>  Project description
  -n, --name=<value>         Project name
  -s, --state=<option>       Project state (planned, started, completed, canceled)
                             <options: planned|started|completed|canceled>
      --json                 Output as JSON
      --lead=<value>         Lead user (name, email, or ID)
      --start-date=<value>   Start date (ISO format or YYYY-MM-DD)
      --target-date=<value>  Target date (ISO format or YYYY-MM-DD)

DESCRIPTION
  Update an existing project

EXAMPLES
  $ lc project update "Q1 Goals" --state completed

  $ lc project update project-uuid --name "Updated Name" --description "New description"
```

_See code: [src/commands/project/update.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/project/update.ts)_

## `lc status list`

List workflow states for a team

```
USAGE
  $ lc status list -t <value> [--json]

FLAGS
  -t, --team=<value>  (required) Team key or name (required)
      --json          Output as JSON

DESCRIPTION
  List workflow states for a team

EXAMPLES
  $ lc status list --team ENG

  $ lc status list --team Engineering --json
```

_See code: [src/commands/status/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/status/list.ts)_

## `lc team get IDENTIFIER`

Get details of a specific team

```
USAGE
  $ lc team get IDENTIFIER [--json]

ARGUMENTS
  IDENTIFIER  Team key, ID, or name

FLAGS
  --json  Output as JSON

DESCRIPTION
  Get details of a specific team

EXAMPLES
  $ lc team get ENG

  $ lc team get team-uuid

  $ lc team get Engineering
```

_See code: [src/commands/team/get.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/team/get.ts)_

## `lc team list`

List all teams in your Linear workspace

```
USAGE
  $ lc team list [--include-archived] [--json] [-n <value>] [-q <value>]

FLAGS
  -n, --limit=<value>     [default: 50] Number of teams to fetch
  -q, --query=<value>     Search teams by name
      --include-archived  Include archived teams
      --json              Output as JSON

DESCRIPTION
  List all teams in your Linear workspace

EXAMPLES
  $ lc team list

  $ lc team list --query "eng"

  $ lc team list --json
```

_See code: [src/commands/team/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/team/list.ts)_

## `lc user get IDENTIFIER`

Get details of a specific user

```
USAGE
  $ lc user get IDENTIFIER [--json]

ARGUMENTS
  IDENTIFIER  User email, ID, name, or "me" for current user

FLAGS
  --json  Output as JSON

DESCRIPTION
  Get details of a specific user

EXAMPLES
  $ lc user get john@example.com

  $ lc user get user-uuid

  $ lc user get me
```

_See code: [src/commands/user/get.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/user/get.ts)_

## `lc user list`

List users in your Linear workspace

```
USAGE
  $ lc user list [--active] [--include-archived] [--json] [-n <value>] [-q <value>]

FLAGS
  -n, --limit=<value>     [default: 50] Number of users to fetch
  -q, --query=<value>     Search users by name or email
      --active            Show only active users
      --include-archived  Include archived users
      --json              Output as JSON

DESCRIPTION
  List users in your Linear workspace

EXAMPLES
  $ lc user list

  $ lc user list --query "john"

  $ lc user list --active

  $ lc user list --json
```

_See code: [src/commands/user/list.ts](https://github.com/linearcli/linearcli/blob/v0.1.0/src/commands/user/list.ts)_
<!-- commandsstop -->
