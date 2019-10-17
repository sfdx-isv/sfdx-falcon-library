//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder-library/src/tasks/sfdx.ts
 * @summary       Exports a library of Task Builder functions related to SFDX.
 * @description   Exports a library of Task Builder functions related to SFDX.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import  {ListrTask}                 from  'listr';    // Interface. Represents a Task object as defined by Listr.
//import  Listr =                     require('listr'); // Provides asynchronous list with status of task completion.
//import * as path                    from  'path';     // Node's built-in path library.

// Import SFDX-Falcon Libraries
//import  {GitUtil}                   from  '@sfdx-falcon/util';          // Library. Git utility helper functions.
//import  {ListrUtil}                 from  '@sfdx-falcon/util';          // Library. Listr utility helper functions.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder} from  '@sfdx-falcon/builder';       // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
//import  {determineDbgNsExt}         from  '@sfdx-falcon/builder';       // Function. Given an ExternalContext, the name of the calling class and function, as well as an alternative debug namespace to use if the ExternalContext doesn't have the appropriate base, returns the correct External Debug Namespace string.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
import  {ExternalContext}           from  '@sfdx-falcon/builder';       // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {InquirerChoices}           from  '@sfdx-falcon/types';
import  {Questions}                 from  '@sfdx-falcon/types';         // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.
//import  {ListrContextFinalizeGit}   from  '@sfdx-falcon/types';         // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
//import  {ListrObject}               from  '@sfdx-falcon/types';         // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
//import  {ShellExecResult}           from  '@sfdx-falcon/types';         // Interface. Represents the result of a call to shell.execL().
//import { waitASecond } from '@sfdx-falcon/util/lib/async';

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions:sfdx';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ChooseSingleOrg
 * @extends     InterviewQuestionsBuilder
 * @summary     Interview Questions Builder for choosing a single salesforce org.
 * @description Interview Questions Builder for choosing a single salesforce org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ChooseSingleOrg extends InterviewQuestionsBuilder {

  public promptIsScratchOrg:      string;
  public promptStandardOrgChoice: string;
  public promptScratchOrgChoice:  string;
  public standardOrgChoices:      InquirerChoices;
  public scratchOrgChoices:       InquirerChoices;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ChooseSingleOrg
   * @param       {ExternalContext} extCtx  Required.
   * @param       {InquirerChoices} scratchOrgChoices Required.
   * @param       {InquirerChoices} standardOrgChoices  Required.
   * @description Constructs a Tm1Transform object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx:ExternalContext, scratchOrgChoices:InquirerChoices, standardOrgChoices:InquirerChoices,
              promptStrings:{promptIsScratchOrg?: string, promptStandardOrgChoice?: string, promptScratchOrgChoice?: string}={}) {

    // Call the superclass constructor.
    super(extCtx);

    // Define local and external debug namespaces.
    const className   = this.constructor.name;
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${className}:${funcName}`;
    const dbgNsExt    = `${this.dbgNsExt}:${className}:${funcName}`;

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidArray(standardOrgChoices,  `${dbgNsExt}`,  `standardOrgChoices`);
    TypeValidator.throwOnEmptyNullInvalidArray(scratchOrgChoices,   `${dbgNsExt}`,  `scratchOrgChoices`);
    TypeValidator.throwOnNullInvalidObject    (promptStrings,       `${dbgNsExt}`,  `promptStrings`);

    // Validate optional arguments.
    if (TypeValidator.isNotNullUndefined(promptStrings.promptIsScratchOrg))       TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptIsScratchOrg,       `${dbgNsExt}`,  `promptStrings.promptIsScratchOrg`);
    if (TypeValidator.isNotNullUndefined(promptStrings.promptScratchOrgChoice))   TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptScratchOrgChoice,   `${dbgNsExt}`,  `promptStrings.promptScratchOrgChoice`);
    if (TypeValidator.isNotNullUndefined(promptStrings.promptStandardOrgChoice))  TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptStandardOrgChoice,  `${dbgNsExt}`,  `promptStrings.promptStandardOrgChoice`);
    
    // Initialize member variables.
    this.scratchOrgChoices        = scratchOrgChoices;
    this.standardOrgChoices       = standardOrgChoices;
    this.promptIsScratchOrg       = promptStrings.promptIsScratchOrg      ||  `Is the target a Scratch Org?`;
    this.promptScratchOrgChoice   = promptStrings.promptScratchOrgChoice  ||  `Which scratch org would you like to work with?`;
    this.promptStandardOrgChoice  = promptStrings.promptStandardOrgChoice ||  `Which org would you like to work with?`;
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
        name:     'isScratchOrg',
        message:  this.promptIsScratchOrg,
        default:  ((TypeValidator.isNotNullInvalidBoolean(this.defaultAnswers.isScratchOrg)) ? this.defaultAnswers.isScratchOrg : false),
        when:     true
      },
      {
        type:     'list',
        name:     'targetOrgUsername',
        message:  this.promptStandardOrgChoice,
        choices:  this.standardOrgChoices,
        when:     answerHash => (answerHash.isScratchOrg === false && this.standardOrgChoices.length > 0)
      },
      {
        type:     'list',
        name:     'targetOrgUsername',
        message:  this.promptScratchOrgChoice,
        choices:  this.scratchOrgChoices,
        when:     answerHash => (answerHash.isScratchOrg === true && this.scratchOrgChoices.length > 0)
      }
    ];
  }
}
