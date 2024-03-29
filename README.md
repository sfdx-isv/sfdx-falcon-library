# sfdx-falcon-library
Lerna-based monorepo containing the SFDX-Falcon Library, a framework for building beautiful, engaging plugins for the Salesforce CLI

# Managing this Monorepo with Lerna and Yarn
There are two critical third-party tools used to manage this monorepo.  [Lerna](https://lerna.js.org/) and [Yarn](https://yarnpkg.com/en/).

### Yarn
This project uses [Yarn Workspaces](https://yarnpkg.com/en/docs/workspaces) to manage local inter-package dependencies.  Yarn handles the addition, removal, installation, and upgrading of package dependencies within the workspace.

### Lerna
This project uses Lerna to coordinate the publishing of packages to the [`@sfdx-falcon`]() scope at [npmjs.com](https://www.npmjs.com).

Because all SFDX-Falcon Library packages are published as part of the `@sfdx-falcon` scope, each package must add the following key to its `package.json` file.

```json
"publishConfig": {
  "access": "public"
}
```
For more about per-package configuration options, see the [Lerna Documentation](https://github.com/lerna/lerna/tree/master/commands/publish#per-package-configuration).

# Monorepo Cheat Sheet
List of the most common commands used to managed this monorepo. Unless otherwise indicated, all of these commands should be executed from the repository's root directory.

### `yarn install`
When run at the root of the workspace installs all dependencies of all packages within the workspace and links any cross-dependencies.

### `yarn add <dependency> [--dev] -W`
Adds a common dependency to the entire workspace. Dependencies added in this way are available to all packages in the workspace.  Use the `--dev` flag to add as a dev dependency.

### `yarn add <dependency>`
Adds a dependency to the package that the command is called inside of.

### `yarn workspaces info [--json]`
Displays the workspace-specific dependency tree of this project. Can detect if any of the intra-workspace dependencies are mismatched (ie. one package depends on a version of a workspace sibling other than what's currently expressed in that sibling's `package.json` file.)

### `yarn workspaces run <command> [flags]`
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

### `COMMAND+SHIFT+P --> "Restart TS Server"`
After building a package, VS Code's built in TypeScript linter can show false errors. This can be fixed by restarting the TS Server from inside the affected `.ts` source file.

### `npm whoami`
Prints the username that's currently logged into the NPM registry. This is the user who will be used during the `lerna publish` operation.

### `lerna version --force-publish --exact`
Modifies the version of all packages in the repository, using an exaxt version number wherever inter-package references are kept. This means that inter-package references would go from version `1.0.0` to `1.0.1`, instead of to `^1.0.1`.

### `lerna publish from-package`
Publishes all workspace packages to NPM. Determines the list of packages to publish by inspecting each `package.json` and checking if that package version is present in the registry. Any versions not present in the registry will be published. This is useful when a previous lerna publish failed to publish all packages to the registry.

When publishing, Lerna executes specific [npm lifecycle scripts](https://docs.npmjs.com/misc/scripts#description) in the following order:

#### Pre Publish
*In root package:*
- `prepublish`
- `prepare`
- `prepublishOnly`
- `prepack`

*In each subpackage:*
- `prepublish`
- `prepare`
- `prepublishOnly`
- `prepack`

#### Packing each subpackage

*In each subpackage:*
- `postpack`

#### After all subpackages packed

*In root package:*
- `postpack`

#### Publishing each subpackage

*In each subpackage:*
- `publish`
- `postpublish`

#### After all subpackages published

*In root package:*
- `publish`
- `postpublish`

# Upating Project Dependencies

There are three types of dependencies that will need to be updated over time.

* System-wide dependencies like NVM, Node.js, NPM, and Yarn
* Repository-wide dependencies that are defined in `package.json` at the project directory root
* Package-specific dependencies that are defined in the `package.json` found inside of each directory located in the `packages` directory

## Updating System-Wide Dependencies

#### Update NVM (Node Version Manager)
Update NVM using the command below. For the most up-to-date version number, see the "Installing and Updating" instrcutions at https://github.com/nvm-sh/nvm.
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

#### Update Node.js Using NVM
Once NVM is installed/updated, use this command to get the latest stable version of Node.js:
```
nvm install stable
```

#### Update NPM (Node Package Manager)
To upgrade NPM use the following command:
```
npm install -g npm@latest
```

#### Update Yarn Using Homebrew

Update Yarn by running this command (assuming you followed best practices and installed Yarn using Homebrew).
```
brew update yarn
```

## Updating Repository-Wide Dependencies

Stuff

## Updating Package-Specific Dependencies

1. Make sure there a no unstaged files or outstanding commits in your project.
2. Open `DEPENDENCIES.MD` in VS Code and scroll down to the "External Dependencies" section.
3. Highlight the dependency and version number you want to update, including the left-most and right-most double quotes, eg. `"@oclif/command": "1.7.0"`.
4. Perform a find/replace in all files using the desired version number.
5. Repeat steps 3 and 4 for each dependency being updated.
6. Inspect all unstaged files to ensure everything was updated as expected.
7. Run `./install` at the root of the repository. This will update the dependencies in each workspace.
8. Run `./build` at the root of the repository. This will rebuild all package using the new dependencies.