//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/command/src/sfdx-falcon-command.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports an abstract class that provides a framework for running an SFDX-Falcon
 *                flavored Salesforce CLI command.
 * @description   Exports an abstract class that provides a framework for running an SFDX-Falcon
 *                flavored Salesforce CLI command.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {OutputArgs}                  from  '@oclif/parser';          // Arguments supplied by the user when the CLI command is invoked.
import  {OutputFlags}                 from  '@oclif/parser';          // Flags supplied by the user when the CLI command is invoked.
import  {flags}                       from  '@salesforce/command';    // Required by child classe to create a CLI command
import  {SfdxCommand}                 from  '@salesforce/command';    // Required by child classe to create a CLI command
import  {Messages}                    from  '@salesforce/core';       // Messages library that simplifies using external JSON for string reuse.
import  {SfdxError}                   from  '@salesforce/core';       // Generalized SFDX error which also contains an action.
import  {AnyJson}                     from  '@salesforce/ts-types';   // Any valid JSON value.
import  {JsonMap}                     from  '@salesforce/ts-types';   // Any JSON-compatible object.
import  * as path                     from  'path';                   // Helps resolve local paths at runtime.

// Import SFDX-Falcon Libraries
import  {CoreValidator}               from  '@sfdx-falcon/validator'; // Library. Contains core validation functions to check that local path values don't have invalid chars.
import  {TypeValidator}               from  '@sfdx-falcon/validator'; // Library. Contains type validation functions.

// Import SFDX-Falcon Classes & Functions
import {SfdxFalconDebug}              from  '@sfdx-falcon/debug';     // Class. Internal debugging framework for SFDX-Falcon.
import {SfdxFalconError}              from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconResult}             from  '@sfdx-falcon/status';    // Class. Used to communicate results of SFDX-Falcon code execution at a variety of levels.
import {TaskStatus}                   from  '@sfdx-falcon/status';    // Class. Manages progress notifications inside Falcon.

// Import SFDX-Falcon Types
import {SfdxFalconResultType}         from  '@sfdx-falcon/status';    // Enum. Represents the different types of sources where Results might come from.
//import {SfdxFalconJsonResponse}       from  '@sfdx-falcon/types';     // Interface. Represents the JSON reponse returned by SFDX-Falcon Commands.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:command:standard';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Enum. Defines the possible types of SFDX-Falcon Commands.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export enum SfdxFalconCommandType {
  STANDARD  = 'STANDARD',
  GENERATOR = 'GENERATOR',
  UNKNOWN   = 'UNKNOWN'
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the Detail object that should be attached to the `SfdxFalconResult` object
 * that's associated with the execution of an `SfdxFalconCommand`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconCommandResultDetail {
  commandName:      string;
  commandType:      SfdxFalconCommandType;
  commandFlags:     OutputFlags<any>; // tslint:disable-line: no-any
  commandArgs:      OutputArgs<any>;  // tslint:disable-line: no-any
  commandExitCode:  number;
  enabledDebuggers: string[];
}

