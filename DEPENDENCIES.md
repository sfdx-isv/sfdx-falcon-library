# SFDX-Falcon Library Package Dependencies

## Internal Dependencies
Many of the packages in the SFDX-Falcon Library are dependent on one another. Understanding the precedence of each is critical to avoid creating circular dependencies between packages at build-time.

Each package folder contains two key files that must be properly crafted and maintained: `package.json` and `tsconfig.build.json`.

Maintaining `package.json` is easy. If you need a dependency, just add it to the `dependencies` or `devDependencies` hash.  This is typically done by adding dependencies in alphabetical order.

Maintaining `tsconfig.build.json` is trickier. The array of `path` values in the `references` hash **must** be defined in the proper order with dependent packages always listed **after** any packages on which they depend.

To help ensure correct precedence, here is a list of SFDX-Falcon packages in order of dependence.

1.  Independent Siblings
      * `@sfdx-falcon/debug`
      * `@sfdx-falcon/types`
2.  `@sfdx-falcon/error`
3.  `@sfdx-falcon/validator`
4.  `@sfdx-falcon/status`
5.  Independent Siblings
      * `@sfdx-falcon/builder`
      * `@sfdx-falcon/command`
      * `@sfdx-falcon/util`
      * `@sfdx-falcon/worker`
6.  Independent Siblings
      * `@sfdx-falcon/prompt`
      * `@sfdx-falcon/task`
7.  `@sfdx-falcon/environment`
8.  Independent Siblings
      * `@sfdx-falcon/interview`
      * `@sfdx-falcon/task-bundle`
9.  `@sfdx-falcon/builder-library`
10. `@sfdx-falcon/generator`

## External Dependencies
Master list of all direct external dependencies used by packages in the SFDX-Falcon library.

