//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder/src/external-context.ts
 * @summary       Exports the `ExternalContext` class.
 * @description   Exports the `ExternalContext` class.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {GeneratorStatus}     from  '@sfdx-falcon/status';    // Class. Specialized object used by Generators derived from SfdxFalconGenerator to track the running state of the Generator (eg. aborted or completed) as well as a collection of status messages that can be used to print out a final status report when the Generator is complete.
import  {SfdxFalconResult}    from  '@sfdx-falcon/status';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of key data structures that represent the overall context of the external
 * environment inside of which some a set of specialized logic will be run.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ExternalContextOptions {
  /** Required. The Debug Namespace in use by the externally defined logic. Makes it easier for users to dial-in on the specific debug operations in code that consumes an External Context. */
  dbgNs:            string;
  /** Optional. Reference to the context (ie. `this`) of the externally defined logic. */
  context?:         object;
  /** Optional. Provides a mechanism for internal logic to share information with the external context. */
  sharedData?:      object;
  /** Optional. Reference to an `SfdxFalconResult` object that should be used as the parent result for any `SfdxFalconResult` objects used by the internal logic. */
  parentResult?:    SfdxFalconResult;
  /** Optional. Reference to a `GeneratorStatus` object. Allows internal logic to directly specify `success`, `error`, and `warning` messages. */
  generatorStatus?: GeneratorStatus;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ExternalContext
 * @description Collection of key data structures that represent the overall context of the external
 *              environment inside of which some a set of specialized logic will be run.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ExternalContext {

  /** The Debug Namespace in use by the externally defined logic. Makes it easier for users to dial-in on the specific debug operations in code that consumes an External Context. */
  public dbgNs:             string;
  /** Reference to the context (ie. `this`) of the externally defined logic. */
  public context?:          object;
  /** Provides a mechanism for internal logic to share information with the external context. */
  public sharedData?:       object;
  /** Reference to an `SfdxFalconResult` object that should be used as the parent result for any `SfdxFalconResult` objects used by the internal logic. */
  public parentResult?:     SfdxFalconResult;
  /** Reference to a `GeneratorStatus` object. Allows internal logic to directly specify `success`, `error`, and `warning` messages. */
  public generatorStatus?:  GeneratorStatus;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ExternalContext
   * @param       {ExternalContextOptions} opts  Required.
   * @description Constructs an ExternalContext object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ExternalContextOptions|string) {

    // Define local and external debug namespaces.
    const className   = this.constructor.name;
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${className}:${funcName}`;

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Make sure we got *something* from the caller.
    TypeValidator.throwOnNullUndefined(opts, `${dbgNsLocal}`, `Constructor Arguments`);

    // Make sure that anything that's NOT a string is definitely an object.
    if (typeof opts !== 'string') TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsLocal}`, `ExternalContextOptions`);

    // If the caller provided a string, assume it's the Debug Namespace and create an ExternalContextOptions object.
    if (typeof opts === 'string') {
      opts = {
        dbgNs:  opts
      } as ExternalContextOptions;
    }

    // Finish validation knowing that we're working with an ExternalContextOptions object.
    TypeValidator.throwOnEmptyNullInvalidString(opts.dbgNs, `${dbgNsLocal}`,  `ExternalContextOptions.dbgNs`);
    if (opts.context)         TypeValidator.throwOnEmptyNullInvalidObject (opts.context,                            `${dbgNsLocal}`,  `ExternalContextOptions.context`);
    if (opts.sharedData)      TypeValidator.throwOnNullInvalidObject      (opts.sharedData,                         `${dbgNsLocal}`,  `ExternalContextOptions.sharedData`);
    if (opts.parentResult)    TypeValidator.throwOnInvalidInstance        (opts.parentResult,     SfdxFalconResult, `${dbgNsLocal}`,  `ExternalContextOptions.parentResult`);
    if (opts.generatorStatus) TypeValidator.throwOnInvalidInstance        (opts.generatorStatus,  GeneratorStatus,  `${dbgNsLocal}`,  `ExternalContextOptions.generatorStatus`);

    // Initialize member vars.
    this.dbgNs            = opts.dbgNs;
    this.context          = opts.context;
    this.sharedData       = opts.sharedData;
    this.generatorStatus  = opts.generatorStatus;
    this.parentResult     = opts.parentResult;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      copy
   * @param       {string}  newDbgNs  Required. Name of the new Debug Namespace
   *              that will be used by the copied `ExternalContext` object.
   * @returns     {ExternalContext}
   * @description Makes a shallow copy of this `ExternalContext` object with a
   *              new Debug Namespace as specified by the caller.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public copy(newDbgNs:string):ExternalContext {

    // Define local and external debug namespaces.
    const className   = this.constructor.name;
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${className}:${funcName}`;

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidString(newDbgNs, `${dbgNsLocal}`,  `newDbgNs`);

    // Build and return a new ExternalContext object with a new Debug Namespace.
    return new ExternalContext({
      dbgNs:            newDbgNs,
      context:          this.context,
      sharedData:       this.sharedData,
      generatorStatus:  this.generatorStatus,
      parentResult:     this.parentResult
    });
  }
}