//─────────────────────────────────────────────────────────────────────────────┐
// SFDX Core library has the ability to import a JSON file with message strings
// making it easy to separate logic from static output messages. There are
// two steps required to use this.
//
// Step 1:  Tell the Messages framework to look for and import a 'messages'
//          directory from inside the root of your project.
// Step 2:  Create a Messages object representing a message bundle from inside
//          your 'messages' directory.  The second param represents the name of
//          the JSON file you're trying to load.
//
// Note that messages from @salesforce/command, @salesforce/core, or any library
// that is using the messages framework can also be loaded this way by
// specifying the module name as the first parameter of loadMessages().
//─────────────────────────────────────────────────────────────────────────────┘
Messages.importMessagesDirectory(__dirname);
const baseMessages  = Messages.loadMessages('@sfdx-falcon/command', 'sfdxFalconCommand');
const errorMessages = Messages.loadMessages('@sfdx-falcon/command', 'sfdxFalconError');

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SfdxFalconCommand
 * @extends     SfdxCommand
 * @summary     Abstract base class class for building Salesforce CLI commands that use the SFDX-Falcon Library.
 * @description Classes that extend SfdxFalconCommand will be able to leverage specialized "command
 *              and control" capabilities that the SFDX-Library adds on top of standard SFDX
 *              commands.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconCommand extends SfdxCommand {

  //───────────────────────────────────────────────────────────────────────────┐
  // Define the baseline set of custom FLAGS used by all SFDX-Falcon commands.
  //    --FALCONDEBUG           Command should run in DEBUG mode.
  //    --FALCONDEBUGERROR      Command should run in ERROR DEBUG mode.
  //    --FALCONDEBUGSUCCESS    Command should run in SUCCESS DEBUG mode.
  //    --FALCONDEBUGDEPTH      Object inspection depth when debug is rendered.
  //───────────────────────────────────────────────────────────────────────────┘
  protected static falconBaseflagsConfig = {
    falcondebug: flags.array({
      description: baseMessages.getMessage('falcondebug_FlagDescription'),
      required: false,
      hidden: false,
      default: []
    }),
    falcondebugerror: flags.boolean({
      description: baseMessages.getMessage('falcondebugerror_FlagDescription'),
      required: false,
      hidden: false
    }),
    falcondebugsuccess: flags.boolean({
      description: baseMessages.getMessage('falcondebugsuccess_FlagDescription'),
      required: false,
      hidden: false
    }),
    falcondebugdepth: flags.number({
      description: baseMessages.getMessage('falcondebugdepth_FlagDescription'),
      required: false,
      hidden: false,
      default: 2
    })
  };

  // Member vars for basic information about this command.
  /** Name of the command defined by the derived class, eg. `falcon:adk:clone`. */
  protected readonly commandName:         string;
  /** Type of command defined by the derived class. Possible values are `STANDARD` or `GENERATOR`. */
  protected readonly commandType:         SfdxFalconCommandType;

  // Member vars that help build and deliver a JSON response once command execution is done.
  /** Command-level `SfdxFalconResult` object. Should should be used as the ultimate parent to all other `SfdxFalconResult` objects used by logic executed by this command. */
  protected readonly commandResult:       SfdxFalconResult;
  protected readonly commandResultDetail: SfdxFalconCommandResultDetail;  // Why?
  protected commandResponse:              AnyJson;                        // Why?

  // Member vars for commonly implemented flags.
  protected outputDirectory:              string;                         // Why?
  protected projectDirectory:             string;                         // Why?
  protected sourceDirectory:              string;                         // Why?
  protected targetDirectory:              string;                         // Why?
  protected recipeFile:                   string;                         // Why?
  protected configFile:                   string;                         // Why?
  protected extendedOptions:              JsonMap;                        // Why?

  // Member vars for commonly implemented arguments.
  protected gitRemoteUri:                 string;                         // Why?
  protected gitCloneDirectory:            string;                         // Why?

  // Member vars for ALL debug flags
  protected falconDebugFlag:              string[]      = new Array<string>();  // Why?
  protected falconDebugErrorFlag:         boolean       = false;                // Why?
  protected falconDebugSuccessFlag:       boolean       = false;                // Why?
  protected falconDebugDepthFlag:         number        = 2;                    // Why?
  
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconCommand
   * @param       {any} argv  Required. Part of the `oclif` command run process.
   *              Must be passed **unmodified** to the superclass.
   * @param       {any} config  Required. Part of the `oclif` command run process.
   *              Must be passed **unmodified** to the superclass.
   * @param       {SfdxFalconCommandType} [commandType] Optional. Specifies the
   *              type of command being created. Defaults to `STANDARD`.
   * @description Constructs an `SfdxFalconCommand` object.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected constructor(argv:any, config:any, commandType?:SfdxFalconCommandType) { // tslint:disable-line: no-any

    // Call the parent constructor. DO NOT MODIFY `argv` or `config` variables!
    super(argv, config);

    // Set the correct Command Type.
    commandType = (typeof commandType === 'string' && commandType) ? commandType : SfdxFalconCommandType.STANDARD;
    
    // Set the Command Name.
    this.commandName = this.id;

    // Initialize an SfdxFalconResult object to store the Result of this COMMAND.
    this.commandResult =
      new SfdxFalconResult(this.commandName, SfdxFalconResultType.COMMAND,
                          { startNow:       true,
                            bubbleError:    false,    // Let onError() handle errors (no bubbling)
                            bubbleFailure:  false});  // Let onSuccess() handle failures (no bubbling)

    // Initialize COMMAND Result Detail. Some details will be fleshed out by `sfdxFalconCommandInit()`.
    this.commandResultDetail = {commandName:      this.commandName,
                                commandType:      this.commandType,
                                commandFlags:     null,
                                commandArgs:      null,
                                commandExitCode:  null,
                                enabledDebuggers: null};
    
    // Attach the Results Detail object to the COMMAND result then debug it.
    this.commandResult.setDetail(this.commandResultDetail);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    run
   * @returns     {Promise<AnyJson>}
   * @description Recieves the results from a Rejected Promise and processes
   *              them to settle out the ultimate exit status of this
   *              COMMAND Result.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async run():Promise<AnyJson> {

    // Define function-local debug namespace.
    const funcName    = `run`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    // Initialize the SfdxFalconCommand (required by ALL classes that extend SfdxFalconCommand).
    this.sfdxFalconCommandInit();

    // Reflect `this` context.
    SfdxFalconDebug.obj(`${dbgNsLocal}:this:`, this);

    // Run the command logic that's defined by the derived class.
    const commandResponse = await this.runCommand()
    .then((result:unknown) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:runCommand:result:`, {result: result});
      return this.onSuccess(result);
    })
    .catch((error:unknown) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:runCommand:error:`, {error: error});
      return this.onError(error);
    });
    SfdxFalconDebug.obj(`${dbgNsLocal}:commandResponse:`, {commandResponse: commandResponse});

    // Prepare the Command Response for return to the user.
    const preparedResponse = this.prepareResponse(commandResponse);
    SfdxFalconDebug.obj(`${dbgNsLocal}:preparedResponse:`, {preparedResponse: preparedResponse});

    // All done. Give the core SfdxCommand our prepared response.
    return preparedResponse;
  }

  // Abstract methods
  protected abstract buildFinalError(cmdError:SfdxFalconError):SfdxError; // Builds a user-friendly error message that's specific to an implemented command.
  protected abstract async runCommand():Promise<unknown>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    onError
   * @param       {any}   rejectedPromise Required.
   * @param       {boolean} [showErrorDebug]  Optional. Determines if extended
   *              debugging output the Error Result can be shown.
   * @param       {boolean} [promptUser=true] Optional. Determines if the user
   *              will be prompted to display debug info. If `false`, debug info
   *              will be shown without requiring additional user input.
   * @returns     {Promise<void>}
   * @description Recieves the results from a Rejected Promise and processes
   *              them to settle out the ultimate exit status of this
   *              COMMAND Result.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async onError(rejectedPromise:unknown, showErrorDebug:boolean=true, promptUser:boolean=true):Promise<void> {

    // Make sure any rejected promises are wrapped as an ERROR Result.
    const errorResult = SfdxFalconResult.wrapRejectedPromise(rejectedPromise, SfdxFalconResultType.UNKNOWN, 'RejectedPromise');

    // Set the Exit Code for this COMMAND Result (failure==1).
    this.commandResultDetail.commandExitCode = 1;

    // Add the ERROR Result to the COMMAND Result.
    this.commandResult.addChild(errorResult);

    // Manually mark the COMMAND Result as an Error (since bubbleError is FALSE)
    this.commandResult.error(errorResult.errObj);

    // Terminate with Error.
    // TODO: Need to add a global parameter to store the "show prompt" setting
    await this.terminateWithError(showErrorDebug, promptUser);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    onSuccess
   * @param       {any}  resolvedPromise Required.
   * @returns     {Promise<void>}
   * @description Takes any resolved Promise which should be returned by some
   *              sort of Asynchronous call (implemented in a derived class)
   *              that does whatever "work" the CLI Command is meant to do and
   *              makes sure it's wrapped as an SFDX Falcon Result
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async onSuccess(resolvedPromise:unknown):Promise<unknown> {

    // Make sure any resolved promises are wrapped as an SfdxFalconResult.
    const successResult = SfdxFalconResult.wrap(resolvedPromise, SfdxFalconResultType.UNKNOWN, `onSuccess`);

    // Set the Exit Code for this COMMAND Result (success==0).
    this.commandResultDetail.commandExitCode = 0;

    // Add the SFDX-Falcon Result as a Child of the COMMAND Result.
    this.commandResult.addChild(successResult);

    // Mark the COMMAND Result as completing successfully.
    this.commandResult.success();

    // If the "falcondebugsuccess" flag was set, render the COMMAND Result
    if (this.falconDebugSuccessFlag) {
      this.commandResult.displayResult();
    }

    // Return the unmodified Resolved Promise so it can be processed by `prepareResponse()`.
    return resolvedPromise;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    sfdxFalconCommandInit
   * @returns     {void}
   * @description Initializes various SfdxFalconCommand structures.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private sfdxFalconCommandInit() {

    // Define function-local debug namespace.
    const funcName    = `sfdxFalconCommandInit`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    // Initialize the command response.
    this.commandResponse = null;
  
    // Read the inocming values for all COMMON FLAGS. (not all of these will have values)
    this.outputDirectory            = path.resolve(this.flags.outputdir       ||  '.');
    this.projectDirectory           = path.resolve(this.flags.projectdir      ||  '.');
    this.sourceDirectory            = path.resolve(this.flags.sourcedir       ||  '.');
    this.targetDirectory            = path.resolve(this.flags.targetdir       ||  '.');
    this.recipeFile                 = this.flags.recipefile                   ||  '';
    this.configFile                 = this.flags.configfile                   ||  '';
    this.extendedOptions            = JSON.parse((this.flags.extendedOptions  ||  '{}'));
  
    // Read the incoming values for all COMMON ARGS. (not all of these will have values)
    this.gitRemoteUri               = this.args.GIT_REMOTE_URI        ||  '';
    this.gitCloneDirectory          = this.args.GIT_CLONE_DIR         ||  '';

    // Read the incoming values for all DEBUG flags.
    this.falconDebugFlag            = this.flags.falcondebug          ||  [];
    this.falconDebugErrorFlag       = this.flags.falcondebugerror     ||  false;
    this.falconDebugSuccessFlag     = this.flags.falcondebugsuccess   ||  false;
    this.falconDebugDepthFlag       = this.flags.falcondebugdepth     ||  2;
    
    // Specify the top-level SFDX-Falcon debugger namespaces to enable.
    const enabledDebuggers = new Array<string>();

    // Build an array of the debugger namespaces to enable.
    for (const debugNamespace of this.falconDebugFlag) {
      enabledDebuggers.push(`${debugNamespace.trim()}`);
    }
    if (this.falconDebugErrorFlag)    enabledDebuggers.push('FALCON_ERROR');
    if (this.falconDebugSuccessFlag)  enabledDebuggers.push('FALCON_SUCCESS');

    // Enable the specified debuggers.
    SfdxFalconDebug.enableDebuggers(enabledDebuggers, this.falconDebugDepthFlag);

    // Flesh out the details of the COMMAND Result then debug it.
    this.commandResultDetail.commandFlags     = this.flags;
    this.commandResultDetail.commandArgs      = this.args,
    this.commandResultDetail.enabledDebuggers = enabledDebuggers;
    this.commandResult.debugResult(`After initialization in constructor`, `${dbgNsLocal}`);

    // Perform validation of common flags and args.
    if (CoreValidator.validateLocalPath(this.outputDirectory) === false) {
      throw new Error(errorMessages.getMessage('errInvalidDirectory', ['Output ']));
    }
    if (CoreValidator.validateLocalPath(this.projectDirectory) === false) {
      throw new Error(errorMessages.getMessage('errInvalidDirectory', ['Project ']));
    }
    if (CoreValidator.validateLocalPath(this.targetDirectory) === false) {
      throw new Error(errorMessages.getMessage('errInvalidDirectory', ['Target ']));
    }
  }
 
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepareResponse
   * @param       {unknown} finalOutput  Required. The ouput that came back
   *              from the `runCommand()` method, after being processed by
   *              either `onSuccess()` or `onFailure()`.
   * @description Given the output returned by the `runCommand()` method and
   *              processed by either the `onSuccess()` or `onFailure()` methods,
   *              prepares the final output which will be returned from the
   *              `run()` method.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private prepareResponse(finalOutput:unknown):AnyJson {

    // TODO: Implement this method.
    
    return finalOutput as AnyJson;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      terminateWithError
   * @param       {boolean} [showErrorDebug=true]  Optional. Determines if
   *              extended debugging output for the terminating Error can be shown.
   * @param       {boolean} [promptUser=true] Optional. Determines if the user
   *              will be prompted to display debug info. If `false`, debug info
   *              will be shown without requiring additional user input.
   * @description Kills all ongoing async code (ie. Progress Notifications) and
   *              possibly renders an Error Debug before throwing an `SfdxError`
   *              so that the CLI can present user-friendly error info.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async terminateWithError(showErrorDebug:boolean=true, promptUser:boolean=true):Promise<void> {
  
    // Make sure any outstanding notifications are killed.
    TaskStatus.killAll();

    // Make sure that an SfdxFalconResult object was passed to us.
    if ((this.commandResult instanceof SfdxFalconResult) === false) {
      throw new Error('ERROR_X01: An unexpected fatal error has occured');
    }

    // Make sure that the SfdxFalconResult object comes to us with a contained SfdxFalconError Object.
    if ((this.commandResult.errObj instanceof SfdxFalconError) === false) {
      throw new Error('ERROR_X02: An unexpected fatal error has occured');
    }

    // Run the "Display Error Debug Info" process. This may prompt the user to view extended debug info.
    await this.commandResult.displayErrorDebugInfo(showErrorDebug, promptUser);

    // Create a "Final Error" based on the COMMAND Result's Error object.
    let finalError:SfdxError = null;
    try {
      finalError = this.buildFinalError(this.commandResult.errObj);
      if (TypeValidator.isInvalidInstance(finalError, Error)) {
        finalError = new SfdxFalconError( `${this.commandName} failed. See error details for additional information.`
                                        , `FatalCommandError`
                                        , `${dbgNs}:terminateWithError`
                                        , null
                                        , {devWarning:    `Warning: The developer of this plugin did not properly implement the buildFinalError() method. If you are the developer, please fix this.`,
                                           rawErrorObj:   this.commandResult.errObj,
                                           finalErrorObj: finalError});
      }
    }
    catch (errorBuilderError) {
        finalError = new SfdxFalconError( `${this.commandName} failed. See error details for additional information.`
                                        , `FatalCommandError`
                                        , `${dbgNs}:terminateWithError`
                                        , null
                                        , {devWarning:    `Warning: The developer of this plugin did not properly implement the buildFinalError() method. If you are the developer, please fix this.`,
                                           errorBuilderError: errorBuilderError,
                                           rawErrorObj:   this.commandResult.errObj,
                                           finalErrorObj: finalError});
    }
    
    // Throw the Final Error.
    throw finalError;
  }
}
