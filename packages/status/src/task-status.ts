//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/status/src/task-status.ts
 * @summary       Exports the `TaskStatus` class. Simplifies interaction with the status field
 *                of `Observer`-based tasks used by `Listr`.
 * @description   Exports the `TaskStatus` class. Simplifies interaction with the status field
 *                of `Observer`-based tasks used by `Listr`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {Subscriber}        from  'rxjs';                     // Class. Implements the Observer interface and extends the Subscription class.

// Import SFDX-Falcon Libraries
import  {TypeValidator}     from  '@sfdx-falcon/validator';   // Library. Collection of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug';       // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import Internal Classes & Functions
import  {SfdxFalconResult}  from  './sfdx-falcon-result';     // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:status:task';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the full suite of options, including all message strings, that are used by
 * the `updateStatus()` function when creating status update messages for running `ListrTask` objects.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface TaskStatusOptions {
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

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskStatus
 * @description Manages status notification messages for SFDX-Falcon Tasks.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TaskStatus {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      start
   * @param       {TaskStatusOptions}  taskStatusOptions  Required. Object
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
  public static start(taskStatusOptions:TaskStatusOptions, interval:number, result:SfdxFalconResult, subscriber:Subscriber<unknown>):NodeJS.Timeout {

    // Set function-local debug namespace and examine incoming arguments.
    const funcName    = `start`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidObject      (taskStatusOptions,         `${dbgNsLocal}`,  `taskStatusOptions`);
    TypeValidator.throwOnNullInvalidNumber      (interval,                  `${dbgNsLocal}`,  `interval`);
    TypeValidator.throwOnEmptyNullInvalidObject (subscriber,                `${dbgNsLocal}`,  `subscriber`);
    TypeValidator.throwOnInvalidInstance        (result, SfdxFalconResult,  `${dbgNsLocal}`,  `result`);

    // Initialize the timeoutRefs array if this is the first time star() is called.
    if (TypeValidator.isNullInvalidArray(TaskStatus.timeoutRefs)) {
      TaskStatus.timeoutRefs = new Array();
    }

    // Set the interval and save a ref to it.
    const timeoutRef = setInterval(updateStatus, interval, result, taskStatusOptions, subscriber);
    TaskStatus.timeoutRefs.push(timeoutRef);

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
   *              call to `setInterval()` or `setTimeout()`), clears that timeout
   *              so that it doesn't execute (or execute again).
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static finish(timeoutObj:NodeJS.Timeout):void {

    // Clear the interval represented by the Timeout object.
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
    if (TypeValidator.isNotEmptyNullInvalidArray(TaskStatus.timeoutRefs)) {
      for (const timeoutRef of TaskStatus.timeoutRefs) {
          clearInterval(timeoutRef);
      }
    }
  }

  // Private Members
  /** Holds a reference to every timeout object created as part of the `TaskStatus` notification process. */
  private static timeoutRefs: NodeJS.Timeout[];

}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TaskStatusMessage
 * @description Simplifies access to a `TaskStatusOptions` data structure to help ensure that an
 *              external caller can read/set messsages in a way that won't break normal functionality.
 * @private
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TaskStatusMessage {

  // Private class members
  private readonly  _taskStatusOptions:  TaskStatusOptions;

  // Public accessors
  public get message():string {
    return this._taskStatusOptions.currentMessage;
  }
  public set message(msg:string) {
    TypeValidator.throwOnNullInvalidString(msg, `${dbgNs}:TaskStatusMessage:message:msg:`, `msg`);
    this._taskStatusOptions.nextMessage = msg;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TaskStatusMessage
   * @param       {TaskStatusOptions} taskStatusOptions  Required. Task Status
   *              Options object. Contains the strings and settings to be used
   *              by this `TaskStatusMessage`. Must be the same object that
   *              will be passed to `TaskStatus.start()` to allow
   *              external control of what is displayed for the status message
   *              of the associated `SfdxFalconTask`.
   * @description Constructs a `TaskStatusMessage` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(taskStatusOptions:TaskStatusOptions) {
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:TaskStatusMessage:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    TypeValidator.throwOnEmptyNullInvalidObject(taskStatusOptions, `${dbgNsLocal}`, `taskStatusOptions`);
    this._taskStatusOptions = taskStatusOptions;
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    updateStatus
 * @param       {SfdxFalconResult}  result  Required. Helps determine current running time.
 * @param       {TaskStatusOptions} taskStatusOptions Required. Determines what gets displayed
 *              as part of the status message and whether or not the runtime gets shown.
 * @param       {Subscriber}  subscriber  Required. `Subscriber` to an `Observable` object.
 * @returns     {void}
 * @description Computes the current Run Time from a `SfdxFalconResult` object and composes a
 *              message that `updateSubscriber()` will deliver.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function updateStatus(result:SfdxFalconResult, taskStatusOptions:TaskStatusOptions, subscriber:Subscriber<unknown>):void {

  // Detect if the current Status Message should be updated.
  if (typeof taskStatusOptions.nextMessage === 'string' && taskStatusOptions.nextMessage) {
    taskStatusOptions.prevMessage    = taskStatusOptions.currentMessage;
    taskStatusOptions.currentMessage = taskStatusOptions.nextMessage;
    taskStatusOptions.nextMessage    = null;
  }
  else {

    // Current message should NOT be upated.  If showTimer is also FALSE, just exit.
    if (taskStatusOptions.showTimer !== true) {
      return;
    }
  }

  // Create the Status Message. Prepend with task duration if showTimer is TRUE.
  const statusMessage = `${taskStatusOptions.showTimer ? `[${result.durationString}]` : ``} ${taskStatusOptions.currentMessage}`;

  // Update the Subscriber so it knows to display the updated Status Message.
  updateSubscriber(subscriber, `${statusMessage}`);
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
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function updateSubscriber(subscriber:Subscriber<unknown>, message:string):void {
  if (TypeValidator.isEmptyNullInvalidObject(subscriber))   return;
  if (TypeValidator.isNullInvalidFunction(subscriber.next)) return;
  if (TypeValidator.isNullInvalidString(message))           return;
  subscriber.next(message);
}
