//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/command/src/sfdx-falcon-generator-command.ts
 * @summary       Exports an abstract class that adds support for running a Yeoman Generator inside
 *                of an SFDX-Falcon flavored Salesforce CLI command.
 * @description   Exports an abstract class that adds support for running a Yeoman Generators inside
 *                of an SFDX-Falcon flavored Salesforce CLI command. Generators are specialized
 *                classes that define user interaction and task execution in a standardized mannner.
 *
 *                Generator classes must be present in your package's source tree and must be
 *                included when publishing your CLI plugin. The Generator's file name must match
 *                string passed to the `generatorType` option.  For example, if
 *                `generatorType==='my-generator'`, there MUST be a corresponding source file
 *                somewhere in your project named `my-generator.ts`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  * as path               from  'path';                   // Node.js native path library.
import  * as yeoman             from  'yeoman-environment';     // Facilitates the discovery and execution of a Yeoman Generator.

// Import SFDX-Falcon Libraries
import  {TypeValidator}         from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}       from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}       from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}      from  '@sfdx-falcon/status';    // Class. Provides a mechanism for sharing data among SFDX-Falcon code structures.

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}  from  '@sfdx-falcon/status';    // Interface. Represents various types of SFDX-Falcon Results.
import  {JsonMap}               from  '@sfdx-falcon/types';     // Interface. Interface. Any JSON-compatible object.

// Import Internal Modules
import  {SfdxFalconCommand}     from  './sfdx-falcon-command';  // Abstract Class. Custom SFDX-Falcon base class for SFDX Commands.

