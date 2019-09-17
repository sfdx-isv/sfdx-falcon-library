//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/status/src/generator-status.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the `GeneratorStatus` class.
 * @description   Exports the `GeneratorStatus` class. Creates a standardized way of providing
 *                a final status report after the completion of an `SfdxFalconGeneratorCommand`
 *                derived command.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';       // Class. Provides a system for sending debug info to the console.
import  {SfdxFalconError}     from  '@sfdx-falcon/error';       // Class. Specialized Error object. Wraps SfdxError.

// Import Internal Classes & Functions
import  {printStatusMessages} from  './ux';                     // Function. Prints an array of Status Messages.

// Import SFDX-Falcon Types
import  {StatusMessage}       from  '@sfdx-falcon/types';       // Interface. Interface. Represents a "state aware" message. Contains a title, a message, and a type.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:status:generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       GeneratorStatus
 * @summary     Status tracking object for use with Generators derived from `SfdxFalconGenerator`.
 * @description Specialized object used by Generators derived from `SfdxFalconGenerator` to track
 *              the running state of the Generator (eg. `aborted` or `completed`) as well as
 *              a collection of status messages that can be used to print out a final status report
 *              when the Generator is complete.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export class GeneratorStatus {

  // Class Members
  public aborted:    boolean;
  public completed:  boolean;
  public running:    boolean;
  public messages:   StatusMessage[];

  // Public accessors
  public get hasError():boolean {
    for (const message of this.messages) {
      if (message.type === 'error') {
        return true;
      }
    }
    return false;
  }
  public get hasInfo():boolean {
    for (const message of this.messages) {
      if (message.type === 'info') {
        return true;
      }
    }
    return false;
  }
  public get hasSuccess():boolean {
    for (const message of this.messages) {
      if (message.type === 'success') {
        return true;
      }
    }
    return false;
  }
  public get hasWarning():boolean {
    for (const message of this.messages) {
      if (message.type === 'warning') {
        return true;
      }
    }
    return false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  GeneratorStatus
   * @description Constructs a GeneratorStatus object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor() {
    this.aborted    = false;
    this.running    = false;
    this.completed  = false;
    this.messages   = new Array<StatusMessage>();
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      start
   * @param       {statusMessage} statusMessage Optional. Allows the caller to
   *              set an initial status message upon starting this object.
   * @returns     {void}
   * @description Starts this Generator Status object by changing the "running"
   *              property to TRUE.
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public start(statusMessage?:StatusMessage):void {

    // Define function-local debug namespace.
    const funcName    = `start`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    if (this.aborted || this.completed) {
      throw new SfdxFalconError( `Can not call start() on an aborted or completed Generator Status object`
                               , `GeneratorStatusError`
                               , `${dbgNsLocal}`);
    }
    this.running    = true;
    this.aborted    = false;
    this.completed  = false;
    if (typeof statusMessage !== 'undefined') {
      this.messages.push(statusMessage);
    }
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      abort
   * @param       {statusMessage} statusMessage Optional. Allows the caller to
   *              set an initial status message upon aborting this object.
   * @returns     {void}
   * @description Aborts this Generator Status object by changing the "running"
   *              property to FALSE and the "aborted" property to TRUE.
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public abort(statusMessage:StatusMessage):void {

    // Define function-local debug namespace.
    const funcName    = `abort`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    if (this.completed || this.running === false) {
      throw new SfdxFalconError( `Can not call abort() on a non-running or completed Generator Status object`
                               , `GeneratorStatusError`
                               , `${dbgNsLocal}`);
    }
    this.aborted    = true;
    this.completed  = false;
    this.running    = false;
    if (typeof statusMessage !== 'undefined') {
      this.messages.push(statusMessage);
    }
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      complete
   * @param       {statusMessage[]} statusMessages  Optional. Allows the caller to
   *              set an array of status message upon completing this object.
   * @returns     {void}
   * @description Completes this Generator Status object by changing the "running"
   *              property to FALSE and the "completed" property to TRUE.
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public complete(statusMessages?:StatusMessage[]):void {

    // Define function-local debug namespace.
    const funcName    = `complete`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    if (this.aborted || this.running === false) {
      throw new SfdxFalconError( `Can not call complete() on a non-running or aborted Generator Status object`
                               , `GeneratorStatusError`
                               , `${dbgNsLocal}`);
    }
    this.completed  = true;
    this.aborted    = false;
    this.running    = false;
    if (Array.isArray(statusMessages)) {
      for (const statusMessage of statusMessages) {
        this.messages.push(statusMessage);
      }
    }
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addMessage
   * @param       {statusMessage} statusMessage  Required. Status Message to add
   *              to this Generator Status object.
   * @returns     {void}
   * @description Given a Status Message object, adds that Status Message to the
   *              messages array of this Generator Status object.
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public addMessage(statusMessage:StatusMessage):void {

    // Define function-local debug namespace.
    const funcName    = `addMessage`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    if (typeof statusMessage.title !== 'string') {
      throw new SfdxFalconError( `Expected string for statusMessage.title but got '${typeof statusMessage.title}'`
                               , `TypeError`
                               , `${dbgNsLocal}`);
    }
    if (typeof statusMessage.message !== 'string') {
      throw new SfdxFalconError( `Expected string for statusMessage.message but got '${typeof statusMessage.message}'`
                               , `TypeError`
                               , `${dbgNsLocal}`);
    }
    if (typeof statusMessage.type !== 'string') {
      throw new SfdxFalconError( `Expected string for statusMessage.type but got '${typeof statusMessage.type}'`
                               , `TypeError`
                               , `${dbgNsLocal}`);
    }
    this.messages.push(statusMessage);
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      printStatusMessages
   * @returns     {void}
   * @description Prints the Status Messages of this object using the UX helper
   *              function printStatusMessages().
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public printStatusMessages():void {
    printStatusMessages(this.messages);
  }
}
