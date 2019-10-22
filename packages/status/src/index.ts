//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/status/src/index.ts
 * @summary       Collection of standardized mechanisms to track status/results and display this
 *                information coherently to the user.
 * @description   Collection of standardized mechanisms to track status/results and display this
 *                information coherently to the user.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Re-Export from sfdx-falcon-result.
import  {ErrorOrResult}                   from  './sfdx-falcon-result';
export  {ErrorOrResult};

import  {SfdxFalconResultOptions}         from  './sfdx-falcon-result';
export  {SfdxFalconResultOptions};

import  {SfdxFalconResultDisplayOptions}  from  './sfdx-falcon-result';
export  {SfdxFalconResultDisplayOptions};

import  {SfdxFalconResultRenderOptions}   from  './sfdx-falcon-result';
export  {SfdxFalconResultRenderOptions};

import  {SfdxFalconResult}                from  './sfdx-falcon-result';
export  {SfdxFalconResult};

// Re-Export from generator-status
import  {GeneratorStatus}                 from  './generator-status';
export  {GeneratorStatus};

// Re-Export from task-status
import  {TaskStatusOptions}               from  './task-status';
export  {TaskStatusOptions};

import  {TaskStatus}                      from  './task-status';
export  {TaskStatus};

import  {TaskStatusMessage}               from  './task-status';
export  {TaskStatusMessage};

// Re-Export from ux
import  {SfdxFalconKeyValueTableDataRow}  from  './ux';
export  {SfdxFalconKeyValueTableDataRow};

import  {SfdxFalconTableData}             from  './ux';
export  {SfdxFalconTableData};

import  {TableColumn}                     from  './ux';
export  {TableColumn};

import  {TableColumnKey}                  from  './ux';
export  {TableColumnKey};

import  {TableOptions}                    from  './ux';
export  {TableOptions};

import  {printStatusMessage}              from  './ux';
export  {printStatusMessage};

import  {printStatusMessages}             from  './ux';
export  {printStatusMessages};

import  {printStyledMessage}              from  './ux';
export  {printStyledMessage};

import  {SfdxFalconKeyValueTable}         from  './ux';
export  {SfdxFalconKeyValueTable};

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Enum. Represents the different states that an `SfdxFalconResult` object can be in.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export const enum SfdxFalconResultStatus {
  INITIALIZED = 'INITIALIZED',
  WAITING     = 'WAITING',
  SUCCESS     = 'SUCCESS',
  FAILURE     = 'FAILURE',
  WARNING     = 'WARNING',
  ERROR       = 'ERROR',
  UNKNOWN     = 'UNKNOWN'
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Enum. Represents the different types of sources where Results might come from.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export const enum SfdxFalconResultType {
  ACTION          = 'ACTION',
  COMMAND         = 'COMMAND',
  ENGINE          = 'ENGINE',
  EXECUTOR        = 'EXECUTOR',
  FUNCTION        = 'FUNCTION',
  GENERATOR       = 'GENERATOR',
  INITIALIZER     = 'INITIALIZER',
  INTERVIEW       = 'INTERVIEW',
  //LISTR           = 'LISTR',    // Deprecated in favor of TASK.
  PROMPT          = 'PROMPT',
  RECIPE          = 'RECIPE',
  TASK            = 'TASK',
  TASKBUNDLE      = 'TASKBUNDLE',
  UNKNOWN         = 'UNKNOWN',
  UTILITY         = 'UTILITY',
  WORKER          = 'WORKER'
}
