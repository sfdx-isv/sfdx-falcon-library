//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/builder-library/src/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports "builder" functions for Tasks, Questions, and Task Bundles.
 * @description   Exports a collection of pre-defined `Builder` objects that allow quick creation
 *                of SFDX-Falcon Tasks, Questions, and Task Bundles. Allows developers to quickly
 *                build common Task and Interview-driven workflows in their CLI plugins.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}     from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult, GeneratorStatus}    from '@sfdx-falcon/status';     // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

import  {ExternalContext}     from  '@sfdx-falcon/task';
import  {ListrObject}         from  '@sfdx-falcon/types';     // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).

// Import from question.
import  * as QuestionsBuilder from  './questions';

// Import from task.
import  * as TaskBuilder      from  './tasks';

// Re-export everything.
export {
  TaskBuilder,
  QuestionsBuilder
};

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);




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
 * @description ???
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

  // Abstract Public Methods;
  public abstract build():unknown;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SingleTaskBuilder
 * @extends     Builder
 * @description ???
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SingleTaskBuilder extends Builder {

  public abstract build():ListrObject;
}




export class CloneGitRemote extends SingleTaskBuilder {
  public build():ListrObject {
    return null;
  }
}

const cGR = new CloneGitRemote({dbgNs:''});