// Import Internal Types
import  {SfdxFalconCommandType} from  './sfdx-falcon-command';  // Enum. Represents the types of SFDX-Falcon Commands.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:command:generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface GeneratorOptions {
  /** Required. The name of the command that is executing a Generator, eg. `falcon:adk:clone`. */
  commandName:      string;
  /** Required. Relative path to the directory containing a Generator class file. This file MUST implement a default exported class that's derived from `SfdxFalconGenerator`. The path provided must use UNIX-style directory syntax, eg. `../../generators` */
  generatorPath:    string;
  /** Required. The name of the file containing the Generator class to be run. Must NOT include file extensions, eg. `clone-appx-demo-kit` */
  generatorType:    string;
  /** Required. Reference to package.json of the module that's implementing a command derived from `SfdxFalconGeneratorCommand` */
  packageJson:      JsonMap;
  /** Optional. A GENERATOR-type `SfdxFalconResult` object. If not provided, will be automatically created inside of the `SfdxFalconGeneratorCommand.runGenerator()` method. */
  generatorResult?: SfdxFalconResult;
  /** Optional. An object containing all custom options that should be passed to the specified Generator when it is run. */
  customOpts?:      object;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconGeneratorCommand
 * @extends     SfdxFalconCommand
 * @summary     Abstract base class class for building Salesforce CLI commands that use Yeoman.
 * @description Classes that extend `SfdxFalconGeneratorCommand` will be able to run any Generator
 *              defined in the `src/generators` directory.  The file name in `src/generators` should
 *              match the `generatorType` string passed into `runYeomanGenerator()`.  For example,
 *              if `generatorType==='my-generator'`, then there MUST be a `.TS` script file located
 *              at `src/generators/my-generator.ts`.
 * @public @abstract
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconGeneratorCommand extends SfdxFalconCommand {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconGeneratorCommand
   * @param       {any} argv  Required. Part of the `oclif` command run process.
   *              Must be passed **unmodified** to the superclass.
   * @param       {any} config  Required. Part of the `oclif` command run process.
   *              Must be passed **unmodified** to the superclass.
   * @description Constructs an `SfdxFalconGeneratorCommand` object.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected constructor(argv:any, config:any) { // tslint:disable-line: no-any

    // Call the parent constructor. Make sure it knows this is a GENERATOR type command.
    // DO NOT MODIFY `argv` or `config` variables!
    super(argv, config, SfdxFalconCommandType.GENERATOR);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    runGenerator
   * @param       {GeneratorOptions}  opts  Required. Options object that
   *              specifies which Generator to run and any additional custom
   *              options that should be passed to the Generator, eg. user
   *              supplied arguments and flags.
   * @returns     {Promise<SfdxFalconResult>}  Returns a promise that resolves
   *              and rejects with an SFDX-Falcon Result. The output of this
   *              function is intended to be consumed by the `onSuccess()` and
   *              `onError()` methods.
   * @description Runs the `SfdxFalconGenerator` specified by the `generatorPath`
   *              and `generatorType` values supplied by the caller in the
   *              `GeneratorOptions` object.  Will pass custom options to the
   *              Generator, if provided.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async runGenerator(opts:GeneratorOptions):Promise<SfdxFalconResult> {

    // Define the function-local debug namespace and reflect arguments.
    const funcName    = `runGenerator`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate the REQUIRED options.
    TypeValidator.throwOnEmptyNullInvalidObject (opts,                `${dbgNsLocal}`,  `GeneratorOptions`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.commandName,    `${dbgNsLocal}`,  `GeneratorOptions.commandName`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorPath,  `${dbgNsLocal}`,  `GeneratorOptions.generatorPath`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorType,  `${dbgNsLocal}`,  `GeneratorOptions.generatorType`);

    // Validate the OPTIONAL options.
    if (opts.generatorResult) TypeValidator.throwOnNullInvalidInstance    (opts.generatorResult,  SfdxFalconResult, `${dbgNsLocal}`,  `GeneratorOptions.generatorResult`);
    if (opts.customOpts)      TypeValidator.throwOnEmptyNullInvalidObject (opts.customOpts,                         `${dbgNsLocal}`,  `GeneratorOptions.customOpts`);

    // If one wasn't provided, initialize a GENERATOR Result. Pass it to the Generator so we can figure out how things went.
    if (typeof opts.generatorResult === 'undefined') {
      opts.generatorResult =
      new SfdxFalconResult(opts.generatorType, SfdxFalconResultType.GENERATOR,
                          { startNow:       true,
                            bubbleError:    false,    // Do not bubble errors. Errors handled by inspecting the result of the Generator.
                            bubbleFailure:  false});  // Do not bubble failures.
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:opts:`, opts);

    // Create a Yeoman environment.
    const yeomanEnv = yeoman.createEnv();

    // Register a generator with the Yeoman environment, based on generatorType.
    yeomanEnv.register(
      require.resolve(path.join(opts.generatorPath, opts.generatorType)),
      `sfdx-falcon:${opts.generatorType}`
    );

    // Run the Yeoman Generator.
    return new Promise((resolve, reject) => {
      yeomanEnv.run(`sfdx-falcon:${opts.generatorType}`, opts, (generatorError:Error|SfdxFalconResult) => {
        if (generatorError) {

          // If the Generator Error is the same SfdxFalconResult that we passed into the Generator, just reject it.
          if (generatorError === opts.generatorResult) {
            return reject(generatorError);
          }

          // Declare an SFDX-Falcon Error that will be defined differently based on what we got back from the Generator.
          let sfdxFalconError:SfdxFalconError = null;

          // If the Generator Error is an Error, mark the Generator Result as an Error and reject it.
          if (generatorError instanceof Error) {
            sfdxFalconError = new SfdxFalconError ( `Generator '${opts.generatorType}' failed. ${generatorError.message}`
                                                  , `GeneratorError`
                                                  , `${dbgNsLocal}`
                                                  , generatorError);
            opts.generatorResult.error(sfdxFalconError);
            return reject(opts.generatorResult);
          }

          // If the Generator Error is an SfdxFalconResult, craft an SfdxFalconError, mark the Generator Result as Error, then reject it.
          if (generatorError instanceof SfdxFalconResult) {
            sfdxFalconError = new SfdxFalconError ( `Generator '${opts.generatorType}' failed`
                                                  +  (generatorError.errObj ? `. ${generatorError.errObj.message}` : ` with an unknown error.`)
                                                  , `GeneratorResultError`
                                                  , `${dbgNsLocal}`
                                                  , generatorError.errObj);
            opts.generatorResult.addChild(generatorError);
            opts.generatorResult.error(sfdxFalconError);
            return reject(opts.generatorResult);
          }

          // If we get here, it means a completely unexpected result came back from the Generator.
          sfdxFalconError = new SfdxFalconError ( `Generator '${opts.generatorType}' failed with an unexpected result. See error.details for more information.`
                                                , `UnexpectedGeneratorFailure`
                                                , `${dbgNsLocal}`
                                                , null
                                                , generatorError);
          opts.generatorResult.error(sfdxFalconError);
          return reject(opts.generatorResult);
        }
        else {
          // No Generator Error means that the Generator was successful.
          opts.generatorResult.success();
          return resolve(opts.generatorResult);
        }
      });
    }) as Promise<SfdxFalconResult>;
  }
}
