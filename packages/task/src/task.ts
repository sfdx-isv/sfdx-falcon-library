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
//import  Listr               = require('listr');
import  {Observable}        from  'rxjs';   // Class. Used to communicate status with Listr.
import  {Subscriber}        from  'rxjs';   // Class. Implements the Observer interface and extends the Subscription class.

// Import SFDX-Falcon Libraries
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TaskProgressNotifications} from  '@sfdx-falcon/notifications'; // Class. Manages progress notification messages for SFDX-Falcon Tasks.
import  {SfdxFalconResult}          from  '@sfdx-falcon/result';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {AsyncUtil}                 from  '@sfdx-falcon/util';          // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}      from  '@sfdx-falcon/result';  // Enum. Represents the different types of sources where Results might come from.
import  {ErrorOrResult}             from  '@sfdx-falcon/result';  // Type. Alias to a combination of Error or SfdxFalconResult.
//import  {Subscriber}            from  '@sfdx-falcon/types';   //  Type. Alias to an rxjs Subscriber<unknown> type.


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
export type ExtTaskFunction<CTX=ListrContext> = (listrContext:CTX, thisTask:ListrTaskWrapper<CTX>, sharedData:object) => Promise<void>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Represents an externally defined `Skip` function. Extends the standard `ListrSkip` function type by adding a `sharedData` parameter after the `listrContext` parameter.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ExtSkipFunction<CTX=ListrContext> = (ctx:CTX, sharedData:object) => void | boolean | string | Promise<boolean>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Represents an externally defined `Enabled` function. Extends the standard `ListrEnabled` function type by adding a `sharedData` parameter after the `listrContext` parameter.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ExtEnabledFunction<CTX=ListrContext> = (ctx:CTX, sharedData:object) => boolean | Promise<boolean> | Observable<boolean>;

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
  subscriber:     Subscriber<unknown>;
  /** Shared Data object that the associated `SfdxFalconTask` should have access to. */
  sharedData:     object;
  /** The Debug Namespace that should be used within this `ObservableTaskResult` instance */
  dbgNsExt:       string;
  /** The baseline status message for this `ObservableTaskResult`. */
  statusMsg:      string;
  /** The minimum amount of time, in seconds, that this `ObservableTaskResult` should run. Useful for keeping a status message on screen long enough for the user to see it. */
  minRuntime:     number;
  /** Specifies whether or not the status message shown by the `ListrTask` will be continually updated with an "elapsed seconds" counter. */
  showTimer:      boolean;
  /** The `SfdxFalconResult` that will be the parent of the Result associated with this `ObservableTaskResult` instance */
  parentResult?:  SfdxFalconResult;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Options that can be set during the construction of an `SfdxFalconTask` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconTaskOptions<CTX=ListrContext> {
  /** The title of the task. */
  title:        string;
  /** The context (ie. `this`) that the `SfdxFalconTask` being created should be hooked into. */
  context:      Context;
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
  /** The `SfdxFalconResult` that will be the parent of the Result associated with this `SfdxFalconTask` instance */
  parentResult?:  SfdxFalconResult;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Models the information stored as the "detail" of an `SfdxFalconResult` that's contained
 * by an `ObservableTaskResult` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface TaskResultDetail {
  sharedData:           object;
  listrContext:         ListrContext;
  listrTask:            ListrTaskWrapper;
  statusMsg:            string;
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
  private _listrContext:        ListrContext;
  private _listrTask:           ListrTaskWrapper;
  private _subscriber:          Subscriber<unknown>;
  private _sharedData:          object;
  private _statusMsg:           string;
  private _minRunTime:          number;
  private _showTimer:           boolean;
  private _parentResult:        SfdxFalconResult;
  private _taskResult:          SfdxFalconResult;
  private _taskResultDetail:    TaskResultDetail;
  private _notificationTimer:   NodeJS.Timeout;

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
    TypeValidator.throwOnEmptyNullInvalidObject (opts, `${dbgNsLocal}`, `opts`);
    TypeValidator.throwOnNullInvalidObject      (opts.listrContext, `${dbgNsLocal}`,  `opts.listrContext`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.listrTask,    `${dbgNsLocal}`,  `opts.listrTask`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.subscriber,   `${dbgNsLocal}`,  `opts.subscriber`);
    TypeValidator.throwOnNullInvalidObject      (opts.sharedData,   `${dbgNsLocal}`,  `opts.sharedData`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,     `${dbgNsLocal}`,  `opts.dbgNsExt`);
    TypeValidator.throwOnNullInvalidString      (opts.statusMsg,    `${dbgNsLocal}`,  `opts.statusMsg`);
    TypeValidator.throwOnNullInvalidNumber      (opts.minRuntime,   `${dbgNsLocal}`,  `opts.minRuntime`);
    TypeValidator.throwOnNullInvalidBoolean     (opts.showTimer,    `${dbgNsLocal}`,  `opts.showTimer`);

    // Validate the OPTIONAL contents of the options object.
    if (opts.parentResult) TypeValidator.throwOnNullInvalidInstance(opts.parentResult, SfdxFalconResult, `${dbgNsLocal}`, `opts.parentResult`);

    // Validate the DEEPER contents of the options object.
    TypeValidator.throwOnNullInvalidInstance(opts.subscriber, Subscriber, `${dbgNsLocal}`, `opts.subscriber`);

    // Initialize member variables.
    this._dbgNsExt          = opts.dbgNsExt;
    this._listrContext      = opts.listrContext;
    this._listrTask         = opts.listrTask;
    this._subscriber        = opts.subscriber;
    this._sharedData        = opts.sharedData;
    this._statusMsg         = opts.statusMsg;
    this._minRunTime        = opts.minRuntime;
    this._showTimer         = opts.showTimer;
    this._parentResult      = opts.parentResult;

    // Initialize an SFDX-Falcon Result object.
    this._taskResult = new SfdxFalconResult (this._dbgNsExt, SfdxFalconResultType.TASK,
                                            { startNow:       true,     // Start the internal clock for this result on creation
                                              bubbleError:    false,    // Let the parent Result handle errors (no bubbling)
                                              bubbleFailure:  false});  // Let the parent Result handle failures (no bubbling)
    SfdxFalconDebug.obj(`${dbgNsLocal}:_taskResult:`, this._taskResult);

    // Initialize the Task Result Detail.
    this._taskResultDetail = {
      sharedData:           this._sharedData,
      listrContext:         this._listrContext,
      listrTask:            this._listrTask,
      statusMsg:            this._statusMsg
    };
    this._taskResult.setDetail(this._taskResultDetail);
    SfdxFalconDebug.obj(`${dbgNsLocal}:_taskResult.detail:`, this._taskResult.detail);

    // Set the initial Task Detail message.
    if (this._showTimer) {
      this._subscriber.next(`[0s] ${this._statusMsg}`);
    }
    else {
      this._subscriber.next(`${this._statusMsg}`);
    }

    // Set up Task Progress Notifications and store a reference to the Timer.
    this._notificationTimer = TaskProgressNotifications.start(this._statusMsg, 1000, this._taskResult, this._subscriber);
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
    if (this._parentResult instanceof SfdxFalconResult) {
      try {
        this._parentResult.addChild(this._taskResult);
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
    if (this._parentResult instanceof SfdxFalconResult) {
      try {
        this._parentResult.addChild(this._taskResult);
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
  private _callingContext:  Context;
  private _dbgNsExt:        string;
  private _statusMsg:       string;
  private _minRuntime:      number;
  private _showTimer:       boolean;
  private _parentResult:    SfdxFalconResult;
  private _otr:             ObservableTaskResult;

  // Private accessors.
  private get _sharedData():object {
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
    const dbgNsLocal = `${dbgNs}SfdxFalconTask:constructor`;
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
    if (typeof resolvedOpts.skip          !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.skip,     `${dbgNsLocal}`,  `resolvedOpts.skip`);
    if (typeof resolvedOpts.enabled       !== 'undefined')  TypeValidator.throwOnNullInvalidFunction(resolvedOpts.enabled,  `${dbgNsLocal}`,  `resolvedOpts.enabled`);
    if (typeof resolvedOpts.parentResult  !== 'undefined')  TypeValidator.throwOnNullInvalidInstance(resolvedOpts.parentResult, SfdxFalconResult, `${dbgNsLocal}`,  `resolvedOpts.parentResult`);
    TypeValidator.throwOnEmptyNullInvalidObject (resolvedOpts.context,    `${dbgNsLocal}`,  `resolvedOpts.context`);
    TypeValidator.throwOnEmptyNullInvalidString (resolvedOpts.dbgNsExt,   `${dbgNsLocal}`,  `resolvedOpts.dbgNsExt`);
    TypeValidator.throwOnNullInvalidString      (resolvedOpts.statusMsg,  `${dbgNsLocal}`,  `resolvedOpts.statusMsg`);
    TypeValidator.throwOnNullInvalidNumber      (resolvedOpts.minRuntime, `${dbgNsLocal}`,  `resolvedOpts.minRuntime`);
    TypeValidator.throwOnNullInvalidBoolean     (resolvedOpts.showTimer,  `${dbgNsLocal}`,  `resolvedOpts.showTimer`);

    // Initialize Listr-specific member variables.
    this._title           = resolvedOpts.title;
//    this._extTask         = resolvedOpts.task.bind(resolvedOpts.context);
    this._extTask         = resolvedOpts.task;
    this._extSkip         = resolvedOpts.skip;
    this._extEnabled      = resolvedOpts.enabled;

    // Initialize SFDX-Falcon Task-specific variables.
    this._callingContext  = resolvedOpts.context;
    this._dbgNsExt        = resolvedOpts.dbgNsExt;
    this._statusMsg       = resolvedOpts.statusMsg;
    this._minRuntime      = resolvedOpts.minRuntime;
    this._showTimer       = resolvedOpts.showTimer;
    this._parentResult    = resolvedOpts.parentResult;
    
    // Make sure that the external context has a sharedData object.
    this.validateSharedData();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {ListrTask}
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build():ListrTask {

    // Set function-local debug namespace.
    const dbgNsLocal = `${dbgNs}SfdxFalconTask:build`;

    // Build the specialized Observer based task.
    this._task = (listrContext:ListrContext, thisTask:ListrTaskWrapper) => {
      return new Observable((subscriber:Subscriber<unknown>) => {

        // Initialize an OTR (Observable Task Result).
        this._otr = new ObservableTaskResult({
          listrContext:   listrContext,
          listrTask:      thisTask,
          subscriber:     subscriber,
          sharedData:     this._sharedData,
          dbgNsExt:       this._dbgNsExt,
          statusMsg:      this._statusMsg,
          minRuntime:     this._minRuntime,
          showTimer:      this._showTimer,
          parentResult:   this._parentResult
        });

        // Initialize the External Task that's associated with this instance.
        let extTaskPromise:Promise<void>;
        try {
          extTaskPromise = this._extTask(listrContext, thisTask, this._sharedData);
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
      this._skip    = (listrContext:ListrContext) => this._extSkip(listrContext, this._sharedData);
    }
    if (typeof this._extEnabled === 'function') {
      this._enabled = (listrContext:ListrContext) => this._extEnabled(listrContext, this._sharedData);
    }
    
    // Construct and return a ListrTask
    return {
      title:    this._title,
      task:     this._task,
      enabled:  this._enabled,
      skip:     this._skip
    } as ListrTask;
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
