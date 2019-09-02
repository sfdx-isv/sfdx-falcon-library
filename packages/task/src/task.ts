//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/task/src/task.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports SfdxFalconTask, an abstraction of a single Listr Task.
 * @description   Exports SfdxFalconTask, an abstraction of a single Listr Task.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {ListrContext}      from  'listr';  // ???
import  {ListrTask}         from  'listr';  // ???
import  {ListrTaskWrapper}  from  'listr';  // ???
import  {ListrTaskResult}   from  'listr';  // ???
import  Listr               = require('listr');
import  {Observable}        from  'rxjs';   // Class. Used to communicate status with Listr.

// Import SFDX-Falcon Libraries
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TaskProgressNotifications} from  '@sfdx-falcon/notifications'; // Class. Manages progress notification messages for SFDX-Falcon Tasks.
import  {SfdxFalconResult}          from  '@sfdx-falcon/result';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}  from  '@sfdx-falcon/result';  //  Enum. Represents the different types of sources where Results might come from.
import  {Subscriber}            from  '@sfdx-falcon/types';   //  Type. Alias to an rxjs Subscriber<unknown> type.


// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:task:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


/**
 * Type. Alias for the "this" context from the caller.
 */
export type Context = any;  // tslint:disable-line: no-any

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Options that can be set during the construction of an `ObservableTaskResult` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ObservableTaskResultOptions {
  /** The `ListrContext` associated with the execution of a `ListrTask` at runtime. Passed as the first parameter into all `ListrTask` functions. */
  listrContext:   ListrContext;
  /** Runtime wrapper around the `ListrTask` that's being executed. Allows for runtime modification of various task properties. */
  listrTask:      ListrTaskWrapper;
  /** The RxJS Subscriber that this `ObservableTaskResult` should be hooked into */
  subscriber:       Subscriber;
  /** The Debug Namespace that should be used within this `ObservableTaskResult` instance */
  dbgNsLocal:     string;
  /** The baseline status message for this `ObservableTaskResult`. */
  statusMsg?:     string;
  /** The minimum amount of time, in seconds, that this `ObservableTaskResult` should run. Useful for keeping a status message on screen long enough for the user to see it. */
  minRuntime?:    number;
  /** Specifies whether or not the status message shown by the `ListrTask` will be continually updated with an "elapsed seconds" counter. */
  showTimer?:     boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Options that can be set during the construction of an `SfdxFalconTask` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconTaskOptions<CTX=ListrContext> extends ListrTask<CTX> {
  /** The context (ie. `this`) that the `SfdxFalconTask` being created should be hooked into. */
  context:      Context;
  /** The "external" Debug Namespace that should be used within this `SfdxFalconTask` instance */
  dbgNsExt:     string;
  /** The baseline status message for this `SfdxFalconTask`. */
  statusMsg?:   string;
  /** The minimum amount of time, in seconds, that this `SfdxFalconTask` should run. Useful for keeping a status message on screen long enough for the user to see it. */
  minRuntime?:  number;
  /** Specifies whether or not the status message shown by the `SfdxFalconTask` will be continually updated with an "elapsed seconds" counter. */
  showTimer?:   boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ObservableTaskResult
 * @description Creates the structure needed to wrap the output of any task as an `SfdxFalconResult`
 *              while also managing access to the Observer that Listr uses to monitor the progress
 *              of a task.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ObservableTaskResult {

  // Private class members
  private _dbgNsLocal:          string;
  private _extContext:          Context;
  private _listrContext:        ListrContext;
  private _listrTask:           ListrTaskWrapper;
  private _subscriber:          Subscriber;
  private _sharedData:          object;
  private _statusMsg:           string;
  private _parentResult:        SfdxFalconResult;
  private _notificationTimeout: NodeJS.Timeout;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ObservableTaskResult
   * @param       {ObservableTaskResultOptions} opts  Required. Options that
   *              determine how this `ObservableTaskResult` will be constructed.
   * @description Constructs an `ObservableTaskResult` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ObservableTaskResult) {

  

  }


}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconTask
 * @description Abstraction of a single Listr Task with a lot of extra functionality bundled in.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconTask<CTX=ListrContext> {

  // Listr-specific members.
  private _title:           string;
  private _task:            (ctx:CTX, task:ListrTaskWrapper<CTX>) => void | ListrTaskResult<CTX>;
  private _skip:            (ctx:CTX) => void | boolean | string | Promise<boolean>;
  private _enabled:         (ctx:CTX) => boolean | Promise<boolean> | Observable<boolean>;

  // SFDX-Falcon Task-specific members.
  private _callingContext:  Context;
  private _dbgNsExt:        string;
  private _statusMsg:       string;
  private _minRuntime:      number;
  private _showTimer:       boolean;
  private _otr:             ObservableTaskResult;

  // Public accessors.
  public get sharedData():object {
    this.validateSharedData();
    return this._callingContext.sharedData;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconTask
   * @param       {SfdxFalconTaskOptions} opts  Required. Options used to
   *              construct this instance of an `SfdxFalconTask` object.
   * @description Constructs an `SfdxFalconTask` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:SfdxFalconTaskOptions) {

    // Set function-local debug namespace and examine incoming arguments.
    const dbgNsLocal = `${dbgNs}constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Make sure the caller passed in an options object.
    TypeValidator.throwOnEmptyNullInvalidObject(opts, `${dbgNsLocal}`, `opts`);

    // Build a set of resolved options by mixing what the caller supplied with our defaults.
    const resolvedOpts = {
      statusMsg:  '',
      minRuntime: 0,
      showTimer:  true,
      ...opts
    } as SfdxFalconTaskOptions;

    // Validate the contents of the resolved options.
    TypeValidator.throwOnEmptyNullInvalidString (resolvedOpts.title,      `${dbgNsLocal}`,  `resolvedOpts.title`);
    TypeValidator.throwOnNullInvalidFunction    (resolvedOpts.task,       `${dbgNsLocal}`,  `resolvedOpts.task`);
    if (typeof resolvedOpts.skip    !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.skip,     `${dbgNsLocal}`,  `resolvedOpts.skip`);
    if (typeof resolvedOpts.enabled !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.enabled,  `${dbgNsLocal}`,  `resolvedOpts.enabled`);
    TypeValidator.throwOnEmptyNullInvalidObject (resolvedOpts.context,    `${dbgNsLocal}`,  `resolvedOpts.context`);
    TypeValidator.throwOnEmptyNullInvalidString (resolvedOpts.dbgNsExt,   `${dbgNsLocal}`,  `resolvedOpts.dbgNsExt`);
    TypeValidator.throwOnNullInvalidString      (resolvedOpts.statusMsg,  `${dbgNsLocal}`,  `resolvedOpts.statusMsg`);
    TypeValidator.throwOnNullInvalidNumber      (resolvedOpts.minRuntime, `${dbgNsLocal}`,  `resolvedOpts.minRuntime`);
    TypeValidator.throwOnNullInvalidBoolean     (resolvedOpts.showTimer,  `${dbgNsLocal}`,  `resolvedOpts.showTimer`);

    // Initialize Listr-specific member variables.
    this._title           = resolvedOpts.title;
    this._task            = resolvedOpts.task;
    this._skip            = resolvedOpts.skip;
    this._enabled         = resolvedOpts.enabled;

    // Initialize SFDX-Falcon Task-specific variables.
    this._callingContext  = resolvedOpts.context;
    this._dbgNsExt        = resolvedOpts.dbgNsExt;
    this._statusMsg       = resolvedOpts.statusMsg;
    this._minRuntime      = resolvedOpts.minRuntime;
    this._showTimer       = resolvedOpts.showTimer;
    
    // Make sure that the external context has a sharedData object.
    this.validateSharedData();


  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      validateSharedData
   * @returns     {void}
   * @description Checks if the external context referenced by this instance
   *              has an associated `sharedData` object.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private validateSharedData():void {
    if (typeof this._callingContext !== 'object' || typeof this._callingContext.sharedData !== 'object') {
      throw new SfdxFalconError ( `Expected there to be a 'sharedData' object available in the calling scope. `
                                + `${typeof this._callingContext === 'object' ? `Found type '${typeof this._callingContext.sharedData}' instead. ` : ``}`
                                + `You must provide a reference to the calling context when creating SfdxFalconTask objects. `
                                + `You must also ensure that the calling context has defined an object named 'sharedData'.`
                                , `InvalidSharedData`
                                , `${dbgNs}validateSharedData`);
    }
  }
}
