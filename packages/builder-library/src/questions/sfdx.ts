//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder-library/src/questions/sfdx.ts
 * @summary       Exports `Builder` classes for questions related to Salesforce DX functionality.
 * @description   Exports `Builder` classes for questions related to Salesforce DX functionality.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types

// Import SFDX-Falcon Libraries
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder} from  '@sfdx-falcon/builder';       // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconPrompt}          from  '@sfdx-falcon/prompt';        // Class. Allows easy creation of Inquirer prompts that have a "confirmation" question that can be used to restart collection of the information.
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Types
import  {ExternalContext}           from  '@sfdx-falcon/builder';       // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {InquirerChoices}           from  '@sfdx-falcon/types';
import  {JsonMap}                   from  '@sfdx-falcon/types';         // Interface. Any JSON-compatible object.
import  {Questions}                 from  '@sfdx-falcon/types';         // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(sfdx)`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ChooseSingleOrg
 * @extends     InterviewQuestionsBuilder
 * @summary     Interview Questions Builder for choosing a single salesforce org.
 * @description Interview Questions Builder for choosing a single salesforce org.
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
   * @param       {object}  [promptStrings] Optional.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx:ExternalContext, scratchOrgChoices:InquirerChoices, standardOrgChoices:InquirerChoices,
              promptStrings:{promptIsScratchOrg?: string, promptStandardOrgChoice?: string, promptScratchOrgChoice?: string}={}) {

    // Call the superclass constructor.
    super(extCtx);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidArray(standardOrgChoices,  `${dbgNS.ext}`,  `standardOrgChoices`);
    TypeValidator.throwOnEmptyNullInvalidArray(scratchOrgChoices,   `${dbgNS.ext}`,  `scratchOrgChoices`);
    TypeValidator.throwOnNullInvalidObject    (promptStrings,       `${dbgNS.ext}`,  `promptStrings`);

    // Validate optional arguments.
    if (TypeValidator.isNotNullUndefined(promptStrings.promptIsScratchOrg))       TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptIsScratchOrg,       `${dbgNS.ext}`,  `promptStrings.promptIsScratchOrg`);
    if (TypeValidator.isNotNullUndefined(promptStrings.promptScratchOrgChoice))   TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptScratchOrgChoice,   `${dbgNS.ext}`,  `promptStrings.promptScratchOrgChoice`);
    if (TypeValidator.isNotNullUndefined(promptStrings.promptStandardOrgChoice))  TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptStandardOrgChoice,  `${dbgNS.ext}`,  `promptStrings.promptStandardOrgChoice`);
    
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

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ConfirmNoTargetOrg
 * @extends     InterviewQuestionsBuilder
 * @summary     Interview Questions Builder for confirming refusal of a Target Org selection.
 * @description Interview Questions Builder for confirming refusal of a Target Org selection.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ConfirmNoTargetOrg extends InterviewQuestionsBuilder {

  public promptStartOver: string;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ConfirmNoTargetOrg
   * @param       {ExternalContext} extCtx  Required.
   * @param       {object}  [promptStrings] Optional.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx:ExternalContext, promptStrings:{promptStartOver?: string}={}) {

    // Call the superclass constructor.
    super(extCtx);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidObject(promptStrings, `${dbgNS.ext}`, `promptStrings`);

    // Validate optional arguments.
    if (TypeValidator.isNotNullUndefined(promptStrings.promptStartOver))  TypeValidator.throwOnEmptyNullInvalidString(promptStrings.promptStartOver,  `${dbgNS.ext}`, `promptStrings.promptStartOver`);
    
    // Initialize member variables.
    this.promptStartOver = promptStrings.promptStartOver || `Selecting a target org is required. Would you like to see the choices again?`;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {Questions}
   * @description Builds the Interview Questions.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build(buildCtx:SfdxFalconPrompt<JsonMap>):Questions {

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `build`, arguments);

    // Validate the Build Context.
    TypeValidator.throwOnInvalidInstance        (buildCtx, SfdxFalconPrompt,              `${dbgNS.ext}`, `BuildContext`);
    TypeValidator.throwOnEmptyNullInvalidString (buildCtx.userAnswers.targetOrgUsernameXX,  `${dbgNS.ext}`, `BuildContext.userAnswers.targetOrgUsername`);

    // Build and return the Questions object.
    return [
      {
        type:     'confirm',
        name:     'restart',
        message:  this.promptStartOver,
        default:  true,
        when:     buildCtx.userAnswers.targetOrgUsername === 'NOT_SPECIFIED'
      }
    ];
  }
}