| Dependency | License | Package | Code Repository |
| ---- | ---- | ---- | ---- |
| `"@oclif/command": "1.7.0"`                   | [MIT](https://github.com/oclif/command/blob/master/LICENSE)                               | [@oclif/command](https://www.npmjs.com/package/@oclif/command)                              | [GitHub](https://github.com/oclif/command) |
| `"@oclif/config": "1.16.0"`                   | [MIT](https://github.com/oclif/config/blob/master/LICENSE)                                | [@oclif/config](https://www.npmjs.com/package/@oclif/config)                                | [GitHub](https://github.com/oclif/config) |
| `"@oclif/dev-cli": "1.22.2"`                  | [MIT](https://github.com/oclif/dev-cli/blob/master/LICENSE)                               | [@oclif/dev-cli](https://www.npmjs.com/package/@oclif/dev-cli)                              | [GitHub](https://github.com/oclif/dev-cli) |
| `"@oclif/errors": "1.3.3"`                    | [MIT](https://github.com/oclif/errors/blob/master/LICENSE)                                | [@oclif/errors](https://www.npmjs.com/package/@oclif/errors)                                | [GitHub](https://github.com/oclif/errors) |
| `"@oclif/parser": "3.8.5"`                    | [MIT](https://github.com/oclif/parser/blob/master/LICENSE)                                | [@oclif/parser](https://www.npmjs.com/package/@oclif/parser)                                | [GitHub](https://github.com/oclif/parser) |
| `"@oclif/plugin-help": "3.1.0"`               | [MIT](https://github.com/oclif/plugin-help/blob/master/LICENSE)                           | [@oclif/plugin-help](https://www.npmjs.com/package/@oclif/plugin-help)                      | [GitHub](https://github.com/oclif/plugin-help) |
| `"@oclif/test": "1.2.6"`                      | [MIT](https://github.com/oclif/test/blob/master/LICENSE)                                  | [@oclif/test](https://www.npmjs.com/package/@oclif/test)                                    | [GitHub](https://github.com/oclif/test) |
| `"@salesforce/command": "3.0.1"`              | [BSD-3-Clause](https://github.com/forcedotcom/cli-packages/blob/master/LICENSE.txt)       | [@salesforce/command](https://www.npmjs.com/package/@salesforce/command)                    | [GitHub](https://github.com/forcedotcom/cli-packages) |
| `"@salesforce/core": "2.7.0"`                 | [BSD-3-Clause](https://github.com/forcedotcom/sfdx-core/blob/master/LICENSE.txt)          | [@salesforce/core](https://www.npmjs.com/package/@salesforce/core)                          | [GitHub](https://github.com/forcedotcom/sfdx-core) |
| `"@salesforce/dev-config": "1.6.0"`           | [BSD-3-Clause](https://github.com/forcedotcom/sfdx-dev-packages/blob/master/LICENSE.txt)  | [@salesforce/dev-config](https://www.npmjs.com/package/@salesforce/dev-config)              | [GitHub](https://github.com/forcedotcom/sfdx-dev-packages) |
| `"@salesforce/ts-types": "1.3.0"`             | [BSD-3-Clause](https://github.com/forcedotcom/sfdx-dev-packages/blob/master/LICENSE.txt)  | [@salesforce/ts-types](https://www.npmjs.com/package/@salesforce/ts-types)                  | [GitHub](https://github.com/forcedotcom/sfdx-dev-packages) |
| `"@types/chai": "4.2.11"`                      | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/chai](https://www.npmjs.com/package/@types/chai)                                    | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/fs-extra": "8.0.1"`                  | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/fs-extra](https://www.npmjs.com/package/@types/fs-extra)                            | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/inquirer": "6.5.0"`                  | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/inquirer](https://www.npmjs.com/package/@types/inquirer)                            | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/jsforce": "1.9.11"`                  | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/jsforce](https://www.npmjs.com/package/@types/jsforce)                              | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/json2csv": "4.5.0"`                  | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/json2csv](https://www.npmjs.com/package/@types/json2csv)                            | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/listr": "0.14.2"`                    | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/listr](https://www.npmjs.com/package/@types/listr)                                  | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/lodash": "4.14.144"`                 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/lodash](https://www.npmjs.com/package/@types/lodash)                                | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/mocha": "5.2.7"`                     | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/mocha](https://www.npmjs.com/package/@types/mocha)                                  | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/node": "12.12.5"`                    | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/node](https://www.npmjs.com/package/@types/node)                                    | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/unzipper": "0.10.0"`                 | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/unzipper](https://www.npmjs.com/package/@types/unzipper)                            | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/shelljs": "0.8.6"`                   | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/shelljs](https://www.npmjs.com/package/@types/shelljs)                              | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/yeoman-environment": "2.3.2"`        | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/yeoman-environment](https://www.npmjs.com/package/@types/yeoman-environment)        | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/yeoman-generator": "3.1.4"`          | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/yeoman-generator](https://www.npmjs.com/package/@types/yeoman-generator)            | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"@types/yosay": "0.0.29"`                    | [MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)             | [@types/yosay](https://www.npmjs.com/package/@types/yosay)                                  | [GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `"ansi-regex": "5.0.0"`                       | [MIT](https://github.com/chalk/ansi-regex/blob/master/license)                            | [ansi-regex](https://www.npmjs.com/package/ansi-regex)                                      | [GitHub](https://github.com/chalk/ansi-regex) |
| `"ansi-styles": "4.1.0"`                      | [MIT](https://github.com/chalk/ansi-styles/blob/master/license)                           | [ansi-styles](https://www.npmjs.com/package/ansi-styles)                                    | [GitHub](https://github.com/chalk/ansi-styles) |
| `"boxen": "4.1.0"`                            | [MIT](https://github.com/sindresorhus/boxen/blob/master/license)                          | [boxen](https://www.npmjs.com/package/boxen)                                                | [GitHub](https://github.com/sindresorhus/boxen) |
| `"chai": "4.2.0"`                             | [MIT](https://github.com/chaijs/chai/blob/master/LICENSE)                                 | [chai](https://www.npmjs.com/package/chai)                                                  | [GitHub](https://github.com/chaijs/chai) |
| `"chalk": "2.4.2"`                            | [MIT](https://github.com/chalk/chalk/blob/master/license)                                 | [chalk](https://www.npmjs.com/package/chalk)                                                | [GitHub](https://github.com/chalk/chalk) |
| `"cli-boxes": "2.2.0"`                        | [MIT](https://github.com/sindresorhus/cli-boxes/blob/master/license)                      | [cli-boxes](https://www.npmjs.com/package/cli-boxes)                                        | [GitHub](https://github.com/sindresorhus/cli-boxes) |
| `"cross-spawn": "7.0.1"`                      | [MIT](https://github.com/moxystudio/node-cross-spawn/blob/master/LICENSE)                 | [cross-spawn](https://www.npmjs.com/package/cross-spawn)                                    | [GitHub](https://github.com/moxystudio/node-cross-spawn) |
| `"csv-parser": "2.3.1"`                       | [MIT](https://github.com/mafintosh/csv-parser/blob/master/LICENSE)                        | [csv-parser](https://www.npmjs.com/package/csv-parser)                                      | [GitHub](https://github.com/mafintosh/csv-parser) |
| `"debug": "4.1.1"`                            | [MIT](https://github.com/visionmedia/debug/blob/master/LICENSE)                           | [debug](https://www.npmjs.com/package/debug)                                                | [GitHub](https://github.com/visionmedia/debug) |
| `"del": "5.1.0"`                              | [MIT](https://github.com/sindresorhus/del/blob/master/license)                            | [del](https://www.npmjs.com/package/del)                                                    | [GitHub](https://github.com/sindresorhus/del) |
| `"falcon-listr-update-renderer": "0.4.2"`     | [MIT](https://github.com/sfdx-isv/falcon-listr-update-renderer/blob/master/license)       | [falcon-listr-update-renderer](https://www.npmjs.com/package/falcon-listr-update-renderer)  | [GitHub](https://github.com/sfdx-isv/falcon-listr-update-renderer) |
| `"fs-extra": "8.1.0"`                         | [MIT](https://github.com/jprichardson/node-fs-extra/blob/master/LICENSE)                  | [fs-extra](https://www.npmjs.com/package/fs-extra)                                          | [GitHub](https://github.com/jprichardson/node-fs-extra) |
| `"globby": "10.0.1"`                          | [MIT](https://github.com/sindresorhus/globby/blob/master/license)                         | [globby](https://www.npmjs.com/package/globby)                                              | [GitHub](https://github.com/sindresorhus/globby) |
| `"inquirer": "7.0.0"`                         | [MIT](https://github.com/SBoudrias/Inquirer.js/blob/master/LICENSE)                       | [inquirer](https://www.npmjs.com/package/inquirer)                                          | [GitHub](https://github.com/SBoudrias/Inquirer.js) |
| `"jsforce": "1.9.3"`                          | [MIT](https://github.com/jsforce/jsforce/blob/master/LICENSE)                             | [jsforce](https://www.npmjs.com/package/jsforce)                                            | [GitHub](https://github.com/jsforce/jsforce) |
| `"json2csv": "4.5.4"`                         | [MIT](https://github.com/zemirco/json2csv/blob/master/LICENSE.md)                         | [json2csv](https://www.npmjs.com/package/json2csv)                                          | [GitHub](https://github.com/zemirco/json2csv) |
| `"lerna": "3.18.3"`                           | [MIT](https://github.com/lerna/lerna/blob/master/LICENSE)                                 | [lerna](https://www.npmjs.com/package/lerna)                                                | [GitHub](https://github.com/lerna/lerna) |
| `"listr": "0.14.3"`                           | [MIT](https://github.com/SamVerschueren/listr/blob/master/license)                        | [listr](https://www.npmjs.com/package/listr)                                                | [GitHub](https://github.com/SamVerschueren/listr) |
| `"listr-silent-renderer": "1.1.1"`            | [MIT](https://github.com/SamVerschueren/listr-silent-renderer/blob/master/license)        | [listr-silent-renderer](https://www.npmjs.com/package/listr-silent-renderer)                | [GitHub](https://github.com/samverschueren/listr-silent-renderer) |
| `"lodash": "4.17.15"`                         | [MIT](https://github.com/lodash/lodash/blob/master/LICENSE)                               | [lodash](https://www.npmjs.com/package/lodash)                                              | [GitHub](https://github.com/lodash/lodash) |
| `"mocha": "6.2.2"`                            | [MIT](https://github.com/mochajs/mocha/blob/master/LICENSE)                               | [mocha](https://www.npmjs.com/package/mocha)                                                | [GitHub](https://github.com/mochajs/mocha) |
| `"mocha-junit-reporter": "1.23.1"`            | [MIT](https://github.com/michaelleeallen/mocha-junit-reporter/blob/master/LICENSE.txt)    | [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter)                  | [GitHub](https://github.com/michaelleeallen/mocha-junit-reporter) |
| `"pad": "3.2.0"`                              | [NO-SPDX-ID](https://github.com/adaltas/node-pad/blob/master/LICENSE)                     | [pad](https://www.npmjs.com/package/pad)                                                    | [GitHub](https://github.com/adaltas/node-pad) |
| `"pad-component": "0.0.1"`                    | NONE                                                                                      | [pad-component](https://www.npmjs.com/package/pad-component)                                | [GitHub](https://www.npmjs.com/package/pad-component) |
| `"nyc": "14.1.1"`                             | [ISC](https://github.com/istanbuljs/nyc/blob/master/LICENSE.txt)                          | [nyc](https://www.npmjs.com/package/nyc)                                                    | [GitHub](https://github.com/istanbuljs/nyc) |
| `"rxjs": "6.5.3"`                             | [Apache-2.0](https://github.com/ReactiveX/rxjs/blob/master/LICENSE.txt)                   | [rxjs](https://www.npmjs.com/package/rxjs)                                                  | [GitHub](https://github.com/reactivex/rxjs) |
| `"shelljs": "0.8.3"`                          | [BSD-3-Clause](https://github.com/shelljs/shelljs/blob/master/LICENSE)                    | [shelljs](https://www.npmjs.com/package/shelljs)                                            | [GitHub](https://github.com/shelljs/shelljs) |
| `"sinon": "7.5.0"`                            | [BSD](https://github.com/sinonjs/sinon/blob/master/LICENSE)                               | [sinon](https://www.npmjs.com/package/sinon)                                                | [GitHub](https://github.com/sinonjs/sinon) |
| `"string-width": "4.1.0"`                     | [MIT](https://github.com/sindresorhus/string-width/blob/master/license)                   | [string-width](https://www.npmjs.com/package/string-width)                                  | [GitHub](https://github.com/sindresorhus/string-width) |
| `"strip-ansi": "5.2.0"`                       | [MIT](https://github.com/chalk/strip-ansi/blob/master/license)                            | [strip-ansi](https://www.npmjs.com/package/strip-ansi)                                      | [GitHub](https://github.com/chalk/strip-ansi) |
| `"tslib": "1.10.0"`                           | [Apache-2.0](https://github.com/microsoft/tslib/blob/master/LICENSE.txt)                  | [tslib](https://www.npmjs.com/package/tslib)                                                | [GitHub](https://github.com/Microsoft/tslib) |
| `"ts-node": "8.4.1"`                          | [MIT](https://github.com/TypeStrong/ts-node/blob/master/LICENSE)                          | [ts-node](https://www.npmjs.com/package/ts-node)                                            | [GitHub](https://github.com/TypeStrong/ts-node) |
| `"typescript": "3.6.4"`                       | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/master/LICENSE.txt)             | [typescript](https://www.npmjs.com/package/typescript)                                      | [GitHub](https://github.com/Microsoft/TypeScript) |
| `"unzipper": "0.10.5"`                        | [MIT](https://github.com/ZJONSSON/node-unzipper/blob/master/LICENSE)                      | [unzipper](https://www.npmjs.com/package/unzipper)                                          | [GitHub](https://github.com/ZJONSSON/node-unzipper) |
| `"uuid": "3.3.3"`                             | [MIT](https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md)                       | [uuid](https://www.npmjs.com/package/uuid)                                                  | [GitHub](https://github.com/kelektiv/node-uuid) |
| `"wrap-ansi": "6.1.0"`                        | [MIT](https://github.com/chalk/wrap-ansi/blob/master/license)                             | [wrap-ansi](https://www.npmjs.com/package/wrap-ansi)                                        | [GitHub](https://github.com/chalk/wrap-ansi) |
| `"yeoman-environment": "2.6.0"`               | [BSD-2-Clause](https://github.com/yeoman/environment/blob/master/license)                 | [yeoman-environment](https://www.npmjs.com/package/yeoman-environment)                      | [GitHub](https://github.com/yeoman/environment) |
| `"yeoman-generator": "4.2.0"`                 | [BSD-2-Clause](https://github.com/yeoman/generator/blob/master/LICENSE)                   | [yeoman-generator](https://www.npmjs.com/package/yeoman-generator)                          | [GitHub](https://github.com/yeoman/generator) |
| `"yosay": "2.0.2"`                            | [BSD-2-Clause](https://github.com/yeoman/yosay/blob/master/license)                       | [yosay](https://www.npmjs.com/package/yosay)                                                | [GitHub](https://github.com/yeoman/yosay) |


<!--| `"PACKAGE_NAME": "VERSION"`                   | [LICENSE](LINK) | [NPM]() | [GitHub]() |-->

