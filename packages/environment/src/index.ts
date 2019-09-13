//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/environment/src/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Generates detailed abstractions of various environments that may be required by
 *                complex CLI plugin implementations.
 * @description   Generates detailed abstractions of various environments that may be required by
 *                complex CLI plugin implementations.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import all Environment exports for re-export to anyone importing the @sfdx-falcon:environment module.
import  * as Git            from  './git';
import  * as Sfdx           from  './sfdx';

// Export everything we just imported, above.
export {
  Git,
  Sfdx
};
