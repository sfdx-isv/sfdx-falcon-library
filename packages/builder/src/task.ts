//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder/src/task.ts
 * @summary       Exports the `TaskBuilder` and `TaskGroupBuilder` abstract classes.
 * @description   Exports the `TaskBuilder` and `TaskGroupBuilder` abstract classes.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {ListrTask}         from  'listr';              // Interface. Represents a Task object as defined by Listr.
import  Listr =             require('listr');           // Provides asynchronous list with status of task completion.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import Package-Local Code
import  {Builder}           from  './index';            // Abstract Class. Basis for creating "builder" classes that can create Tasks, Questions, and more.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder:task';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       TaskBuilder
 * @extends     Builder
 * @description Classes derived from `TaskBuilder` can be used to build a single `ListrTask` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class TaskBuilder extends Builder {

  // Require that the `build()` method must be implemented to return a single Listr Task.
  public abstract build():ListrTask;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       TaskGroupBuilder
 * @extends     Builder
 * @description Classes derived from `TaskGroupBuilder` can be used to build a single `Listr`
 *              object which will must be made up of one or more individual `ListrTask` objects as
 *              well as the specific options that determine how the tasks are run.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class TaskGroupBuilder extends Builder {

  // Require that the `build()` method must be implemented to return a fully instantiated Listr object.
  public abstract build():Listr;
}
