//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/builder-library/src/tasks/sfdx.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a library of Task Builder functions related to SFDX.
 * @description   Exports a library of Task Builder functions related to SFDX.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import  {ListrTask}                 from  'listr';    // Interface. Represents a Task object as defined by Listr.
//import  Listr =                     require('listr'); // Provides asynchronous list with status of task completion.
//import * as path                    from  'path';     // Node's built-in path library.

// Import SFDX-Falcon Libraries
//import  {GitUtil}                   from  '@sfdx-falcon/util';          // Library. Git utility helper functions.
//import  {ListrUtil}                 from  '@sfdx-falcon/util';          // Library. Listr utility helper functions.
//import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
//import  {ExternalContext}           from  '@sfdx-falcon/task';          // Interface. Collection of key data structures that represent the overall context of the external environment inside which an SfdxFalconTask is running.
//import  {ListrContextFinalizeGit}   from  '@sfdx-falcon/types';         // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
//import  {ListrObject}               from  '@sfdx-falcon/types';         // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
//import  {ShellExecResult}           from  '@sfdx-falcon/types';         // Interface. Represents the result of a call to shell.execL().
//import { waitASecond } from '@sfdx-falcon/util/lib/async';

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder:task:sfdx';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);




// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    ????
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a Listr-compatible Task Object that contains a number of sub-tasks which
 *              inspect the connected orgs in the local SFDX environment and build Inquirer "choice
 *              lists" with them.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
