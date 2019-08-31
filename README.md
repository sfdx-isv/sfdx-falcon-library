# sfdx-falcon-library
Lerna-based monorepo containing the SFDX-Falcon Library, a framework for building beautiful, engaging plugins for the Salesforce CLI


# Monorepo Cheat Sheet
List of the most common commands used to managed this monorepo. Unless otherwise indicated, all of these commands should be executed from the repository's root directory.

### `lerna bootstrap`
???

### `yarn add <dependency> --dev -W`
Adds a common dev dependency to the entire workspace. Dependencies added in this way are available to all packages in the workspace.

### `yarn add <dependency>`
Adds a dependency to the package that the command is called inside of.

### `lerna run build`
Builds all packages in the workspace by having Lerna execute `yarn run build` against each package.

### `./build`
Equivalent to `lerna run build`.

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