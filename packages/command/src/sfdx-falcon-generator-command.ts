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
const dbgNs = '@sfdx-falcon/command:generator';
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

  // Set the Command Type to GENERATOR.
  protected readonly commandType:  SfdxFalconCommandType = SfdxFalconCommandType.GENERATOR;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    onError
   * @param       {unknown} rejectedPromise Required. Result of the failed
   *              Yeoman Generator.
   * @param       {boolean} [showErrorDebug]  Optional. Determines if extended
   *              debugging output the Error Result can be shown.
   * @param       {boolean} [promptUser] Optional. Determines if the user will
   *              be prompted to display debug info. If `false`, debug info will
   *              be shown without requiring additional user input.
   * @returns     {Promise<void>}
   * @description Handles the output of a failed Yeoman Generator run.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async onError(rejectedPromise:unknown, showErrorDebug:boolean=true, promptUser:boolean=true):Promise<void> {

    // If special override behavior is deemed necessary, we can add it here.
    // For now, we'll simply pass things along to the superclass (parent).
    return super.onError(rejectedPromise, showErrorDebug, promptUser);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    onSuccess
   * @param       {unknown} resolvedPromise Required. This should be an
   *              `SfdxFalconResult` object returned from `runYeomanGenerator()`.
   * @returns     {Promise<void>}
   * @description Handles the output of a successful Yeoman Generator run.
   * @protected @asnyc
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async onSuccess(resolvedPromise:unknown):Promise<void> {

    // If special override behavior is deemed necessary, we can add it here.
    // For now, we'll simply pass things along to the superclass (parent).
    return super.onSuccess(resolvedPromise);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    runYeomanGenerator
   * @param       {GeneratorOptions}  generatorOptions  Required. Options that
   *              specify how the Yeoman Generator should run.
   * @returns     {Promise<SfdxFalconResult>}  Returns a promise that resolves
   *              and rejects with an SFDX-Falcon Result. The output of this
   *              function is intended to be consumed by the `onSuccess()` and
   *              `onError()` methods.
   * @description Runs the specified Yeoman generator using the given options.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async runYeomanGenerator(generatorOptions:GeneratorOptions):Promise<SfdxFalconResult> {

    // Define the function-local debug namespace.
    const funcName    = `runYeomanGenerator`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
  
    // Make sure the caller provides a Generator Type.
    if (!generatorOptions.generatorType) {
      throw new SfdxFalconError( `A valid generator type must be provided to runYeomanGenerator(). You provided '${generatorOptions.generatorType}'.`
                               , `InvalidGeneratorType`
                               , `${dbgNsLocal}`);
    }

    // Initialize a GENERATOR Result. Pass it to the Generator so we can figure out how things went.
    const generatorResult =
      new SfdxFalconResult(generatorOptions.generatorType, SfdxFalconResultType.GENERATOR,
                          { startNow:       true,
                            bubbleError:    false,    // Bubble errors to the COMMAND result
                            bubbleFailure:  false});  // Do not bubble failures (eg. Git commit not working)

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
                                                , `${dbgNsLocal}`);
          sfdxFalconError.setDetail(generatorError);
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

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    sfdxFalconCommandInit
   * @returns     {void}
   * @description Initializes any `SfdxFalconGeneratorCommand` structures
   *              before calling the same init function from `SfdxFalconCommand`.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected sfdxFalconCommandInit():void {

    // If specialized initialization is needed, add it here before the super() call.
    super.sfdxFalconCommandInit();
  }
}
