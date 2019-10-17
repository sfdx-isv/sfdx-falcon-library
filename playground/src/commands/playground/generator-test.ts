//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/playground/src/commands/playground/generator-test.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements the CLI command `playground:generator-test`
 * @description   Salesforce CLI Plugin command `playground:generator-test`. Allows for testing and
 *                experimentation of the `@sfdx-falcon/generator` and `@sfdx-falcon/command` packages.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {flags}                         from  '@salesforce/command';    // Allows creation of flags for CLI commands.
import  {Messages}                      from  '@salesforce/core';       // Messages library that simplifies using external JSON for string reuse.
import  path                            = require('path');              // NodeJS native file path library.

//import  {SfdxError}                      from  '@salesforce/core';       // Messages library that simplifies using external JSON for string reuse.


// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconGeneratorCommand}    from  '@sfdx-falcon/command';   // Abstract Class. Extend when building Salesforce CLI commands that use the SFDX-Falcon Library.
import  {SfdxFalconDebug}               from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}               from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.



// Import SFDX-Falcon Types
//import  {GeneratorOptions}              from  '@sfdx-falcon/command';   // Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
//import  {AnyJson}                       from  '@sfdx-falcon/types';     // Type. Any valid JSON value.
import { SfdxFalconResult } from '@sfdx-falcon/status';

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
// Imports related to THIS specific playground
//import  {SfdxCliError}    from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {ShellError}      from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}  from '@sfdx-falcon/task';
//import  {waitASecond}     from '@sfdx-falcon/util/lib/async';
//import  Listr             = require('listr');
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:playground:generator-test';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('@sfdx-falcon/playground', 'playground-generic');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       PlaygroundGeneratorTest
 * @extends     SfdxFalconGeneratorCommand
 * @summary     Implements the CLI Command `playground:generator-test`.
 * @description The command `playground:generator-test` allows for testing and experimentation with
 *              the `@sfdx-falcon/generator` package.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class PlaygroundGeneratorTest extends SfdxFalconGeneratorCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx playground:generator-test`,
    `$ sfdx playground:generator-test -d ~/output-directory`
  ];

  //───────────────────────────────────────────────────────────────────────────┐
  // Define the flags used by this command.
  // -d --OUTPUTDIR   Placeholder. Not currently used for anything.
  //───────────────────────────────────────────────────────────────────────────┘
  protected static flagsConfig = {
    outputdir: flags.directory({
      char: 'd',
      required: false,
      description: commandMessages.getMessage('outputdir_FlagDescription'),
      default: '.',
      hidden: false
    }),

    // IMPORTANT! The next line MUST be here to import the FalconDebug flags.
    ...SfdxFalconGeneratorCommand.falconBaseflagsConfig
  };

  // Identify the core SFDX arguments/features required by this command.
  protected static requiresProject        = false;  // True if an SFDX Project workspace is REQUIRED.
  protected static requiresUsername       = false;  // True if an org username is REQUIRED.
  protected static requiresDevhubUsername = false;  // True if a hub org username is REQUIRED.
  protected static supportsUsername       = false;  // True if an org username is OPTIONAL.
  protected static supportsDevhubUsername = false;  // True if a hub org username is OPTIONAL.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      runCommand
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the `--json` flag was set.
   * @description Entrypoint function for `sfdx playground:generator-test`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async runCommand():Promise<SfdxFalconResult> {

    // Set function-local debug namespace.
    const funcName  = `runCommand`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    /*
    // Test the loading of this module's package manifest (Package.json).
    SfdxFalconDebug.debugString(`${dbgNsLocal}:__dirname:`, `${__dirname}`);
    SfdxFalconDebug.debugString(`${dbgNsLocal}:path.resolve:`, `${path.resolve(__dirname, '../../generators')}`);

    const packageJson = require('../../../package.json');
    SfdxFalconDebug.debugObject(`${dbgNsLocal}:packageJson:`, packageJson);
    
    SfdxFalconDebug.debugString(`${dbgNsLocal}:module.filename:`,         `${module.filename}`);
    SfdxFalconDebug.debugString(`${dbgNsLocal}:module.parent.filename:`,  `${module.parent.filename}`);
    //*/

    // Run a Yeoman Generator to interact with and run tasks for the user.
    const generatorResult = await super.runGenerator({
      commandName:      this.commandName,
      generatorPath:    path.resolve(__dirname, '../../generators'),
      generatorType:    'playground-generator-01',
      packageJson:      this.packageJson,
      customOpts: {
        outputDir:        this.outputDirectory
      }
    });

    SfdxFalconDebug.debugObject(`${dbgNsLocal}:generatorResult:`, generatorResult);
    return generatorResult;

  }
}
