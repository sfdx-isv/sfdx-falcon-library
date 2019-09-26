//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/task-bundle/src/task-bundle.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the `TaskBundle` object, an execution container for `Listr` tasks.
 * @description   Execution container for `Listr` tasks. Requires the caller to specify standard pre
 *                and post-task messaging as well as `GeneratorStatus` messages for both task
 *                execution success and failure.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  Listr =                 require('listr');               // Provides asynchronous list with status of task completion.

// Import SFDX-Falcon Libraries
import  {TypeValidator}         from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}       from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}       from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}      from  '@sfdx-falcon/status';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {printStyledMessage}    from  '@sfdx-falcon/status';    // Function. Given a single StyledMessage object, outputs that message to the console using the styling information provided inside the object.
import  {GeneratorStatus}       from  '@sfdx-falcon/status';    // Class. Status tracking object for use with Generators derived from SfdxFalconGenerator.

// Import SFDX-Falcon Types
import  {ListrObject}           from  '@sfdx-falcon/types';     // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
import  {StatusMessage}         from  '@sfdx-falcon/types';     // Interface. Represents a "state aware" message. Contains a title, a message, and a type.
import  {StatusMessageType}     from  '@sfdx-falcon/types';     // Enum. Represents the various types/states of a Status Message.
import  {StyledMessage}         from  '@sfdx-falcon/types';     // Interface. Allows for specification of a message string and chalk-specific styling information.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:task-bundle';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the suite of information required to instantiate a `TaskBundle` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface TaskBundleOptions {
  /** Required. A fully instantiated `Listr` Object representing the tasks that the caller would like to run. */
  listrObject:            ListrObject;
  /** Required. The the external debug namespace that will be used by `SfdxFalconDebug` and `SfdxFalconError` objects. */
  dbgNsExt:               string;
  /** Required. The `GeneratorStatus` object that's attached to the `SfdxFalconGenerator` instance inside of which this `TaskBundle` will run. */
  generatorStatus:        GeneratorStatus;
  /** Required. The `StatusMessage` that will be added to the `GeneratorStatus` object if the `TaskBundle` completes successfully. */
  generatorStatusSuccess: StatusMessage;
  /** Required. The `StatusMessage` that will be added to the `GeneratorStatus` object if the `TaskBundle` does not complete successfully. */
  generatorStatusFailure: StatusMessage;
  /** Required. Specifies whether an `SfdxFalconError` will be thrown if any of the Tasks in the `TaskBundle` fail. */
  throwOnFailure:         boolean;
  /** Optional. A `StyledMessage` that will be shown to the user **BEFORE** the `TaskBundle` is run. */
  preTaskMessage?:        StyledMessage;
  /** Optional. A `StyledMessage` that will be shown to the user **AFTER** the `TaskBundle` is run. */
  postTaskMessage?:       StyledMessage;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskBundle
 * @description Execution container for `Listr` Tasks. Requires the caller to specify standard pre and
 *              post-task messaging as well as `GeneratorStatus` messages for both task execution
 *              success and failure.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TaskBundle {

  // Private member variables
  private _listrObject:             ListrObject;
  private _dbgNsExt:                string;
  private _generatorStatus:         GeneratorStatus;
  private _generatorStatusSuccess:  StatusMessage;
  private _generatorStatusFailure:  StatusMessage;
  private _throwOnFailure:          boolean;
  private _preTaskMessage:          StyledMessage;
  private _postTaskMessage:         StyledMessage;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TaskBundle
   * @param       {TaskBundleOptions} opts  Required. Options that determine how
   *              this `TaskBundle` will be constructed.
   * @description Constructs a `TaskBundle` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(opts:TaskBundleOptions) {

    // Define function-local debug namespace and debug incoming arguments.
    const funcName    = `run`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate required Options.
    TypeValidator.throwOnEmptyNullInvalidObject (opts,                                    `${dbgNsLocal}`, `TaskBundleOptions`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,                           `${dbgNsLocal}`, `TaskBundleOptions.dbgNsExt`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.generatorStatusSuccess,             `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusSuccess`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusSuccess.message,     `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusSuccess.message`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusSuccess.title,       `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusSuccess.title`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusSuccess.type,        `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusSuccess.type`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.generatorStatusFailure,             `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusFailure`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusFailure.message,     `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusFailure.message`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusFailure.title,       `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusFailure.title`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorStatusFailure.type,        `${dbgNsLocal}`, `TaskBundleOptions.generatorStatusFailure.type`);
    TypeValidator.throwOnNullInvalidBoolean     (opts.throwOnFailure,                     `${dbgNsLocal}`, `TaskBundleOptions.throwOnFailure`);
    TypeValidator.throwOnNullInvalidInstance    (opts.listrObject,      Listr,            `${dbgNsLocal}`, `TaskBundleOptions.listrObject`);
    TypeValidator.throwOnNullInvalidInstance    (opts.generatorStatus,  GeneratorStatus,  `${dbgNsLocal}`, `TaskBundleOptions.generatorStatus`);

    // Validate optional Options.
    if (TypeValidator.isNotInvalidObject(opts.preTaskMessage)) {
      TypeValidator.throwOnNullInvalidString (opts.preTaskMessage.message,  `${dbgNsLocal}`,  `TaskBundleOptions.preTaskMessage.message`);
      TypeValidator.throwOnNullInvalidString (opts.preTaskMessage.styling,  `${dbgNsLocal}`,  `TaskBundleOptions.preTaskMessage.styling`);
    }
    if (TypeValidator.isNotInvalidObject(opts.postTaskMessage)) {
      TypeValidator.throwOnNullInvalidString (opts.postTaskMessage.message,  `${dbgNsLocal}`,  `TaskBundleOptions.postTaskMessage.message`);
      TypeValidator.throwOnNullInvalidString (opts.postTaskMessage.styling,  `${dbgNsLocal}`,  `TaskBundleOptions.postTaskMessage.styling`);
    }

    // Make sure that the External Debug Namespace from the Task Bundle does not end with :
    const dbgNsExt  = opts.dbgNsExt.endsWith(':')
                    ? opts.dbgNsExt.substring(0, opts.dbgNsExt.lastIndexOf(':'))
                    : opts.dbgNsExt;

    // Initialize member variables.
    this._listrObject               = opts.listrObject;
    this._generatorStatus           = opts.generatorStatus;
    this._dbgNsExt                  = dbgNsExt;
    this._generatorStatusSuccess    = opts.generatorStatusSuccess;
    this._generatorStatusFailure    = opts.generatorStatusFailure;
    this._throwOnFailure            = opts.throwOnFailure;
    this._preTaskMessage            = opts.preTaskMessage;
    this._postTaskMessage           = opts.postTaskMessage;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      run
   * @returns     {Promise<unknown>}
   * @description Runs the `Listr` task object with pre and post-task messages
   *              displayed. Handles any errors and updates the `GeneratorStatus`
   *              object with the appropriate message.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async run():Promise<unknown> {
      
    // Define function-local debug namespace.
    const funcName    = `run`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNsExt}:TaskBundle:${funcName}`;

    // Show the pre-task message.
    printStyledMessage(this._preTaskMessage);
    
    // Run the Listr Tasks.
    const listrResult = await this._listrObject.run()
    .then(listrSuccess => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:listrSuccess:`,  listrSuccess);
      SfdxFalconDebug.obj(`${dbgNsExt}:listrSuccess:`,    listrSuccess);
      this._generatorStatus.addMessage(this._generatorStatusSuccess);
      return listrSuccess;
    })
    // Handle Failure.
    .catch(listrError => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:listrError:`,  listrError);
      SfdxFalconDebug.obj(`${dbgNsExt}:listrError:`,    listrError);

      // If the FAILURE status message is of type ERROR or FATAL, mark Generator Status as ABORTED.
      // This gives the caller some indirect control of how failures are handled.
      if (this._generatorStatusFailure.type === StatusMessageType.ERROR || this._generatorStatusFailure.type === StatusMessageType.FATAL) {
        this._generatorStatus.abort(this._generatorStatusFailure);
      }
      else {
        this._generatorStatus.addMessage(this._generatorStatusFailure);
      }

      // Start figuring out the Final Error by just wrapping whatever is in the Listr Error.
      let finalError:SfdxFalconError = SfdxFalconError.wrap(listrError, `${dbgNsExt}`);

      // If the Listr Error is an SfdxFalconResult, use its Error Object as the Final Error instead.
      if (listrError instanceof SfdxFalconResult) {
        finalError = new SfdxFalconError( `${this._generatorStatusFailure.type === StatusMessageType.ERROR ? `${this._generatorStatusFailure.message}. ` : ``}`
                                        + `A task threw an SfdxFalconResult as an error. See error.detail for more information.`
                                        , `TaskError`
                                        , `${dbgNsLocal}`
                                        , listrError.errObj
                                        , listrError);
        SfdxFalconDebug.obj(`${dbgNsLocal}:workingError:`,  finalError, `SFDX-Falcon Result Error`);
        SfdxFalconDebug.obj(`${dbgNsExt}:workingError:`,    finalError, `SFDX-Falcon Result Error`);
      }

      // If listrError is an Error, try to unwrap any suppressed errors and include them as Error Detail.
      if (listrError instanceof Error) {
        if (TypeValidator.isNotEmptyNullInvalidObject(listrError) && TypeValidator.isNotNullInvalidArray(listrError['errors'])) {
          const suppressedErrors = [];
          for (const error of listrError['errors']) {
            suppressedErrors.push({
              name:     error.name,
              message:  error.message,
              cause:    ((error.cause) ? {name: error.cause.name, message: error.cause.message, stack: error.cause.stack} : 'NOT_SPECIFIED')
            });
          }
          SfdxFalconDebug.obj(`${dbgNsLocal}:suppressedErrors:`,  suppressedErrors);
          SfdxFalconDebug.obj(`${dbgNsExt}:suppressedErrors:`,    suppressedErrors);
          finalError = new SfdxFalconError( `${this._generatorStatusFailure.type === StatusMessageType.ERROR ? `${this._generatorStatusFailure.message}. ` : ``}`
                                          + `One or more tasks threw an error. See error.detail for more information.`
                                          , `MultiTaskError`
                                          , `${dbgNsLocal}`
                                          , listrError
                                          , suppressedErrors);
          SfdxFalconDebug.obj(`${dbgNsLocal}:workingError:`,  finalError, `Listr Suppressed Error`);
          SfdxFalconDebug.obj(`${dbgNsExt}:workingError:`,    finalError, `Listr Suppressed Error`);
        }
      }

      // Throw the Final Error if the caller wants us to, otherwise just return whatever we got back from Listr.
      if (this._throwOnFailure === true) {
        if (finalError === null) {
          finalError = new SfdxFalconError( `An unhandled exception has occured. See error.detail for more information.`
                                          , `UnhandledException`
                                          , `${dbgNsLocal}`
                                          , null
                                          , listrError);
          SfdxFalconDebug.obj(`${dbgNsLocal}:workingError:`,  finalError, `Unhandled Error`);
          SfdxFalconDebug.obj(`${dbgNsExt}:workingError:`,    finalError, `Unhandled Error`);
        }
        SfdxFalconDebug.obj(`${dbgNsLocal}:finalError:`,  finalError);
        SfdxFalconDebug.obj(`${dbgNsExt}:finalError:`,    finalError);
        throw finalError;
      }
      else {
        return listrError;
      }
    });

    // Show the post-task message.
    printStyledMessage(this._postTaskMessage);

    // Send whatever we got back from Listr to the caller.
    return listrResult;
  }
}
