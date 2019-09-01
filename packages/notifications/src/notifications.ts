//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-notifications/index.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @version       1.0.0
 * @license       MIT
 * @requires      module:debug
 * @requires      module:???
 * @summary       SFDX-Falcon helper module for providing notifications
 * @description   ???
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Libraries
import {TypeValidator}      from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug';   // Class. Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconResult}  from  '@sfdx-falcon/result';  // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import SFDX-Falcon Types
import  {Subscriber}        from  '@sfdx-falcon/types';   // Why?

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:notifications:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


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
   * @param       {string}  message Required. The baseline message that will
   *              be used for each interval-based push (ie. `Observer.next()`).
   * @param       {number}  interval  Requiredl The interval in milliseconds.
   *              Use 1000 if you want a per-second progress count.
   * @param       {SfdxFalconResult}  result  Required. The `SfdxFalconResult`
   *              that determines the elapsed time used by the Progress
   *              Progress Notification function.
   * @param       {Subscriber}  subscriber  Required. Subscription to an
   *              Observable object.
   * @returns     {NodeJS.Timeout}  Result of a call to setTimeout().
   * @description Starts a progress notification interval timeout that is able
   *              to provide regular updates to an Observable object.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static start(message:string, interval:number, result:SfdxFalconResult, subscriber:Subscriber):NodeJS.Timeout {

    // Set function-local debug namespace and examine incoming arguments.
    const dbgNsLocal = `${dbgNs}start`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidString      (message,     `${dbgNsLocal}`,  `message`);
    TypeValidator.throwOnNullInvalidNumber      (interval,    `${dbgNsLocal}`,  `interval`);
    TypeValidator.throwOnEmptyNullInvalidObject (subscriber,  `${dbgNsLocal}`,  `subscriber`);
    TypeValidator.throwOnInvalidInstance        (result, SfdxFalconResult, `${dbgNsLocal}`, `result`);

    // Initialize the timeoutRefs array if this is the first time star() is called.
    if (TypeValidator.isNullInvalidArray(TaskProgressNotifications.timeoutRefs)) {
      TaskProgressNotifications.timeoutRefs = new Array();
    }

    // Set the interval and save a ref to it.
    const timeoutRef = setInterval(progressNotification, interval, result, message, subscriber);
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
 * @param       {string}  message Required. Displayed after the elapsed run time.
 * @param       {Subscriber}  subscriber  Required. `Subscriber` to an `Observable` object.
 * @returns     {void}
 * @description Computes the current Run Time from a `SfdxFalconResult` object and composes a
 *              message that `updateSubscriber()` will handle.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function progressNotification(result:SfdxFalconResult, message:string, subscriber:Subscriber):void {
  updateSubscriber(subscriber, `[${result.durationString}] ${message}`);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    updateSubscriber
 * @param       {Subscriber}  subscriber  Required. `Subscriber` to an `Observable` object.
 * @param       {string}  message Required. The message to be passed to the `next()` callback of the
 *              `Observer` that the `Subscriber` is watching.
 * @returns     {void}
 * @description Given an RxJS `Subscriber` object and a message, posts the provided message to the
 *              `next()` callback of the `Observer` that the `Subscriber` is watching, but **ONLY**
 *              if we can verify that the caller provided a valid `Subscriber` object.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function updateSubscriber(subscriber:Subscriber, message:string):void {
  if (TypeValidator.isEmptyNullInvalidObject(subscriber))   return;
  if (TypeValidator.isNullInvalidFunction(subscriber.next)) return;
  if (TypeValidator.isNullInvalidString(message))           return;
  subscriber.next(message);
}
