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
import  {TypeValidator}                     from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder}         from  '@sfdx-falcon/builder';   // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
import  {SfdxFalconDebug}                   from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconPrompt}                  from  '@sfdx-falcon/prompt';    // Class. Allows easy creation of Inquirer prompts that have a "confirmation" question that can be used to restart collection of the information.
//import  {SfdxFalconError}                   from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Types
import  {InterviewQuestionsBuilderOptions}  from  '@sfdx-falcon/builder';   // Interface. Baseline structure for the options object that should be provided to the constructor of any class that extends InterviewQuestionsBuilder.
import  {InquirerChoices}                   from  '@sfdx-falcon/types';
import  {JsonMap}                           from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import  {InquirerValidateFunction}          from  '@sfdx-falcon/types';     // Type. Represents the function signature for an Inquirer validate() function.
import  {Questions}                         from  '@sfdx-falcon/types';     // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(sfdx)`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 *  Interface. Specifies options for the `ChooseSingleOrg` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ChooseSingleOrgOptions extends InterviewQuestionsBuilderOptions {
  scratchOrgChoices:    InquirerChoices;
  standardOrgChoices:   InquirerChoices;
  validateFunction?:    InquirerValidateFunction;
  msgStrings: {
    promptIsScratchOrg?:      string;
    promptStandardOrgChoice?: string;
    promptScratchOrgChoice?:  string;
  };
}

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
   * @param       {ChooseSingleOrgOptions} opts  Required.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ChooseSingleOrgOptions) {

    // Call the superclass constructor.
    super(opts);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidArray(opts.standardOrgChoices,  `${dbgNS.ext}`,  `ChooseSingleOrgOptions.standardOrgChoices`);
    TypeValidator.throwOnEmptyNullInvalidArray(opts.scratchOrgChoices,   `${dbgNS.ext}`,  `ChooseSingleOrgOptions.scratchOrgChoices`);

    // Validate optional arguments.
    if (opts.msgStrings.promptIsScratchOrg)       TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptIsScratchOrg,       `${dbgNS.ext}`,  `msgStrings.promptIsScratchOrg`);
    if (opts.msgStrings.promptScratchOrgChoice)   TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptScratchOrgChoice,   `${dbgNS.ext}`,  `msgStrings.promptScratchOrgChoice`);
    if (opts.msgStrings.promptStandardOrgChoice)  TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptStandardOrgChoice,  `${dbgNS.ext}`,  `msgStrings.promptStandardOrgChoice`);
    
    // Initialize member variables.
    this.scratchOrgChoices        = opts.scratchOrgChoices;
    this.standardOrgChoices       = opts.standardOrgChoices;
    this.promptIsScratchOrg       = opts.msgStrings.promptIsScratchOrg      ||  `Is the target a Scratch Org?`;
    this.promptScratchOrgChoice   = opts.msgStrings.promptScratchOrgChoice  ||  `Which scratch org would you like to work with?`;
    this.promptStandardOrgChoice  = opts.msgStrings.promptStandardOrgChoice ||  `Which org would you like to work with?`;
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
 *  Interface. Specifies options for the `ConfirmNoTargetOrg` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ConfirmNoTargetOrgOptions extends InterviewQuestionsBuilderOptions {
  msgStrings: {
    promptStartOver?: string
  };
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
   * @param       {ConfirmNoTargetOrgOptions} opts  Required.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ConfirmNoTargetOrgOptions) {

    // Call the superclass constructor.
    super(opts);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate optional options.
    if (opts.msgStrings.promptStartOver)  TypeValidator.throwOnEmptyNullInvalidString (opts.msgStrings.promptStartOver, `${dbgNS.ext}`,  `msgStrings.promptStartOver`);
    
    // Initialize member variables.
    this.promptStartOver = opts.msgStrings.promptStartOver || `Selecting a target org is required. Would you like to see the choices again?`;
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
    TypeValidator.throwOnEmptyNullInvalidString (buildCtx.userAnswers.targetOrgUsername,  `${dbgNS.ext}`, `BuildContext.userAnswers.targetOrgUsername`);

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
