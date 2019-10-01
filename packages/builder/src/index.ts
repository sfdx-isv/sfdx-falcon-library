//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/builder/src/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports "builder" functions for Tasks, Questions, and Task Bundles.
 * @description   Exports a collection of functions for building pre-defined SFDX-Falcon Tasks,
 *                Questions, and Task Bundles. Allows developers to quickly build common Task and
 *                Interview-driven workflows in their CLI plugins.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {GeneratorStatus}     from  '@sfdx-falcon/status';    // Class. Specialized object used by Generators derived from SfdxFalconGenerator to track the running state of the Generator (eg. aborted or completed) as well as a collection of status messages that can be used to print out a final status report when the Generator is complete.
import  {SfdxFalconResult}    from  '@sfdx-falcon/status';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

//TODO: Remove definition of ExternalContext from @sfdx-falcon/task and point deps to here
//import  {ExternalContext}     from  '@sfdx-falcon/task';

// Import code for re-export.
import  {QuestionsBuilder}    from  './questions';
import  {TaskBuilder}         from  './task';
import  {TaskGroupBuilder}    from  './task';

// Re-export everything.
export  {QuestionsBuilder};
export  {TaskBuilder};
export  {TaskGroupBuilder};

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of key data structures that represent the overall context of the external
 * environment inside which an `SfdxFalconTask` is running.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ExternalContext {
  /** Required. The Debug Namespace in use by the externally defined logic. Makes it easier for users to dial-in on the specific debug operations in code that consumes an External Context. */
  dbgNs: string;
  /** Optional. Reference to the context (ie. `this`) of the externally defined logic. */
  context?:    object;
  /** Optional. Provides a mechanism for internal logic to share information with the external context. */
  sharedData?: object;
  /** Optional. Reference to an `SfdxFalconResult` object that should be used as the parent result for any `SfdxFalconResult` objects used by the internal logic. */
  parentResult?: SfdxFalconResult;
  /** Optional. Reference to a `GeneratorStatus` object. Allows internal logic to directly specify `success`, `error`, and `warning` messages. */
  generatorStatus?: GeneratorStatus;
}


/**
 * I want to build a base class that all "builders" can derive from.
 * ALL builders must expect an ExternalContext object as a parameter in their constructors.
 * I'll build builders for Tasks, Questions, and maybe even TaskBuilders
 * The Builder base class will know how to extract key info out of the debugnamespace
 *
 * Question: Can a base class constructor know the name of the highest-order constructor in the derived classes?
 *
 */


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       Builder
 * @description Abstract Class. Basis for creating "builder" classes that can create Tasks,
 *              Questions, and more.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class Builder {
  protected readonly extCtx:  ExternalContext;

  protected get dbgNs():string {
    return this.extCtx.dbgNs;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Builder
   * @param       {ExternalContext} [extCtx]  Optional. Provides information
   *              about the External Context into which a derived Builder will
   *              need to function.
   * @description Constructs a `Builder` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx?:ExternalContext) {

    // Define the local debug namespace.
    const funcName    = `constructor`;
    const dbgNsLocal = `${dbgNs}:${funcName}`;
    const dbgNsExt    = (typeof extCtx === 'object' && typeof extCtx.dbgNs === 'string' && extCtx.dbgNs) ? `${extCtx.dbgNs}:Builder:${funcName}` : dbgNsLocal;

    // Debug the incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // If an External Context was provided, make sure it's a non-null, non-empty object.
    // Otherwise, set some baseline defaults for the External Context.
    if (typeof extCtx !== 'undefined') {
      TypeValidator.throwOnEmptyNullInvalidObject(extCtx, `${dbgNsExt}`, `ExternalContext`);
    }
    else {
      extCtx = {
        dbgNs:            `${dbgNs}`,
        sharedData:       {},
        parentResult:     null,
        generatorStatus:  null
      };
    }

    // Validate the REQUIRED members of the External Context.
    TypeValidator.throwOnEmptyNullInvalidString(extCtx.dbgNs, `${dbgNsExt}`, `ExternalContext.dbgNs`);

    // Validate the OPTIONAL members of the External Context.
    if (extCtx.sharedData)      TypeValidator.throwOnNullInvalidObject  (extCtx.sharedData,                         `${dbgNsExt}`, `ExternalContext.sharedData`);
    if (extCtx.parentResult)    TypeValidator.throwOnNullInvalidInstance(extCtx.parentResult,     SfdxFalconResult, `${dbgNsExt}`, `ExternalContext.parentResult`);
    if (extCtx.generatorStatus) TypeValidator.throwOnNullInvalidInstance(extCtx.generatorStatus,  GeneratorStatus,  `${dbgNsExt}`, `ExternalContext.generatorStatus`);

    // Initialize the External Context member var.
    this.extCtx = extCtx;
    SfdxFalconDebug.obj(`${dbgNsLocal}:this.extCtx:`, this.extCtx);

  }

  // Abstract Public Methods.
  public abstract build():unknown;
}
