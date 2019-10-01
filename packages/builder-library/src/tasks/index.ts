//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/builder-library/src/tasks/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a library of Task Builder functions.
 * @description   Exports a library of Task Builder functions.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.
import  {Builder}             from  '@sfdx-falcon/builder';   // ???

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import SFDX-Falcon Types
import  {ListrObject}         from  '@sfdx-falcon/types';     // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).

// Import Package-Local Code
import  * as GitTasks   from  './git';
import  * as SfdxTasks  from  './sfdx';

// Re-Export Git and SFDX Tasks
export {
  GitTasks,
  SfdxTasks
};

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder:task';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SingleTaskBuilder
 * @extends     Builder
 * @description ???
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SingleTaskBuilder extends Builder {

  // Abstract Public Methods.
  public abstract build():ListrObject;
}
