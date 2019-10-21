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

// Import Package-Local Classes & Functions
import  {ExternalContext}     from  './external-context';     // Class. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(builder)`);

/*
 * NOTES:
 * I want to build a base class that all "builders" can derive from.
 * ALL builders must expect an ExternalContext object as a parameter in their constructors.
 * I'll build builders for Tasks, Questions, and maybe even TaskBundles
 * The Builder base class will know how to extract key info out of the debugnamespace
 */

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of debug namespace strings.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface DebugNamespaces {
  ext?:     string;
  local?:   string;
  global?:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       Builder
 * @description Abstract Class. Basis for creating "builder" classes that can create Tasks,
 *              Questions, and more.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class Builder {

  // Protected class members
  protected readonly extCtx:  ExternalContext;

  // Protected accessors.
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

    // Define the local and external debug namespaces.
    const baseClassName     = `Builder`;
    const derivedClassName  = this.constructor.name;
    const funcName          = `constructor`;
    const dbgNsLocal        = `${dbgNs}:${baseClassName}:${funcName}`;
    const dbgNsExt          = `${determineDbgNsExt(extCtx, derivedClassName, funcName, dbgNsLocal)}(${baseClassName})`;

    // Debug the incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // If an External Context was provided, make sure it's a valid instance.
    // Otherwise, set some baseline defaults for the External Context.
    if (typeof extCtx !== 'undefined') {
      TypeValidator.throwOnInvalidInstance(extCtx, ExternalContext, `${dbgNsExt}`, `ExternalContext`);
    }
    else {
      extCtx = new ExternalContext({
        dbgNs:            `${dbgNsExt}`,
        context:          {},
        sharedData:       {},
        parentResult:     null,
        generatorStatus:  null
      });
    }

    // Initialize the External Context member var.
    this.extCtx = extCtx;
    SfdxFalconDebug.obj(`${dbgNsLocal}:this.extCtx:`, this.extCtx);
  }

  // Abstract Public Methods.
  public abstract build(buildCtx?:unknown):unknown;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initializeDebug
   * @param       {string}  callerDbgNs Required. The file-local `dbgNs` of the
   *              function/method that inside of which this method is being called.
   * @param       {string}  funcName  Required. Name of the function inside of
   *              which this method is being called.
   * @param       {IArguments}  args  Required. The `arguments` array from the
   *              calling function/method.
   * @returns     {DebugNamespaces}
   * @description Given the name of a function/method and an `arguments` array,
   *              returns a `DebugNamespaces` object after performing both local
   *              and external debug of the provided `arguments`.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected initializeDebug(callerDbgNs:string, funcName:string, args:IArguments):DebugNamespaces {

    // Declare a DebugNamespaces object.
    const dbgNS:DebugNamespaces = {};

    // Define local and external debug namespaces.
    dbgNS.local = `${callerDbgNs}:${this.constructor.name}:${funcName}`;
    dbgNS.ext   = `${this.dbgNsExt}:${this.constructor.name}:${funcName}`;

    // Debug the arguments provided by the caller.
    SfdxFalconDebug.obj(`${dbgNS.local}:arguments:`, args);
    SfdxFalconDebug.obj(`${dbgNS.ext}:arguments:`,   args);

    // Return the Debug Namespaces object.
    return dbgNS;
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDbgNsExt
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  derivedClassName  Required. Name of the class that will use the external `dbgNs`.
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
export function determineDbgNsExt(extCtx:ExternalContext, derivedClassName:string, funcName:string, dbgNsAlt:string):string {

  // Define local debug namespace.
  const dbgNsLocal = `${dbgNs}:determineDbgNsExt`;

  // Validate arguments.
  TypeValidator.throwOnEmptyNullInvalidString(derivedClassName, `${dbgNsLocal}`,  `derivedClassName`);
  TypeValidator.throwOnEmptyNullInvalidString(funcName,         `${dbgNsLocal}`,  `funcName`);
  TypeValidator.throwOnEmptyNullInvalidString(dbgNsAlt,         `${dbgNsLocal}`,  `dbgNsAlt`);

  // Construct the appropriate External Debug Namespace.
  const dbgNsExt =  (TypeValidator.isNotEmptyNullInvalidObject(extCtx) && TypeValidator.isNotEmptyNullInvalidString(extCtx.dbgNs))
                    ? `${extCtx.dbgNs}:${derivedClassName}:${funcName}`
                    : dbgNsAlt;
  SfdxFalconDebug.str(`${dbgNsLocal}:dbgNsExt:`, dbgNsExt);
  return dbgNsExt;
}
