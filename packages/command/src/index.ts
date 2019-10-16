//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/command/src/index.ts
 * @summary       Exports SFDX-Falcon flavored extensions to `@sfdx/command`.
 * @description   Exports SFDX-Falcon flavored extensions to `@sfdx/command`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import from sfdx-falcon-command.
import  {SfdxFalconCommand}             from  './sfdx-falcon-command';
import  {SfdxFalconCommandType}         from  './sfdx-falcon-command';
import  {SfdxFalconCommandResultDetail} from  './sfdx-falcon-command';

// Import from sfdx-falcon-generator-command.
import  {SfdxFalconGeneratorCommand}    from  './sfdx-falcon-generator-command';
import  {GeneratorOptions}              from  './sfdx-falcon-generator-command';

// Export everything we've imported.
/** Abstract Class. Extend this when you want to build Salesforce CLI commands that use the SFDX-Falcon Library. */
export {SfdxFalconCommand};

/** Enum. Defines the possible types of SFDX-Falcon Commands. */
export {SfdxFalconCommandType};

/** Interface. Represents the Detail object that should be attached to an SFDX-Falcon COMMAND Result. */
export {SfdxFalconCommandResultDetail};

/** Abstract Class. Extend this when you want to build Salesforce CLI commands that use Yeoman. */
export {SfdxFalconGeneratorCommand};

/** Interface. Specifies options used when spinning up an SFDX-Falcon Yeoman environment. */
export {GeneratorOptions};
