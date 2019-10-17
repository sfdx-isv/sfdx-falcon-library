//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder/src/builder.ts
 * @summary       Exports "builder" functions for Tasks, Questions, and Task Bundles.
 * @description   Exports a collection of functions for building pre-defined SFDX-Falcon Tasks,
 *                Questions, and Task Bundles. Allows developers to quickly build common Task and
 *                Interview-driven workflows in their CLI plugins.
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
export interface ExternalContext {
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

/*
 * NOTES:
 * I want to build a base class that all "builders" can derive from.
 * ALL builders must expect an ExternalContext object as a parameter in their constructors.
 * I'll build builders for Tasks, Questions, and maybe even TaskBundles
 * The Builder base class will know how to extract key info out of the debugnamespace
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

  protected get dbgNsExt():string {
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
    const className   = `Builder`;
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = determineDbgNsExt(extCtx, className, funcName, dbgNsLocal);

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

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDbgNsExt
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  className Required. Name of the class that will use the external `dbgNs`.
 * @param       {string}  funcName  Required. Name of the function that will use the external `dbgNs`.
 * @param       {string}  dbgNsAlt  Required. Alternative DbgNs to be used if the External Context
 *              did not contain a valid `dbgNs` string.
 * @returns     {string}  The correct External Debug Namespace based on the provided values.
 * @description Given an `ExternalContext`, the name of the calling class and function, as well as
 *              an alternative debug namespace to use if the `ExternalContext` doesn't have the
 *              appropriate base, returns the correct External Debug Namespace string.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function determineDbgNsExt(extCtx:ExternalContext, className:string, funcName:string, dbgNsAlt:string):string {

  // Define local debug namespace.
  const dbgNsLocal = `${dbgNs}:determineDbgNsExt`;

  // Validate arguments.
  TypeValidator.throwOnEmptyNullInvalidString(className,  `${dbgNsLocal}`,  `className`);
  TypeValidator.throwOnEmptyNullInvalidString(funcName,   `${dbgNsLocal}`,  `funcName`);
  TypeValidator.throwOnEmptyNullInvalidString(dbgNsAlt,   `${dbgNsLocal}`,  `dbgNsAlt`);

  // Construct the appropriate External Debug Namespace.
  const dbgNsExt =  (TypeValidator.isNotEmptyNullInvalidObject(extCtx) && TypeValidator.isNotEmptyNullInvalidString(extCtx.dbgNs))
                    ? `${extCtx.dbgNs}:${className}:${funcName}`
                    : dbgNsAlt;
  SfdxFalconDebug.str(`${dbgNsLocal}:dbgNsExt:`, dbgNsExt);
  return dbgNsExt;
}
