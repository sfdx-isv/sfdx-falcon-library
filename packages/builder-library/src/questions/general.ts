//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder-library/src/questions/general.ts
 * @summary       Exports `Builder` classes for general questions.
 * @description   Exports `Builder` classes for general questions.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import  {ListrTask}                 from  'listr';    // Interface. Represents a Task object as defined by Listr.
//import  Listr =                     require('listr'); // Provides asynchronous list with status of task completion.
//import * as path                    from  'path';     // Node's built-in path library.

// Import SFDX-Falcon Libraries
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder} from  '@sfdx-falcon/builder';       // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
import  {ExternalContext}           from  '@sfdx-falcon/builder';       // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {Questions}                 from  '@sfdx-falcon/types';         // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(general)`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ConfirmProceedRestart
 * @extends     InterviewQuestionsBuilder
 * @description Asks the user to confirm that they want to proceed with an operation based on the
 *              values that they have previously provided during an Interview.  If they say "no",
 *              they will be asked if they want to restart.  If they choose not to restart, they
 *              are effectively aborting the operation.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ConfirmProceedRestart extends InterviewQuestionsBuilder {

  public promptConfirmation:      string;
  public promptStartOver:         string;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ChooseSingleOrg
   * @param       {ExternalContext} extCtx  Required.
   * @param       {object}  [promptStrings] Optional.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx:ExternalContext,
              promptStrings:{promptConfirmation?: string, promptStartOver?: string}={}) {

    // Call the superclass constructor.
    super(extCtx);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidObject(promptStrings, `${dbgNS.ext}`, `promptStrings`);

    // Validate optional arguments.
    if (TypeValidator.isNotNullUndefined(promptStrings.promptConfirmation)) TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptConfirmation, `${dbgNS.ext}`,  `promptStrings.promptConfirmation`);
    if (TypeValidator.isNotNullUndefined(promptStrings.promptStartOver))    TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptStartOver,    `${dbgNS.ext}`,  `promptStrings.promptStartOver`);
    
    // Initialize member variables.
    this.promptConfirmation = promptStrings.promptConfirmation  ||  `Would you like to proceed based on the above settings?`;
    this.promptStartOver    = promptStrings.promptStartOver     ||  `Would you like to start again and enter new values?`;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {Questions}
   * @description Builds the Interview Questions.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build():Questions {
    return [
      {
        type:     'confirm',
        name:     'proceed',
        message:  this.promptConfirmation,
        default:  false,
        when:     true
      },
      {
        type:     'confirm',
        name:     'restart',
        message:  this.promptStartOver,
        default:  true,
        when:     answerHash => ! answerHash.proceed
      }
    ];
  }
}
