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
$ linearcli COMMAND
running command...
$ linearcli (--version)
linearcli/0.0.0 darwin-arm64 node-v22.18.0
$ linearcli --help [COMMAND]
USAGE
  $ linearcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`linearcli hello PERSON`](#linearcli-hello-person)
* [`linearcli hello world`](#linearcli-hello-world)
* [`linearcli help [COMMAND]`](#linearcli-help-command)
* [`linearcli plugins`](#linearcli-plugins)
* [`linearcli plugins add PLUGIN`](#linearcli-plugins-add-plugin)
* [`linearcli plugins:inspect PLUGIN...`](#linearcli-pluginsinspect-plugin)
* [`linearcli plugins install PLUGIN`](#linearcli-plugins-install-plugin)
* [`linearcli plugins link PATH`](#linearcli-plugins-link-path)
* [`linearcli plugins remove [PLUGIN]`](#linearcli-plugins-remove-plugin)
* [`linearcli plugins reset`](#linearcli-plugins-reset)
* [`linearcli plugins uninstall [PLUGIN]`](#linearcli-plugins-uninstall-plugin)
* [`linearcli plugins unlink [PLUGIN]`](#linearcli-plugins-unlink-plugin)
* [`linearcli plugins update`](#linearcli-plugins-update)

## `linearcli hello PERSON`

Say hello

```
USAGE
  $ linearcli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ linearcli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/linearcli/linearcli/blob/v0.0.0/src/commands/hello/index.ts)_

## `linearcli hello world`

Say hello world

```
USAGE
  $ linearcli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ linearcli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/linearcli/linearcli/blob/v0.0.0/src/commands/hello/world.ts)_

## `linearcli help [COMMAND]`

Display help for linearcli.

```
USAGE
  $ linearcli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for linearcli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `linearcli plugins`

List installed plugins.

```
USAGE
  $ linearcli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ linearcli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/index.ts)_

## `linearcli plugins add PLUGIN`

Installs a plugin into linearcli.

```
USAGE
  $ linearcli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into linearcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the LINEARCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the LINEARCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ linearcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ linearcli plugins add myplugin

  Install a plugin from a github url.

    $ linearcli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ linearcli plugins add someuser/someplugin
```

## `linearcli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ linearcli plugins inspect PLUGIN...

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
  $ linearcli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/inspect.ts)_

## `linearcli plugins install PLUGIN`

Installs a plugin into linearcli.

```
USAGE
  $ linearcli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

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
  Installs a plugin into linearcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the LINEARCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the LINEARCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ linearcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ linearcli plugins install myplugin

  Install a plugin from a github url.

    $ linearcli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ linearcli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/install.ts)_

## `linearcli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ linearcli plugins link PATH [-h] [--install] [-v]

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
  $ linearcli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/link.ts)_

## `linearcli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ linearcli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linearcli plugins unlink
  $ linearcli plugins remove

EXAMPLES
  $ linearcli plugins remove myplugin
```

## `linearcli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ linearcli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/reset.ts)_

## `linearcli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ linearcli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linearcli plugins unlink
  $ linearcli plugins remove

EXAMPLES
  $ linearcli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/uninstall.ts)_

## `linearcli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ linearcli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ linearcli plugins unlink
  $ linearcli plugins remove

EXAMPLES
  $ linearcli plugins unlink myplugin
```

## `linearcli plugins update`

Update installed plugins.

```
USAGE
  $ linearcli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/update.ts)_
<!-- commandsstop -->
