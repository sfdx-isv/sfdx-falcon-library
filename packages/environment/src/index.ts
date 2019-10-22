//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/environment/src/index.ts
 * @summary       Generates detailed abstractions of various environments that may be required by
 *                complex CLI plugin implementations.
 * @description   Generates detailed abstractions of various environments that may be required by
 *                complex CLI plugin implementations.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import all Environment exports for re-export to anyone importing the @sfdx-falcon:environment module.
import  * as Git            from  './git';
import  * as Local          from  './local';

// Import specific SFDX Environment items for re-export.
import  {ScratchOrgInfoMap}             from  './sfdx';
import  {SfdxEnvironmentOptions}        from  './sfdx';
import  {SfdxEnvironmentRequirements}   from  './sfdx';
import  {StandardOrgInfoMap}            from  './sfdx';
import  {StandardOrgInfoOptions}        from  './sfdx';
import  {ScratchOrgInfo}                from  './sfdx';
import  {StandardOrgInfo}               from  './sfdx';
import  {SfdxEnvironment}               from  './sfdx';

// Export everything we just imported, above.
export {
  Git,
  Local
};
export {ScratchOrgInfoMap};
export {SfdxEnvironmentOptions};
export {SfdxEnvironmentRequirements};
export {StandardOrgInfoMap};
export {StandardOrgInfoOptions};
export {ScratchOrgInfo};
export {StandardOrgInfo};
export {SfdxEnvironment};
