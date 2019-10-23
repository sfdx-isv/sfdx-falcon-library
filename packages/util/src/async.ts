//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/util/src/async.ts
 * @summary       Helper library for running async logic.
 * @description   Exports functions that make running async logic easier.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Classes & Functions
import {SfdxFalconDebug}  from  '@sfdx-falcon/debug'; // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}  from  '@sfdx-falcon/error'; // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:util:async';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    waitASecond
 * @param       {number}  [waitSecs=1]  Optional. Number of seconds before the call to setTimeout
 *              returns a Promise that is guaranteed to RESOLVE.
 * @param       {boolean} [convertToMs=true]  Optional. When true, converts the number provided to
 * @returns     {Promise<void>}
 * @description Simple helper function that can be used to introduce a delay when called inside
 *              async functions using the "await" keyword.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function waitASecond(waitSecs:number=1, convertToMs:boolean=true):Promise<void> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:waitASecond`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments
  if (isNaN(waitSecs)) {
    throw new SfdxFalconError( `Expected waitSecs to be a number, but got '${typeof waitSecs}' instead`
                             , `TypeError`
                             , `${dbgNsLocal}`);
  }

  // Convert the "wait secs" to milliseconds, unless otherwise specified by the caller.
  if (convertToMs) {
    waitSecs *= 1000;
  }

  // Wrap the setTimeout in a promise that's guaranteed to resolve and return it.
  return new Promise(resolve => {
    setTimeout(() => resolve(), waitSecs);
  });
}
