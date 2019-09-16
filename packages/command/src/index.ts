//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/command/src/command.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports SFDX-Falcon flavored extensions to @sfdx/command. Part of the SFDX-Falcon Library.
 * @description   Exports SFDX-Falcon flavored extensions to @sfdx/command. Part of the SFDX-Falcon Library.
 * @license       MIT
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
