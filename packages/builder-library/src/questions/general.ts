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

// Import SFDX-Falcon Libraries
import  {TypeValidator}                     from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder}         from  '@sfdx-falcon/builder';   // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
import  {SfdxFalconDebug}                   from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}                   from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Types
import  {InterviewQuestionsBuilderOptions}  from  '@sfdx-falcon/builder';   // Interface. Baseline structure for the options object that should be provided to the constructor of any class that extends InterviewQuestionsBuilder.
import  {Questions}                         from  '@sfdx-falcon/types';     // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(general)`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 *  Interface. Specifies options for the `ConfirmProceedRestart` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ConfirmProceedRestartOptions extends InterviewQuestionsBuilderOptions {
  msgStrings: {
    promptConfirmation?:  string;
    promptStartOver?:     string;
  };
}

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
   * @constructs  ConfirmProceedRestart
   * @param       {ConfirmProceedRestartOptions} opts  Required.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ConfirmProceedRestartOptions) {

    // Call the superclass constructor.
    super(opts);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate optional arguments.
    if (opts.msgStrings.promptConfirmation) TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptConfirmation, `${dbgNS.ext}`,  `msgStrings.promptConfirmation`);
    if (opts.msgStrings.promptStartOver)    TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptStartOver,    `${dbgNS.ext}`,  `msgStrings.promptStartOver`);
    
    // Initialize member variables.
    this.promptConfirmation = opts.msgStrings.promptConfirmation  ||  `Would you like to proceed based on the above settings?`;
    this.promptStartOver    = opts.msgStrings.promptStartOver     ||  `Would you like to start again and enter new values?`;
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
