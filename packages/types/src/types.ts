//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/types/types.ts
 * @summary       Common collection of useful Salesforce-related types.
 * @description   Common collection of useful Salesforce-related types. Used by modules in the
 *                SFDX-Falcon Library but may also be useful any developer using TypeScript to
 *                create Salesforce-related JavaScript code.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

/**
 * `@sfdx-falcon/types` module.
 * @module types
 */

// Re-export each of the type collections in this module.
export  * from  './core';
export  * from  './enum';
export  * from  './metadata-api';
export  * from  './misc';
export  * from  './sobject';
