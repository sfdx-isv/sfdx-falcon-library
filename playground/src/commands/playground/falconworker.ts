//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/playground/src/commands/playground/falconworker.ts
 * @summary       Implements the CLI command `playground:falconworker`
 * @description   Salesforce CLI Plugin command `playground:falconworker`. Allows for testing and
 *                and experimentation of the `@sfdx-falcon/worker` package.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {flags}                         from  '@salesforce/command';   // Allows creation of flags for CLI commands.
import  {Messages}                      from  '@salesforce/core';      // Messages library that simplifies using external JSON for string reuse.
//import  {SfdxError}                     from  '@salesforce/core';      // Generalized SFDX error which also contains an action.


import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.

// Import SFDX-Falcon Classes & Functions
//import  {ExternalContext}               from  '@sfdx-falcon/builder'; // Class. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {SfdxFalconCommand}             from  '@sfdx-falcon/command'; // Abstract Class. Extend when building Salesforce CLI commands that use the SFDX-Falcon Library.
import  {SfdxFalconDebug}               from  '@sfdx-falcon/debug';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {AsyncUtil}                     from  '@sfdx-falcon/util';
//import  {SfdxFalconError}               from  '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import Falcon Types
import  {AnyJson}                       from  '@sfdx-falcon/types';   // Type. Any valid JSON value.
import  {JsonMap}                       from  '@sfdx-falcon/types';   // Type. Any valid JSON value.

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
// Imports related to THIS specific playground
//import  {SfdxCliError}    from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {ShellError}      from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}    from '@sfdx-falcon/task';
//import  {waitASecond}       from '@sfdx-falcon/util/lib/async';
import  {SfdxFalconWorker}  from  '@sfdx-falcon/worker';  // Abstract Class. Abstract class for building classes that implement task-specific functionality.
import  {SfdxFalconWorkerOptions}  from  '@sfdx-falcon/worker';  // Interface. Represents the collective options object for classes derived from SfdxFalconWorker.
//import  Listr               = require('listr');
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:playground:falconworker';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('@sfdx-falcon/playground', 'playground-generic');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       FalconWorkerPlayground
 * @extends     SfdxFalconCommand
 * @summary     Implements the CLI Command `playground:falconworker`.
 * @description The command `playground:falconworker` allows for testing and experimentation with the
 *              `@sfdx-falcon/worker` package.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class FalconWorkerPlayground extends SfdxFalconCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx playground:falconworker`,
    `$ sfdx playground:falconworker -d ~/output-directory`
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
    ...SfdxFalconCommand.falconBaseflagsConfig
  };

  // Identify the core SFDX arguments/features required by this command.
  protected static requiresProject        = false;  // True if an SFDX Project workspace is REQUIRED.
  protected static requiresUsername       = false;  // True if an org username is REQUIRED.
  protected static requiresDevhubUsername = false;  // True if a hub org username is REQUIRED.
  protected static supportsUsername       = false;  // True if an org username is OPTIONAL.
  protected static supportsDevhubUsername = false;  // True if a hub org username is OPTIONAL.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    runCommand
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the `--json` flag was set.
   * @description Entrypoint function for `sfdx playground:falconworker`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async runCommand():Promise<AnyJson> {

    // Test Error construction and debug
    //throw new SfdxFalconError('stop touching me!', 'My_SfdxFalconError', 'My_Sfdx_Falcon_Error_Source', new Error('STOOOOOPPPPPPP!!!!'), {detail: 'This is string detail', myNum: 42, error: new Error('OMG NOOO!')});
    //throw new SfdxFalconError('stop touching me!', 'My_SfdxFalconError', 'My_Sfdx_Falcon_Error_Source', null, {detail: 'This is string detail', myNum: 42, error: new Error('OMG NOOO!')});
    //throw new SfdxCliError('sfdx force:org:list', 'STDOUT buffer simulation', 'STDERR buffer simulation', 'stop touching me Mr. CLI!', 'My_SfdxFalconError');
    //throw new ShellError('git init --force', 100, 'EONENT', 'STDOUT buffer simulation', 'STDERR buffer simulation\nthis is how we play\nall nitght long!', null, 'My_SfdxFalconError');

    //SfdxFalconDebug.debugObject('xxxx:', this);
    const workerTestOpts = {
      constructorOpts: {optionOne: 'df', optionTwo: 'df'},
      prepareOpts: {
        optionOne: 'ab',
        optionTwo: 'cd'
      }
    };

    const workerTest = new WorkerTest(workerTestOpts);
    SfdxFalconDebug.obj(`${dbgNs}:workerTest:`, workerTest);


    await workerTest.prepare(workerTestOpts);

    workerTest.testMe();

    const workerReport = workerTest.generateReport();
    SfdxFalconDebug.obj(`${dbgNs}:workerReport:`, workerReport);

    return workerReport;
  }
}

// WorkerTestOptions
interface WorkerTestOptions extends SfdxFalconWorkerOptions {
  constructorOpts: {
    optionOne: string;
    optionTwo: string;
  };
  prepareOpts?: {
    optionOne: string;
    optionTwo: string;
  };
}

// TestReport
interface TestReport extends JsonMap {
  test:     string;
  success:  string;
}

// Define a class that extends SfdxFalconWorker.
class WorkerTest extends SfdxFalconWorker<WorkerTestOptions> {

  constructor(opts:WorkerTestOptions) {
    super({
      dbgNsExt:     `${dbgNs}`,
      requiresPrep: true
    });
    SfdxFalconDebug.obj(`${this.dbgNs}:opts:`, opts);
  }

  public testMe():void {
    this.operationRequiresPreparation();
    console.log('test me');
  }

  protected _generateReport():TestReport {
    return {
      test: "hello",
      success: "Yes there is much success!"
    };
  }

  protected async _prepare(opts:WorkerTestOptions):Promise<void> {

    // Define local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:_prepare`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);


    await AsyncUtil.waitASecond(3);

    // Validate OPTIONAL incoming options.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsLocal}`, `ClassNameOptions`);
    }

    // Validate REQUIRED incoming options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,           `${dbgNsLocal}`, `ClassNameOptions`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.prepareOpts.optionOne, `${dbgNsLocal}`, `ClassNameOptions.prepareOpts.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.prepareOpts.optionTwo, `${dbgNsLocal}`, `ClassNameOptions.prepareOpts.optionTwo`);

    // Do stuf to prepare this instance...
    // **STUFF**

  }
}
