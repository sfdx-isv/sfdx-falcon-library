//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/command/src/sfdx-falcon-generator-command.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports an abstract class that adds support for running a Yeoman Generator inside
 *                of the SFDX-Falcon flavor of a Salesforce CLI command.
 * @description   Exports an abstract class that adds support for running a Yeoman Generators inside
 *                of the SFDX-Falcon flavor of a Salesforce CLI command. Generators are specialized
 *                classes that define user interaction and task execution in a standardized mannner.
 *
 *                Generator classes must be present at the root of your package's source tree in a
 *                `./generators` directory and must be included when publishing your CLI plugin.
 *                The Generator's file name must match the string passed to the `generatorType`
 *                option.  For example, if `generatorType==='my-generator'`, there MUST be a
 *                corresponding source file located at `./generators/my-generator.ts`.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {AnyJson}               from  '@salesforce/ts-types';   // Safe type for use where "any" might otherwise be used.
import  * as yeoman             from  'yeoman-environment';     // Facilitates the discovery and execution of a Yeoman Generator.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}       from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}       from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}      from  '@sfdx-falcon/status';    // Class. Provides a mechanism for sharing data among SFDX-Falcon code structures.
import  {GeneratorStatus}       from  '@sfdx-falcon/status';    // Class. Status tracking object for use with Generators derived from SfdxFalconGenerator.

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}  from  '@sfdx-falcon/status';    // Interface. Represents various types of SFDX-Falcon Results.

// Import Internal Modules
import  {SfdxFalconCommand}     from  './sfdx-falcon-command';  // Abstract Class. Custom SFDX-Falcon base class for SFDX Commands.

// Import Internal Types
import  {SfdxFalconCommandType} from  './sfdx-falcon-command';  // Enum. Represents the types of SFDX-Falcon Commands.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:command:generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   GeneratorOptions
 * @description Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface GeneratorOptions {
  commandName?:     string;
  commandResult?:   SfdxFalconResult;
  generatorType?:   string;
  generatorStatus?: GeneratorStatus;
  generatorResult?: SfdxFalconResult;
  [key:string]: AnyJson | GeneratorStatus | SfdxFalconResult | string | number;
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
   * @param       {GeneratorOptions}  generatorOptions  Required. Options that
   *              specify how the Generator should run.
   * @returns     {Promise<SfdxFalconResult>}  Returns a promise that resolves
   *              and rejects with an SFDX-Falcon Result. The output of this
   *              function is intended to be consumed by the `onSuccess()` and
   *              `onError()` methods.
   * @description Runs the specified Generator using the given options.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async runGenerator(generatorOptions:GeneratorOptions):Promise<SfdxFalconResult> {

    // Define the function-local debug namespace.
    const funcName    = `runGenerator`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
  
    // Make sure the caller provides a Generator Type.
    if (!generatorOptions.generatorType) {
      throw new SfdxFalconError( `A valid generator type must be provided to runGenerator(). You provided '${generatorOptions.generatorType}'.`
                               , `InvalidGeneratorType`
                               , `${dbgNsLocal}`);
    }

    // Initialize a GENERATOR Result. Pass it to the Generator so we can figure out how things went.
    const generatorResult =
      new SfdxFalconResult(generatorOptions.generatorType, SfdxFalconResultType.GENERATOR,
                          { startNow:       true,
                            bubbleError:    false,    // Do not bubble errors. Errors handled by inspecting the result of the Generator.
                            bubbleFailure:  false});  // Do not bubble failures.

    // Combine incoming generatorOptions with the default options.
    const resolvedGeneratorOptions = {
      // Default options
      commandName:      this.commandName,
      generatorResult:  generatorResult,
      options: [],
      // User options
      ...generatorOptions
    } as GeneratorOptions;

    // Pull the generator type out of the options.
    const generatorType = resolvedGeneratorOptions.generatorType;

    // Create a Yeoman environment.
    const yeomanEnv = yeoman.createEnv();

    // Register a generator with the Yeoman environment, based on generatorType.
    yeomanEnv.register(
      require.resolve(`../../generators/${generatorType}`),
      `sfdx-falcon:${generatorType}`
    );

    // Run the Yeoman Generator.
    return new Promise((resolve, reject) => {
      yeomanEnv.run(`sfdx-falcon:${generatorType}`, resolvedGeneratorOptions, (generatorError:Error|SfdxFalconResult) => {
        if (generatorError) {

          // If the Generator Error is the same SfdxFalconResult that we passed into the Generator, just reject it.
          if (generatorError === generatorResult) {
            return reject(generatorError);
          }

          // Declare an SFDX-Falcon Error that will be defined differently based on what we got back from the Generator.
          let sfdxFalconError:SfdxFalconError = null;

          // If the Generator Error is an Error, mark the Generator Result as an Error and reject it.
          if (generatorError instanceof Error) {
            sfdxFalconError = new SfdxFalconError ( `Generator '${generatorType}' failed. ${generatorError.message}`
                                                  , `GeneratorError`
                                                  , `${dbgNsLocal}`
                                                  , generatorError);
            generatorResult.error(sfdxFalconError);
            return reject(generatorResult);
          }

          // If the Generator Error is an SfdxFalconResult, craft an SfdxFalconError, mark the Generator Result as Error, then reject it.
          if (generatorError instanceof SfdxFalconResult) {
            sfdxFalconError = new SfdxFalconError ( `Generator '${generatorType}' failed`
                                                  +  (generatorError.errObj ? `. ${generatorError.errObj.message}` : ` with an unknown error.`)
                                                  , `GeneratorResultError`
                                                  , `${dbgNsLocal}`
                                                  , generatorError.errObj);
            generatorResult.addChild(generatorError);
            generatorResult.error(sfdxFalconError);
            return reject(generatorResult);
          }

          // If we get here, it means a completely unexpected result came back from the Generator.
          sfdxFalconError = new SfdxFalconError ( `Generator '${generatorType}' failed with an unexpected result. See error.details for more information.`
                                                , `UnexpectedGeneratorFailure`
                                                , `${dbgNsLocal}`
                                                , null
                                                , generatorError);
          generatorResult.error(sfdxFalconError);
          return reject(generatorResult);
        }
        else {
          // No Generator Error means that the Generator was successful.
          generatorResult.success();
          return resolve(generatorResult);
        }
      });
    }) as Promise<SfdxFalconResult>;
  }
}
