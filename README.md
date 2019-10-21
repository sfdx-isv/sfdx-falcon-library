# sfdx-falcon-library
Lerna-based monorepo containing the SFDX-Falcon Library, a framework for building beautiful, engaging plugins for the Salesforce CLI

# Managing this Monorepo with Lerna and Yarn
There are two critical third-party tools used to manage this monorepo.  [Lerna](https://lerna.js.org/) and [Yarn](https://yarnpkg.com/en/).

### Yarn
This project uses [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) to manage local inter-package dependencies.  Yarn handles the addition, removal, installation, and upgrading of package dependencies within the workspace.

### Lerna
This project uses Lerna to coordinate the publishing of packages to the [`@sfdx-falcon`]() scope at [npmjs.com](https://www.npmjs.com).

# Monorepo Cheat Sheet
List of the most common commands used to managed this monorepo. Unless otherwise indicated, all of these commands should be executed from the repository's root directory.

### `yarn install`
When run at the root of the workspace installs all dependencies of all packages within the workspace and links any cross-dependencies.

### `yarn add <dependency> [--dev] -W`
Adds a common dependency to the entire workspace. Dependencies added in this way are available to all packages in the workspace.  Use the `--dev` flag to add as a dev dependency.

### `yarn add <dependency>`
Adds a dependency to the package that the command is called inside of.

### `yarn workspaces info [--json]
Displays the workspace-specific dependency tree of this project. Can detect if any of the intra-workspace dependencies are mismatched (ie. one package depends on a version of a workspace sibling other than what's currently expressed in that sibling's `package.json` file.)

### `yarn workspaces run <command> [flags]
Runs the specified Yarn command inside each package in the workspace.  Any specified flags will be passed forward by each command invocation.

### `yarn workspaces run build`
Builds all packages in the workspace by executing `yarn run build` against each package.

### `./build`
Equivalent to `yarn workspaces run build`.

### `./build <package-name>`
Builds a single package, as specified by the `package-name` passed as an argument to the command.

### `./install`
Equivalent to `yarn install`.

### `./install <package-name>`
Installs the dependencies for a single package, as specified by the `package-name` passed as an argument to the command.

### `COMMAND+SHIFT+P --> "Restart TS Server`
After building a package, VS Code's built in TypeScript linter can show false errors. This can be fixed by restarting the TS Server from inside the affected `.ts` source file.

### `npm whoami`
Prints the username that's currently logged into the NPM registry. This is the user who will be used during the `lerna publish` operation.

### `lerna publish`


# Project Notes
General notes about the project

### Dependency Order
SFDX-Falcon packages are dependent upon one another in the following order.

1. `@sfdx-falcon/types`
2. `@sfdx-falcon/debug`
3. `@sfdx-falcon/error`
4. `@sfdx-falcon/validator`
5. `@sfdx-falcon/status`
6. Independent Siblings
    * `@sfdx-falcon/builder`
    * `@sfdx-falcon/util`
7. Independent Siblings
    * `@sfdx-falcon/command`
    * `@sfdx-falcon/prompt`
    * `@sfdx-falcon/task`
8. `@sfdx-falcon/environment`
9. Independent Siblings
    * `@sfdx-falcon/interview`
    * `@sfdx-falcon/task-bundle`
10. `@sfdx-falcon/builder-library`
11. `@sfdx-falcon/generator`

