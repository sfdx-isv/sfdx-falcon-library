//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/validator/src/index.ts
 * @summary       Collection of useful validation functions and primitives. Part of the SFDX-Falcon Library.
 * @description   Collection of useful validation functions and primitives. Part of the SFDX-Falcon Library.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import from the other files in this package.
import  * as CoreValidator    from  './core';
import  * as GitValidator     from  './git';
import  * as TypeValidator    from  './type';
import  * as YeomanValidator  from  './yeoman';

// Re-export everything.
export {
  TypeValidator,
  CoreValidator,
  GitValidator,
  YeomanValidator
};
