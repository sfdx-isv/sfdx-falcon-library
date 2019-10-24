//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/playground/src/commands/playground/falcontask.ts
 * @summary       Implements the CLI command `playground:falcontask`
 * @description   Salesforce CLI Plugin command (playground:falcontask) that allows for testing and
 *                experimentation of the `@sfdx-falcon/task` package.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {flags}                         from  '@salesforce/command';   // Allows creation of flags for CLI commands.
import  {Messages}                      from  '@salesforce/core';      // Messages library that simplifies using external JSON for string reuse.
import  {SfdxError}                     from  '@salesforce/core';      // Generalized SFDX error which also contains an action.

// Import SFDX-Falcon Classes & Functions
import  {ExternalContext}               from  '@sfdx-falcon/builder'; // Class. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {SfdxFalconCommand}             from  '@sfdx-falcon/command'; // Abstract Class. Extend when building Salesforce CLI commands that use the SFDX-Falcon Library.
import  {SfdxFalconDebug}               from  '@sfdx-falcon/debug';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}               from  '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import Falcon Types
import  {AnyJson}                       from  '@sfdx-falcon/types';   // Type. Any valid JSON value.

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
// Imports related to THIS specific playground
//import  {SfdxCliError}    from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {ShellError}      from '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconTask}  from '@sfdx-falcon/task';
import  {waitASecond}     from '@sfdx-falcon/util/lib/async';
import  Listr             = require('listr');
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:playground:falcontask';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

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
    `$ sfdx playground:falcontask`,
    `$ sfdx playground:falcontask -d ~/output-directory`
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
   * @description Entrypoint function for `sfdx playground:falcontask`.
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


    // Stand up a "shared data" object
    // @ts-ignore
    this.sharedData = {};
    //*
    // Define a Falcon Task.
    const falconTask = new SfdxFalconTask({
      title:  'this is my test task',
      extCtx:   new ExternalContext({
        dbgNs:  `xxxx`
        //sharedData: {}
        //parentResult: {} as any,
        //generatorStatus: {} as any
      }),
//        extCtxReqs: {
//          sharedData: true
//          parentResult: false,
//          generatorStatus: true
//        },
      statusMsg:  'My first status message',
      minRuntime: 8,
      showTimer:  true,
      task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {

//          throw new Error('STOP TOUCHING ME!!');
//          console.log(`I'm inside the house!`);
//          console.log(`My arguments are: %O`, arguments);
//          console.log(`My context is: %O`, listrContext);
//          console.log(`My task is: %O`, _thisTask);
//          console.log(`My shared data is: %O`, _sharedData);
        await waitASecond(3);
        _taskObj.title = 'I have totally changed the title!';
        await waitASecond(3);
        _taskStatus.message = 'I have a NEW status message!';
        await waitASecond(3);
      }
    });

    // Define a Listr object and use our task to build one of the two tasks.
    const listrTasks = new Listr(
      [
        falconTask.build(),
        {
          title: 'second task',
          task: (_listrContext, _thisTask) => {
            console.log(`This is from second task`);
          }
        }
      ],
      {
        concurrent:   false,
        // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
        collapse:     false,
        exitOnError:  true,
        renderer:     'verbose'
      }
    );

    //SfdxFalconDebug.debugObject(`xxxx:listrTasks:`, listrTasks);
    //SfdxFalconDebug.debugObject(`xxxx:this:`, this);
    
    // Run the Listr Task.
    return await listrTasks.run();
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
