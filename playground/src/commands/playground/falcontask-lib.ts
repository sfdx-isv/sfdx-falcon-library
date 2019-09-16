//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/playground/src/commands/playground/falcontask.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements the CLI command `playground:falcontask`
 * @description   Salesforce CLI Plugin command (playground:falcontask) that allows for testing and
 *                experimentation of the `@sfdx-falcon/task` package.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {flags}                         from  '@salesforce/command';   // Allows creation of flags for CLI commands.
import  {Messages}                      from  '@salesforce/core';      // Messages library that simplifies using external JSON for string reuse.
import  {SfdxError}                     from  '@salesforce/core';      // Generalized SFDX error which also contains an action.

// Import Internal Classes & Functions
import  {SfdxFalconCommand}             from  '@sfdx-falcon/command'; // Abstract Class. Extend when building Salesforce CLI commands that use the SFDX-Falcon Library.
import  {SfdxFalconDebug}               from  '@sfdx-falcon/debug';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}               from  '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import Falcon Types
//import  {SfdxFalconCommandType}         from  '@sfdx-falcon/command'; // Enum. Represents the types of SFDX-Falcon Commands.
import  {AnyJson}                       from  '@sfdx-falcon/types';   // Type. Any valid JSON value.

// Imports related to THIS specific playground
//import  {SfdxFalconTask}  from '@sfdx-falcon/task';
import  {GitTasks}        from '@sfdx-falcon/task-library';
//import  {waitASecond}     from '@sfdx-falcon/util/lib/async';
//import  Listr             = require('listr');

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:playground-falcontask:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('@sfdx-falcon/playground', 'playground-falcontask');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       FalconTaskPlayground
 * @extends     SfdxFalconCommand
 * @summary     Implements the CLI Command `playground:falcontask`.
 * @description The command `playground:falcontask` allows for testing and experimentation with the
 *              `@sfdx-falcon/task` package.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class FalconTaskPlayground extends SfdxFalconCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx playground:falcontask-lib`,
    `$ sfdx playground:falcontask-lib -d ~/output-directory`
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
   * @function    run
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the `--json` flag was set.
   * @description Entrypoint function for `sfdx playground:falcontask`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async run():Promise<AnyJson> {

    // Initialize the SfdxFalconCommand (required by ALL classes that extend SfdxFalconCommand).
    this.sfdxFalconCommandInit();

    // Build an async shell around the Playground Logic you want to run.
    const playgroundLogic = async () => {

      // Add your Playground Logic here.

      console.log('\n\n\nROUND ONE\n\n\n');
    
      const gitEnvCheckTest = GitTasks.gitEnvironmentCheck({dbgNs: 'DEVTEST'}, 'https://github.com/sfdx-isv/hc-starter-pack.git');
      await gitEnvCheckTest.run();

      console.log('\n\n\nROUND TWO\n\n\n');

      const gitFinalizeTest = GitTasks.finalizeGit({dbgNs: 'DEVTEST'}, `/Users/vchawla/VMC-TEST`, `https://github.com/sfdx-isv/hc-starter-pack.git`, `This is my TEST commit message`);
      await gitFinalizeTest.run();
  

    };

    // Execute the Playground Logic defined above.
    await playgroundLogic()
    .then((result:unknown) => {
      console.log('HELLO SUCCESS!');
      return this.onSuccess(result);
    })
    .catch((error:unknown) => {
      console.log('HELLO FAILURE!');
      return this.onError(error);
    });







    console.log('HELLO END GAME!');

    // Return the JSON Response that was created by onSuccess()
    return this.falconJsonResponse as unknown as AnyJson;

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildFinalError
   * @param       {SfdxFalconError} cmdError  Required. Error object used as
   *              the basis for the "friendly error message" being created
   *              by this method.
   * @returns     {SfdxError}
   * @description Builds a user-friendly error message that is appropriate to
   *              the CLI command that's being implemented by this class. The
   *              output of this method will always be used by the onError()
   *              method from the base class to communicate the end-of-command
   *              error state.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected buildFinalError(cmdError:SfdxFalconError):SfdxError {

    // If not implementing anything special here, simply return cmdError.
    return cmdError;
  }
}
