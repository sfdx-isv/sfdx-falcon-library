//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/environment/src/local.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       INSERT_SUMMARY_HERE
 * @description   INSERT_DESCRIPTION_HERE
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import  {Aliases}           from  '@salesforce/core';       // Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
//import  {AuthInfo}          from  '@salesforce/core';       // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will use to keep tokens active.
//import  {Connection}        from  '@salesforce/core';       // Handles connections and requests to Salesforce Orgs.

// Import SFDX-Falcon Libraries
//import  {AsyncUtil}                 from  '@sfdx-falcon/util';          // Library. Async utility helper functions.
//import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconResult}          from  '@sfdx-falcon/status';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import SFDX-Falcon Types
//import  {SfdxFalconResultType}      from  '@sfdx-falcon/status';  // Enum. Represents the different types of sources where Results might come from.
//import  {ErrorOrResult}             from  '@sfdx-falcon/status';  // Type. Alias to a combination of Error or SfdxFalconResult.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:sfdx-environment:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents elements of the local Git Environment that are required by the calling code.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface LocalEnvironmentRequirements {
  requireGit:       boolean;
  gitRemoteUri:     string;
  localFile:        string;
  localDirectory:   string;
}



//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Alias for the `this` context from the caller.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type Context = any;  // tslint:disable-line: no-any

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the full suite of Task Status Message strings that are used by the
 * `TaskProgressNotifications.progressNotification()` function to display status messages to the
 * user while a `ListrTask` is running.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface TaskStatusMessages {
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

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ObservableTaskResult
   * @param       {ObservableTaskResultOptions} opts  Required. Options that
   *              determine how this `ObservableTaskResult` will be constructed.
   * @description Constructs an `ObservableTaskResult` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘

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


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconTask
 * @description Abstraction of a single Listr Task with a lot of extra functionality bundled in.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconTask
   * @param       {SfdxFalconTaskOptions} opts  Required. Options used to
   *              construct this instance of an `SfdxFalconTask` object.
   * @description Constructs an `SfdxFalconTask` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘

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
