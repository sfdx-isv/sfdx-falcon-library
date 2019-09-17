//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/status/src/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       INSERT_SUMMARY_HERE
 * @description   INSERT_DESCRIPTION_HERE
 * @license       MIT
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
