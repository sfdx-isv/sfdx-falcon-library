//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/playground/src/commands/playground/environment-sfdx.ts
 * @summary       Implements the CLI command `playground:environment-sfdx`
 * @description   Salesforce CLI Plugin command (playground:environment-sfdx) that allows for testing and
 *                experimentation of the `@sfdx-falcon/environment` package.
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
import  {AnyJson}                       from  '@sfdx-falcon/types';   // Type. Any valid JSON value.

// Imports related to THIS specific playground
//import  {SfdxFalconTask}  from '@sfdx-falcon/task';
//import  {GitTasks}        from '@sfdx-falcon/builder';
//import  {waitASecond}     from '@sfdx-falcon/util/lib/async';
//import  Listr             = require('listr');
import  {SfdxEnvironment}         from '@sfdx-falcon/environment';
import  {SfdxEnvironmentOptions}  from '@sfdx-falcon/environment';
import  {waitASecond}             from '@sfdx-falcon/util/lib/async';

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:playground-environment-sfdx';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('@sfdx-falcon/playground', 'playground-falcontask');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       GenericPlaygroundCommand
 * @extends     SfdxFalconCommand
 * @summary     Generic implementation of an `SfdxFalconCommand` for DEVTEST purposes.
 * @description Allows for testing and experimentation with the `@sfdx-falcon/environment` package.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class GenericPlaygroundCommand extends SfdxFalconCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx playground:environment-sfdx`,
    `$ sfdx playground:environment-sfdx -d ~/output-directory`
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

  // Specify the name of this command (eg. 'falcon:adk:clone').
  protected readonly commandName = 'playground:environment-sfdx';

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    run
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the `--json` flag was set.
   * @description Entrypoint function for this playground command.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async runCommand():Promise<AnyJson> {

    // Add your Playground Logic here.
    const opts:SfdxEnvironmentOptions = {
      requirements: {
        managedPkgOrgs: true,
        unmanagedPkgOrgs: true,
        devHubOrgs: true
      },
      dbgNs:    'xxxx',
      verbose:  true,
      silent:   false
    };

    //SfdxFalconDebug.debugMessage('xxxx1111xxxx', 'BEFORE Environment Init');
    // @ts-ignore
    const sfdxEnv = await SfdxEnvironment.initialize(opts);

    //SfdxFalconDebug.debugMessage('xxxx2222xxxx', 'AFTER Environment Init');

    await waitASecond(4);

    SfdxFalconDebug.debugObject('POST_INIT:standardOrgChoices:', sfdxEnv.standardOrgChoices);
    SfdxFalconDebug.debugObject('POST_INIT:scratchOrgChoices:', sfdxEnv.scratchOrgChoices);
    SfdxFalconDebug.debugObject('POST_INIT:allOrgChoices:', sfdxEnv.allOrgChoices);
    SfdxFalconDebug.debugObject('POST_INIT:devHubChoices:', sfdxEnv.devHubChoices);
    SfdxFalconDebug.debugObject('POST_INIT:envHubChoices:', sfdxEnv.envHubChoices);
    SfdxFalconDebug.debugObject('POST_INIT:pkgOrgChoices:', sfdxEnv.pkgOrgChoices);
    SfdxFalconDebug.debugObject('POST_INIT:managedPkgOrgChoices:', sfdxEnv.managedPkgOrgChoices);
    SfdxFalconDebug.debugObject('POST_INIT:unmanagedPkgOrgChoices:', sfdxEnv.unmanagedPkgOrgChoices);



    console.log('HELLO END GAME!');

    return null;
  }

  protected async runCommand2():Promise<string> {
    console.log('This is from inside runCommand()');
    return null;
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
