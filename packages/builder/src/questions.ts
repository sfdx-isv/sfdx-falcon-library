//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/builder/src/questions.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the `QuestionsBuilder` and `InterviewQuestionsBuilder` abstract classes.
 * @description   Exports the `QuestionsBuilder` and `InterviewQuestionsBuilder` abstract classes.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import SFDX-Falcon Types
import  {Questions}           from  '@sfdx-falcon/types';     // Interface. Represents mulitple Inquirer Questions.

// Import Package-Local Code
import  {Builder}             from  './index';
import  {ExternalContext}     from  './index';

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       QuestionsBuilder
 * @extends     Builder
 * @description Classes derived from `QuestionsBuilder` can be used to build an Inquirer `Questions`
 *              object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class QuestionsBuilder extends Builder {

  // Require that the `build()` method must be implemented to return an Inquirer `Questions` object.
  public abstract build():Questions;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       InterviewQuestionsBuilder
 * @extends     QuestionsBuilder
 * @description Classes derived from `InterviewQuestionsBuilder` should be specifically designed
 *              to build an Inquirer `Questions` object within the context of an `SfdxFalconInterview`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class InterviewQuestionsBuilder extends Builder {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  InterviewQuestionsBuilder
   * @param       {ExternalContext} [extCtx]  Optional. Provides information
   *              about the External Context into which a derived Builder will
   *              need to function.
   * @description Constructs a `Builder` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(extCtx?:ExternalContext) {

    // Define the local debug namespace.
    const funcName    = `constructor`;
    const dbgNsLocal = `${dbgNs}:${funcName}`;
    const dbgNsExt    = (typeof extCtx === 'object' && typeof extCtx.dbgNs === 'string' && extCtx.dbgNs) ? `${extCtx.dbgNs}:InterviewQuestionsBuilder:${funcName}` : dbgNsLocal;

    // Ensure that an External Context argument was provided.
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx, `${dbgNsExt}`, `ExternalContext`);

    // Ensure that the External Context contains a vaild Interview Scope.
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx.context,                        `${dbgNsExt}`, `ExternalContext.context`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['userAnswers'],         `${dbgNsExt}`, `ExternalContext.context.userAnswers`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['defaultAnswers'],      `${dbgNsExt}`, `ExternalContext.context.defaultAnswers`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['confirmationAnswers'], `${dbgNsExt}`, `ExternalContext.context.confirmationAnswers`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['metaAnswers'],         `${dbgNsExt}`, `ExternalContext.context.metaAnswers`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['sharedData'],          `${dbgNsExt}`, `ExternalContext.context.sharedData`);

    // Make sure we're only using one Shared Data object.
    extCtx.sharedData = extCtx.context['sharedData'];

    // Call the superclass constructor.
    super(extCtx);
  }

  // Require that the `build()` method must be implemented to return an Inquirer `Questions` object.
  public abstract build():Questions;
}
