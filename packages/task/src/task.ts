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
import  {ListrContext}      from  'listr';  // Type. Used by the context object that Listr passes from Task to Task in a single execution context.
import  {ListrTask}         from  'listr';  // Interface. Represents a Task object as defined by Listr.
import  {ListrTaskWrapper}  from  'listr';  // Class. An instantiated ListrTask that will eventually be in the process of being executed.
import  {ListrTaskResult}   from  'listr';  // Type. Possible return values from the execution of a Listr Task.
import  {Observable}        from  'rxjs';   // Class. Used to communicate status with Listr.
import  {Subscriber}        from  'rxjs';   // Class. Implements the Observer interface and extends the Subscription class.

// Import SFDX-Falcon Libraries
import  {AsyncUtil}                 from  '@sfdx-falcon/util';          // Library. Async utility helper functions.
import  {YeomanUtil}                from  '@sfdx-falcon/util';          // Library. Helper functions and classes related to Yeoman Generators.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}          from  '@sfdx-falcon/result';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}      from  '@sfdx-falcon/result';  // Enum. Represents the different types of sources where Results might come from.
import  {ErrorOrResult}             from  '@sfdx-falcon/result';  // Type. Alias to a combination of Error or SfdxFalconResult.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:task:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Alias for the `this` context from the caller.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type Context = any;  // tslint:disable-line: no-any

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Represents an externally defined `Task` function. Extends the standard `ListrTask` function type by adding a `sharedData` parameter after the `thisTask` parameter.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ExtTaskFunction<CTX=ListrContext> = (taskCtx?:CTX, taskObj?:ListrTaskWrapper<CTX>, taskStatus?:TaskStatusMessage, extCtx?:ExternalContext) => Promise<void>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Represents an externally defined `Skip` function. Extends the standard `ListrSkip` function type by adding a `sharedData` parameter after the `listrContext` parameter.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ExtSkipFunction<CTX=ListrContext> = (ctx?:CTX, extCtx?:ExternalContext) => void | boolean | string | Promise<boolean>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Represents an externally defined `Enabled` function. Extends the standard `ListrEnabled` function type by adding a `sharedData` parameter after the `listrContext` parameter.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ExtEnabledFunction<CTX=ListrContext> = (ctx?:CTX, extCtx?:ExternalContext) => boolean | Promise<boolean> | Observable<boolean>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Options that can be set during the construction of an `ObservableTaskResult` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ObservableTaskResultOptions {
  /** Collection of external context mechanisms. Passed directly */
  extCtx:         ExternalContext;
  /** The `ListrContext` associated with the execution of a `ListrTask` at runtime. Passed as the first parameter into all `ListrTask` functions. */
  taskCtx:        ListrContext;
  /** Runtime wrapper around the `ListrTask` that's being executed. Allows for runtime modification of various task properties. */
  taskObj:        ListrTaskWrapper;
  /** The RxJS Subscriber that this `ObservableTaskResult` should be hooked into */
  subscriber:     Subscriber<unknown>;
  /** The Debug Namespace that should be used within this `ObservableTaskResult` instance */
  dbgNsExt:       string;
  /** The baseline status message for this `ObservableTaskResult`. */
  statusMsg:      string;
  /** The minimum amount of time, in seconds, that this `ObservableTaskResult` should run. Useful for keeping a status message on screen long enough for the user to see it. */
  minRuntime:     number;
  /** Specifies whether or not the status message shown by the `ListrTask` will be continually updated with an "elapsed seconds" counter. */
  showTimer:      boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of key data structures that represent the overall context of the external
 * environment inside which an `SfdxFalconTask` is running.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ExternalContext {
  /** Provides a mechanism for internal task logic to share information with the external context. */
  sharedData?:       object;
  /** Reference to an `SfdxFalconResult` object that should be used as the parent of the `ObservableTaskResult` that will be created as part of an `SfdxFalconTask`. */
  parentResult?:     SfdxFalconResult;
  /** Reference to a `GeneratorStatus` object. Allows a task to directly specify `success`, `error`, and `warning` messages when running inside of an `SfdxFalconGenerator`. */
  generatorStatus?:  YeomanUtil.GeneratorStatus;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Specifies which elements of `ExternalContext` are required to be present to ensure
 * that an error won't be thrown upon construction of an `SfdxFalconTask` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ExternalContextRequirements {
  /** Determines whether or not the `sharedData` context item is required. Ensures that a shared data `object` must be part of the Context when a `SfdxFalconTask` is constructed. */
  sharedData?:       boolean;
  /** Determines whether or not the `parentResult` context item is required. Ensures that an `SfdxFalconResult` object must be part of the Context when a `SfdxFalconTask` is constructed. */
  parentResult?:     boolean;
  /** Determines whether or not the `generatorStatus` context item is required. Ensures that a `GeneratorStatus` object must be part of the Context when a `SfdxFalconTask` is constructed. */
  generatorStatus?:  boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Options that can be set during the construction of an `SfdxFalconTask` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconTaskOptions<CTX=ListrContext> {
  /** The title of the task. */
  title:        string;
  /** Collection of external context mechanisms that this `SfdxFalconTask` can use to communicate in/out with the calling code. */
  extCtx?:      ExternalContext;
  /** Defines which `ExternalContext` items are required by this task. Task constructor will throw an error if required `ExternalContext` items are not present. */
  extCtxReqs?:  ExternalContextRequirements;
  /** The "external" Debug Namespace that should be used within this `SfdxFalconTask` instance */
  dbgNsExt:     string;
  /** The task that the user wants to execute. Must be contained within a promise. */
  task:         ExtTaskFunction<CTX>;
  /** Function that determines whether this task should be skipped. */
  skip?:        ExtSkipFunction<CTX>;
  /** Function that determines whether this task should be enabled. */
  enabled?:     ExtEnabledFunction<CTX>;
  /** The baseline status message for this `SfdxFalconTask`. */
  statusMsg?:   string;
  /** The minimum amount of time, in seconds, that this `SfdxFalconTask` should run. Useful for keeping a status message on screen long enough for the user to see it. */
  minRuntime?:  number;
  /** Specifies whether or not the status message shown by the `SfdxFalconTask` will be continually updated with an "elapsed seconds" counter. */
  showTimer?:   boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Models the information stored as the "detail" of an `SfdxFalconResult` that's contained
 * by an `ObservableTaskResult` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface TaskResultDetail {
  /** Reference to the `ExternalContext` object which may contain a variety of objects that connect back to the environment the `ObservableTaskResult` runs in. */
  extCtx:     ExternalContext;
  /** Special local task execution context managed by Listr */
  taskCtx:    ListrContext;
  /** Reference to the specific Listr Task that is associated with the `SfdxFalconTask` for which this detail is connected. */
  taskObj:    ListrTaskWrapper;
  /** Reference to the `TaskStatusMessages` object used by the  `TaskProgressNotifications` class to power status messages for the `SfdxFalconTask` for which this detail is connected. */
  statusMsgs: TaskStatusMessages;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the full suite of Task Status Message strings that are used by the
 * `TaskProgressNotifications.progressNotification()` function to display status messages to the
 * user while a `ListrTask` is running.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface TaskStatusMessages {
  /** The default status message. This message is shown when a task starts running. */
  defaultMessage:   string;
  /** Determines whether the status message should prepend the elapsed runtime in front of the status message. */
  showTimer:        boolean;
  /** The status message that's currently being displayed by the running task. */
  currentMessage?:  string;
  /** The status message that was previouly in use. Will be `null` if the status message has not been updated. */
  prevMessage?:     string;
  /** The status message that should be used the next time the Task Progress notification function executes. */
  nextMessage?:     string;
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
  private _dbgNsExt:            string;
  private _extCtx:              ExternalContext;
  private _taskCtx:             ListrContext;
  private _taskObj:             ListrTaskWrapper;
  private _subscriber:          Subscriber<unknown>;
  private _minRunTime:          number;
  private _showTimer:           boolean;
//  private _parentResult:        SfdxFalconResult;
  private _taskResult:          SfdxFalconResult;
  private _taskResultDetail:    TaskResultDetail;
  private _taskStatusMessage:   TaskStatusMessage;
  private _taskStatusMessages:  TaskStatusMessages;
  private _notificationTimer:   NodeJS.Timeout;

  // Public accessors
  /** Represents the Status Message for the associated `SfdxFalconTask`. Allows external logic to read and set status messages. */
  public get status():TaskStatusMessage {
    return this._taskStatusMessage;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ObservableTaskResult
   * @param       {ObservableTaskResultOptions} opts  Required. Options that
   *              determine how this `ObservableTaskResult` will be constructed.
   * @description Constructs an `ObservableTaskResult` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ObservableTaskResultOptions) {

    // Set function-local debug namespace and examine incoming arguments.
    const dbgNsLocal = `${dbgNs}ObservableTaskResult:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  
    // Validate the REQUIRED contents of the options object.
    TypeValidator.throwOnEmptyNullInvalidObject (opts,              `${dbgNsLocal}`,  `ObservableTaskResultOptions`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,     `${dbgNsLocal}`,  `ObservableTaskResultOptions.dbgNsExt`);
    TypeValidator.throwOnNullInvalidObject      (opts.extCtx,       `${dbgNsLocal}`,  `ObservableTaskResultOptions.extCtx`);
    TypeValidator.throwOnNullInvalidObject      (opts.taskCtx,      `${dbgNsLocal}`,  `ObservableTaskResultOptions.taskCtx`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.taskObj,      `${dbgNsLocal}`,  `ObservableTaskResultOptions.taskObj`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.subscriber,   `${dbgNsLocal}`,  `ObservableTaskResultOptions.subscriber`);
    TypeValidator.throwOnNullInvalidString      (opts.statusMsg,    `${dbgNsLocal}`,  `ObservableTaskResultOptions.statusMsg`);
    TypeValidator.throwOnNullInvalidNumber      (opts.minRuntime,   `${dbgNsLocal}`,  `ObservableTaskResultOptions.minRuntime`);
    TypeValidator.throwOnNullInvalidBoolean     (opts.showTimer,    `${dbgNsLocal}`,  `ObservableTaskResultOptions.showTimer`);

    // Validate the OPTIONAL contents of the External Context options object.
    if (opts.extCtx.sharedData)       TypeValidator.throwOnNullInvalidObject  (opts.extCtx.sharedData,                                  `${dbgNsLocal}`,  `ObservableTaskResultOptions.extCtx.sharedData`);
    if (opts.extCtx.parentResult)     TypeValidator.throwOnNullInvalidInstance(opts.extCtx.parentResult,    SfdxFalconResult,           `${dbgNsLocal}`,  `ObservableTaskResultOptions.extCtx.parentResult`);
    if (opts.extCtx.generatorStatus)  TypeValidator.throwOnNullInvalidInstance(opts.extCtx.generatorStatus, YeomanUtil.GeneratorStatus, `${dbgNsLocal}`,  `ObservableTaskResultOptions.extCtx.generatorStatus`);
    
    // Validate the DEEPER contents of the options object.
    TypeValidator.throwOnNullInvalidInstance(opts.subscriber, Subscriber, `${dbgNsLocal}`, `opts.subscriber`);

    // Initialize member variables.
    this._dbgNsExt          = opts.dbgNsExt;
    this._extCtx            = opts.extCtx;
    this._taskCtx           = opts.taskCtx;
    this._taskObj           = opts.taskObj;
    this._subscriber        = opts.subscriber;
    this._minRunTime        = opts.minRuntime;
    this._showTimer         = opts.showTimer;

    // Initialize the Task Status Messages object.
    this._taskStatusMessages  = {
      defaultMessage: opts.statusMsg,
      currentMessage: opts.statusMsg,
      showTimer:      this._showTimer,
      prevMessage:    null,
      nextMessage:    null
    };

    // Initialize the Task Status Message object.
    this._taskStatusMessage = new TaskStatusMessage(this._taskStatusMessages);

    // Initialize an SFDX-Falcon Result object.
    this._taskResult = new SfdxFalconResult (this._dbgNsExt, SfdxFalconResultType.TASK,
                                            { startNow:       true,     // Start the internal clock for this result on creation
                                              bubbleError:    false,    // Let the parent Result handle errors (no bubbling)
                                              bubbleFailure:  false});  // Let the parent Result handle failures (no bubbling)
    SfdxFalconDebug.obj(`${dbgNsLocal}:_taskResult:`, this._taskResult);

    // Initialize the Task Result Detail.
    this._taskResultDetail = {
      extCtx:     this._extCtx,
      taskCtx:    this._taskCtx,
      taskObj:    this._taskObj,
      statusMsgs: this._taskStatusMessages
    };
    this._taskResult.setDetail(this._taskResultDetail);
    SfdxFalconDebug.obj(`${dbgNsLocal}:_taskResult.detail:`, this._taskResult.detail);

    // Set the initial Task Detail message.
    if (this._showTimer) {
      this._subscriber.next(`[0s] ${this._taskStatusMessages.defaultMessage}`);
    }
    else {
      this._subscriber.next(`${this._taskStatusMessages.defaultMessage}`);
    }

    // Set up Task Progress Notifications and store a reference to the Timer.
    this._notificationTimer = TaskProgressNotifications.start(this._taskStatusMessages, 1000, this._taskResult, this._subscriber);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      finalizeFailure
   * @param       {ErrorOrResult} errorOrResult Required.
   * @returns     {void}
   * @description Finalizes this `ObservableTaskResult` in a manner that
   *              indicates the associated task was NOT successful.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public finalizeFailure(errorOrResult:ErrorOrResult):void {

    // Set function-local debug namespace and examine incoming arguments.
    const dbgNsLocal = `${dbgNs}ObservableTaskResult:finalizeFailure`;
    SfdxFalconDebug.msg(`${dbgNsLocal}:`, `finalizeFailure() has been called`);
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Define a special "subscriber throw" function.
    const subscriberThrow = (error:Error):void => {
      try {
        this._subscriber.error(SfdxFalconError.wrap(error));
      }
      catch (noSubscriberError) {

        // The only reason we should get here is if this._subscriber lost its Subscriber reference.
        // If that happens, handle it gracefully by just sending a Debug message and nothing else.
        SfdxFalconDebug.obj(`${dbgNsLocal}:subscriberThrow:noSubscriberError`, noSubscriberError);
      }
    };

    // Validate incoming arguments.
    if (TypeValidator.isEmptyNullInvalidObject(errorOrResult)) {
      return subscriberThrow(new SfdxFalconError( `${TypeValidator.errMsgEmptyNullInvalidObject(errorOrResult, `errorOrResult`)}`
                                                , `TypeError`
                                                , `${dbgNsLocal}`));
    }
    if (TypeValidator.isInvalidInstance(errorOrResult, Error)
        && TypeValidator.isInvalidInstance(errorOrResult, SfdxFalconResult)) {
      return subscriberThrow(new SfdxFalconError( `Expected errorOrResult to be an instance of Error or SfdxFalconResult but got '${(errorOrResult.constructor) ? errorOrResult.constructor.name : 'unknown'}' instead.`
                                                , `TypeError`
                                                , `${dbgNsLocal}`));
    }
    
    // Validate current state of key instance variables.
    if (TypeValidator.isInvalidInstance(this._taskResult, SfdxFalconResult)) {
      return subscriberThrow(new SfdxFalconError( `${TypeValidator.errMsgInvalidInstance(this._taskResult, SfdxFalconResult, `this._taskResult`)}`
                                                , `TypeError`
                                                , `${dbgNsLocal}`));
    }
    if (TypeValidator.isNullInvalidObject(this._taskResult.detail)) {
      return subscriberThrow(new SfdxFalconError( `${TypeValidator.errMsgNullInvalidObject(this._taskResult.detail, `this._taskResult.detail`)}`
                                                , `TypeError`
                                                , `${dbgNsLocal}`));
    }

    // Finish any Task Progress Notifications attached to this Observable Task Result.
    TaskProgressNotifications.finish(this._notificationTimer);

    // Set the final ERROR state of the Task Result.
    if (errorOrResult instanceof Error) {
      this._taskResult.error(errorOrResult);
    }
    if (errorOrResult instanceof SfdxFalconResult) {
      try {
        this._taskResult.addChild(errorOrResult);
      }
      catch {
        // No need to do anything here. We are just suppressing any
        // bubbled errors from the previous addChild() call.
      }
    }
    
    // Add the Task Result as a child of the Parent Result (if present).
    if (this._extCtx.parentResult instanceof SfdxFalconResult) {
      try {
        this._extCtx.parentResult.addChild(this._taskResult);
      }
      catch (bubbledError) {
        // If we get here, it means the parent was set to Bubble Errors.
        // That means that bubbledError should be an SfdxFalconResult
        return subscriberThrow(SfdxFalconError.wrap(bubbledError.errObj));
      }
    }

    // Finalize the Subscriber with "error"
    if (errorOrResult instanceof Error) {
      return subscriberThrow(SfdxFalconError.wrap(errorOrResult));
    }
    else {
      if (TypeValidator.isNotInvalidInstance(errorOrResult.errObj, Error)) {
        return subscriberThrow(SfdxFalconError.wrap(errorOrResult.errObj));
      }
      else {
        const unexpectedError = new SfdxFalconError ( `Received an Error Result that did not contain an Error Object. See error.detail for more information.`
                                                    , `MissingErrObj`
                                                    , `${dbgNsLocal}`);
        unexpectedError.setDetail(errorOrResult);
        return subscriberThrow(unexpectedError);
      }
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      finalizeSuccess
   * @returns     {void}
   * @description Finalizes this `ObservableTaskResult` in a manner that
   *              indicates the associated task was successful.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public finalizeSuccess():void {

    // Set function-local debug namespace.
    const dbgNsLocal = `${dbgNs}ObservableTaskResult:finalizeSuccess`;
    SfdxFalconDebug.msg(`${dbgNsLocal}:`, `finalizeSuccess() has been called`);

    // Finish any Task Progress Notifications attached to this Observable Task Result.
    TaskProgressNotifications.finish(this._notificationTimer);

    // Set the final SUCCESS state of the Task Result.
    this._taskResult.success();

    // Add the Task Result as a child of the Parent Result (if present).
    if (this._extCtx.parentResult instanceof SfdxFalconResult) {
      try {
        this._extCtx.parentResult.addChild(this._taskResult);
      }
      catch (bubbledError) {
        // If we get here, it means the parent was set to Bubble Errors.
        // It also means that the Task Result was NOT successful, despite
        // the fact that somebody called the finalizeSuccess() method.
        // TODO: Not sure what the right behavior should be here.
        SfdxFalconDebug.obj(`${dbgNsLocal}`, bubbledError);
      }
    }

    // Finalize the Subscriber with "complete"
    try {
      this._subscriber.complete();
      SfdxFalconDebug.msg(`${dbgNsLocal}`, `Subscriber.complete() has been called`);
    }
    catch (noSubscriberError) {

      // The only reason we should get here is if this._subscriber lost its Subscriber reference.
      // If that happens, handle it gracefully by just sending a Debug message and nothing else.
      SfdxFalconDebug.obj(`${dbgNsLocal}:noSubscriberError:`, noSubscriberError);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      remainingRuntime
   * @returns     {number}
   * @description Finds out how long it's been since the Task Result started and
   *              subtracts that value from the minimum runtime (`_minRunTime`)
   *              to compute the remaining runtime.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public remainingRuntime():number {
    const currentRuntime = this._taskResult.durationSecs;
    const remainingRuntime = this._minRunTime - currentRuntime;
    return (remainingRuntime <= 0) ? 0 : Math.ceil(remainingRuntime);
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
  private _extTask:         ExtTaskFunction<CTX>;
  private _extSkip:         ExtSkipFunction<CTX>;
  private _extEnabled:      ExtEnabledFunction<CTX>;
  private _task:            (listrCtx:CTX, thisTask:ListrTaskWrapper<CTX>) => void | ListrTaskResult<CTX>;
  private _skip:            (listrCtx:CTX) => void | boolean | string | Promise<boolean>;
  private _enabled:         (listrCtx:CTX) => boolean | Promise<boolean> | Observable<boolean>;

  // SFDX-Falcon Task-specific members.
  private _extCtx:          ExternalContext;
  private _dbgNsExt:        string;
  private _statusMsg:       string;
  private _minRuntime:      number;
  private _showTimer:       boolean;
  private _otr:             ObservableTaskResult;

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
    const dbgNsLocal = `${dbgNs}SfdxFalconTask:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Make sure the caller passed in an options object.
    TypeValidator.throwOnEmptyNullInvalidObject(opts, `${dbgNsLocal}`, `opts`);

    // Build a set of resolved options by mixing what the caller supplied with our defaults.
    const resolvedOpts = {
      extCtx:     {},             // Not every task will need/want to utilize External Context
      extCtxReqs: {               // Not every task will need/want to utilize External Context
        sharedData:       false,
        parentResult:     false,
        generatorStatus:  false
      },
      statusMsg:  '',             // Not every task will need/want to use status messages.
      minRuntime: 0,              // Not every task will need/want to include any processing delay.
      showTimer:  false,          // Not every task will need/want the timer.
      ...opts                     // Mixin the options provided by the caller.
    } as SfdxFalconTaskOptions;

    // Validate the contents of the resolved options.
    TypeValidator.throwOnEmptyNullInvalidString (resolvedOpts.title,      `${dbgNsLocal}`,  `SfdxFalconTaskOptions.title`);
    TypeValidator.throwOnNullInvalidFunction    (resolvedOpts.task,       `${dbgNsLocal}`,  `SfdxFalconTaskOptions.task`);
    if (typeof resolvedOpts.skip          !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.skip,     `${dbgNsLocal}`,  `SfdxFalconTaskOptions.skip`);
    if (typeof resolvedOpts.enabled       !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.enabled,  `${dbgNsLocal}`,  `SfdxFalconTaskOptions.enabled`);
    TypeValidator.throwOnNullInvalidObject      (resolvedOpts.extCtx,     `${dbgNsLocal}`,  `SfdxFalconTaskOptions.extCtx`);
    TypeValidator.throwOnEmptyNullInvalidObject (resolvedOpts.extCtxReqs, `${dbgNsLocal}`,  `SfdxFalconTaskOptions.extCtxReqs`);
    if (resolvedOpts.extCtxReqs.sharedData      || typeof resolvedOpts.extCtx.sharedData      !== 'undefined')  TypeValidator.throwOnNullInvalidObject  (resolvedOpts.extCtx.sharedData,                                  `${dbgNsLocal}`,  `SfdxFalconTaskOptions.extCtx.sharedData`);
    if (resolvedOpts.extCtxReqs.parentResult    || typeof resolvedOpts.extCtx.parentResult    !== 'undefined')  TypeValidator.throwOnNullInvalidInstance(resolvedOpts.extCtx.parentResult,    SfdxFalconResult,           `${dbgNsLocal}`,  `SfdxFalconTaskOptions.extCtx.parentResult`);
    if (resolvedOpts.extCtxReqs.generatorStatus || typeof resolvedOpts.extCtx.generatorStatus !== 'undefined')  TypeValidator.throwOnNullInvalidInstance(resolvedOpts.extCtx.generatorStatus, YeomanUtil.GeneratorStatus, `${dbgNsLocal}`,  `SfdxFalconTaskOptions.extCtx.generatorStatus`);
    TypeValidator.throwOnEmptyNullInvalidString (resolvedOpts.dbgNsExt,   `${dbgNsLocal}`,  `resolvedOpts.dbgNsExt`);
    TypeValidator.throwOnNullInvalidString      (resolvedOpts.statusMsg,  `${dbgNsLocal}`,  `resolvedOpts.statusMsg`);
    TypeValidator.throwOnNullInvalidNumber      (resolvedOpts.minRuntime, `${dbgNsLocal}`,  `resolvedOpts.minRuntime`);
    TypeValidator.throwOnNullInvalidBoolean     (resolvedOpts.showTimer,  `${dbgNsLocal}`,  `resolvedOpts.showTimer`);

    // Initialize Listr-specific member variables.
    this._title           = resolvedOpts.title;
    this._extTask         = resolvedOpts.task;
    this._extSkip         = resolvedOpts.skip;
    this._extEnabled      = resolvedOpts.enabled;

    // Initialize SFDX-Falcon Task-specific variables.
    this._extCtx          = resolvedOpts.extCtx;
    this._dbgNsExt        = resolvedOpts.dbgNsExt;
    this._statusMsg       = resolvedOpts.statusMsg;
    this._minRuntime      = resolvedOpts.minRuntime;
    this._showTimer       = resolvedOpts.showTimer;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {ListrTask}
   * @description Builds an Observable `ListrTask` object based on the info
   *              that the caller provided to us when this `SfdxFalconTask`
   *              object was constructed.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build():ListrTask {

    // Set function-local debug namespace.
    const dbgNsLocal = `${dbgNs}SfdxFalconTask:build`;

    // Build the specialized Observer based task.
    this._task = (taskCtx:ListrContext, taskObj:ListrTaskWrapper) => {
      return new Observable((subscriber:Subscriber<unknown>) => {

        // Initialize an OTR (Observable Task Result).
        this._otr = new ObservableTaskResult({
          taskCtx:        taskCtx,
          taskObj:        taskObj,
          subscriber:     subscriber,
          extCtx:         this._extCtx,
          dbgNsExt:       this._dbgNsExt,
          statusMsg:      this._statusMsg,
          minRuntime:     this._minRuntime,
          showTimer:      this._showTimer
        });

        // Initialize the External Task that's associated with this instance.
        let extTaskPromise:Promise<void>;
        try {
          
          // Hoist the External Task function into the Listr task we're creating.
          extTaskPromise = this._extTask(taskCtx, taskObj, this._otr.status, this._extCtx);
        }
        catch (error) {
          const extTaskSetupError = new SfdxFalconError ( `External Task could not be initialized. ${error.message}`
                                                        , `TaskFunctionInitError`
                                                        , `${dbgNsLocal}`
                                                        , error);
          extTaskSetupError.setDetail(this._extTask);
          return this._otr.finalizeFailure(extTaskSetupError);
        }

        // Make sure the External Task returned a Promise.
        if ((extTaskPromise instanceof Promise) !== true) {
          const invalidExtTaskFunctionError = new SfdxFalconError ( `SFDX-Falcon Task Functions must be asynchronous and return Promise<void>`
                                                                  , `InvalidTaskFunction`
                                                                  , `${dbgNsLocal}`);
          invalidExtTaskFunctionError.setDetail(this._extTask);
          return this._otr.finalizeFailure(invalidExtTaskFunctionError);
        }

        // Set THEN and CATCH callbacks for the External Task.
        extTaskPromise
        .then(async () => {
          SfdxFalconDebug.msg(`${dbgNsLocal}:`, `extTaskPromise() has been RESOVLED.`);

          // Make sure the task appears to run for the minimum runtime.
          await AsyncUtil.waitASecond(this._otr.remainingRuntime());

          // Finalize the OTR as a SUCCESS.
          return this._otr.finalizeSuccess();
        })
        .catch(async (rejectedResult:unknown) => {
          SfdxFalconDebug.msg(`${dbgNsLocal}:`, `extTaskPromise() has been REJECTED.`);
          SfdxFalconDebug.obj(`${dbgNsLocal}:rejectedResult:`, {rejectedResult: rejectedResult});

          // Make sure the task appears to run for the minimum runtime.
          await AsyncUtil.waitASecond(this._otr.remainingRuntime());

          // Declare variables used to construct an Error.
          let errorMessage:string;
          let errorCause:Error;
          let errorDetail:unknown;

          // Determine the Error Message, Cause, and Detail based on what kind of Rejected Result we got.
          if (rejectedResult instanceof SfdxFalconResult) {
            errorMessage  = `Task Function failed and returned the SfdxFalconResult '${rejectedResult.name}'.`;
            errorCause    = rejectedResult.errObj;
            errorDetail   = rejectedResult;
          }
          else if (rejectedResult instanceof Error) {
            errorMessage  = `Task Function failed with the following error: ${rejectedResult.message}`;
            errorCause    = rejectedResult;
            errorDetail   = {};
          }
          else {
            errorMessage  = `Task Function failed with an unexpected result.`;
            errorCause    = undefined;
            errorDetail   = {rejectedResult: rejectedResult};
          }

          // Construct the Task Error.
          const taskError = new SfdxFalconError ( `${errorMessage}`
                                                , `TaskFunctionError`
                                                , `${dbgNsLocal}`
                                                , errorCause);
          taskError.setDetail(errorDetail);

          // Finalize the OTR as a FAILURE.
          return this._otr.finalizeFailure(taskError);
        });
      });
    };

    // Build the SKIP and ENABLED functions
    if (typeof this._extSkip === 'function') {
      this._skip    = (taskCtx:ListrContext) => this._extSkip(taskCtx, this._extCtx);
    }
    if (typeof this._extEnabled === 'function') {
      this._enabled = (taskCtx:ListrContext) => this._extEnabled(taskCtx, this._extCtx);
    }
    
    // Construct and return a ListrTask
    return {
      title:    this._title,
      task:     this._task,
      enabled:  this._enabled,
      skip:     this._skip
    } as ListrTask;
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskProgressNotifications
 * @description Manages progress notification messages for SFDX-Falcon Tasks.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TaskProgressNotifications {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      start
   * @param       {TaskStatusMessages}  taskStatusMessages  Required. Object
   *              containing the collection of strings that will be used to
   *              control the status message set by each interval-based push
   *              to the `Subscriber.next()` method.
   * @param       {number}  interval  Requiredl The interval in milliseconds.
   *              Use 1000 if you want a per-second progress count.
   * @param       {SfdxFalconResult}  result  Required. The `SfdxFalconResult`
   *              that determines the elapsed time used by the Progress
   *              Progress Notification function.
   * @param       {Subscriber<unknown>} subscriber  Required. Subscription to
   *              an Observable object.
   * @returns     {NodeJS.Timeout}  Result of a call to setTimeout().
   * @description Starts a progress notification interval timeout that is able
   *              to provide regular updates to an Observable object.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static start(taskStatusMessages:TaskStatusMessages, interval:number, result:SfdxFalconResult, subscriber:Subscriber<unknown>):NodeJS.Timeout {

    // Set function-local debug namespace and examine incoming arguments.
    const dbgNsLocal = `${dbgNs}TaskProgressNotifications:start`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidObject      (taskStatusMessages,  `${dbgNsLocal}`,  `taskStatusMessages`);
    TypeValidator.throwOnNullInvalidNumber      (interval,            `${dbgNsLocal}`,  `interval`);
    TypeValidator.throwOnEmptyNullInvalidObject (subscriber,          `${dbgNsLocal}`,  `subscriber`);
    TypeValidator.throwOnInvalidInstance        (result, SfdxFalconResult, `${dbgNsLocal}`, `result`);

    // Initialize the timeoutRefs array if this is the first time star() is called.
    if (TypeValidator.isNullInvalidArray(TaskProgressNotifications.timeoutRefs)) {
      TaskProgressNotifications.timeoutRefs = new Array();
    }

    // Set the interval and save a ref to it.
    const timeoutRef = setInterval(progressNotification, interval, result, taskStatusMessages, subscriber);
    TaskProgressNotifications.timeoutRefs.push(timeoutRef);

    // return the timeoutRef
    return timeoutRef;
  }
  
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      finish
   * @param       {NodeJS.Timeout}  timeoutObj  Required. The timeout that will
   *              be cleared.
   * @returns     {void}
   * @description Given a Timeout object (ie. the thing that's returned from a
   *              call to setInterval() or setTimeout()), clears that timeout
   *              so that it doesn't execute (or execute again).
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static finish(timeoutObj:NodeJS.Timeout):void {

    // Set an interval for the progressNotification function and return to caller.
    if (timeoutObj) {
      clearInterval(timeoutObj);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      killAll
   * @returns     {void}
   * @description Kills (calls clearInterval()) on ALL of the Timeout Refs that
   *              have been created as part of the SFDX-Falcon notification
   *              system.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static killAll():void {
    if (TypeValidator.isNotEmptyNullInvalidArray(TaskProgressNotifications.timeoutRefs)) {
      for (const timeoutRef of TaskProgressNotifications.timeoutRefs) {
          clearInterval(timeoutRef);
      }
    }
  }

  // Private Members
  /** Holds a reference to every timeout object created as part of the SFDX-Falcon notification process. */
  private static timeoutRefs: NodeJS.Timeout[];

}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    progressNotification
 * @param       {SfdxFalconStatus}  status  Required. Helps determine current running time.
 * @param       {TaskStatusMessages}  taskStatusMessages Required. Determines what gets displayed
 *              as part of the status message and whether or not the runtime gets shown.
 * @param       {Subscriber}  subscriber  Required. `Subscriber` to an `Observable` object.
 * @returns     {void}
 * @description Computes the current Run Time from a `SfdxFalconResult` object and composes a
 *              message that `updateSubscriber()` will handle.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function progressNotification(result:SfdxFalconResult, taskStatusMessages:TaskStatusMessages, subscriber:Subscriber<unknown>):void {

  // Detect if the current Status Message should be updated.
  if (typeof taskStatusMessages.nextMessage === 'string' && taskStatusMessages.nextMessage) {
    taskStatusMessages.prevMessage    = taskStatusMessages.currentMessage;
    taskStatusMessages.currentMessage = taskStatusMessages.nextMessage;
    taskStatusMessages.nextMessage    = null;
  }
  else {

    // Current message should NOT be upated.  If showTimer is also FALSE, just exit.
    if (taskStatusMessages.showTimer !== true) {
      return;
    }
  }

  // Create the Status Message. Prepend with task duration if showTimer is TRUE.
  const statusMessage = `${taskStatusMessages.showTimer ? `[${result.durationString}]` : ``} ${taskStatusMessages.currentMessage}`;

  // Update the Subscriber so it knows to display the updated Status Message.
  updateSubscriber(subscriber, `${statusMessage}`);
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskStatusMessage
 * @description Simple data storage class used by the the `TaskProgressNotification` class to create
 *              task status messages as part of the operation of an `ObservableTaskResult` instance.
 * @private
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
class TaskStatusMessage {

  // Private class members
  private readonly  _taskStatusMessages:  TaskStatusMessages;

  // Public accessors
  public get message():string {
    return this._taskStatusMessages.currentMessage;
  }
  public set message(msg:string) {
    TypeValidator.throwOnNullInvalidString(msg, `${dbgNs}TaskStatusMessage:message:msg:`, `msg`);
    this._taskStatusMessages.nextMessage = msg;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TaskStatusMessage
   * @param       {TaskStatusMessages}  taskStatusMessages  Required. Object
   *              containing Task Status Messages. Must be the same object that
   *              will be passed to `TaskProgressNotifications.start()` to allow
   *              external control of what is displayed for the status message
   *              of the associated `SfdxFalconTask`.
   * @description Constructs a `TaskStatusMessage` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(taskStatusMessages:TaskStatusMessages) {
    const dbgNsLocal = `${dbgNs}TaskStatusMessage:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    TypeValidator.throwOnEmptyNullInvalidObject(taskStatusMessages, `${dbgNsLocal}`, `taskStatusMessages`);
    this._taskStatusMessages = taskStatusMessages;
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    updateSubscriber
 * @param       {Subscriber<unknown>} subscriber  Required. `Subscriber` to an `Observable` object.
 * @param       {string}  message Required. The message to be passed to the `next()` callback of the
 *              `Observer` that the `Subscriber` is watching.
 * @returns     {void}
 * @description Given an RxJS `Subscriber` object and a message, posts the provided message to the
 *              `next()` callback of the `Observer` that the `Subscriber` is watching, but **ONLY**
 *              if we can verify that the caller provided a valid `Subscriber` object.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function updateSubscriber(subscriber:Subscriber<unknown>, message:string):void {
  if (TypeValidator.isEmptyNullInvalidObject(subscriber))   return;
  if (TypeValidator.isNullInvalidFunction(subscriber.next)) return;
  if (TypeValidator.isNullInvalidString(message))           return;
  subscriber.next(message);
}
