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
import  {ConfirmationAnswers} from  '@sfdx-falcon/types';     // Interface. Represents what an answers hash should look like during Yeoman/Inquirer interactions where the user is being asked to proceed/retry/abort something.
import  {JsonMap}             from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
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

  /** Context (ie. `this`) from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get context():object {
    TypeValidator.throwOnEmptyNullInvalidObject(this.extCtx,          `${this.dbgNsExt}`, `this.extCtx`);
    TypeValidator.throwOnEmptyNullInvalidObject(this.extCtx.context,  `${this.dbgNsExt}`, `this.extCtx.context`);
    return this.extCtx.context;
  }
  /** Answers object from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get answers():JsonMap {
    TypeValidator.throwOnEmptyNullInvalidObject(this.context['answers'], `${this.dbgNsExt}`, `this.context.answers`);
    return this.context['answers'];
  }
  /** "Default" Answers from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get defaultAnswers():JsonMap {
    TypeValidator.throwOnNullInvalidObject(this.answers.default, `${this.dbgNsExt}`, `this.answers.default`);
    return this.answers.default as JsonMap;
  }
  /** "User" Answers from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get userAnswers():JsonMap {
    TypeValidator.throwOnNullInvalidObject(this.answers.user, `${this.dbgNsExt}`, `this.answers.user`);
    return this.answers.user as JsonMap;
  }
  /** "Final" Answers from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get finalAnswers():JsonMap {
    TypeValidator.throwOnNullInvalidObject(this.answers.final, `${this.dbgNsExt}`, `this.answers.final`);
    return this.answers.final as JsonMap;
  }
  /** "Meta" Answers from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get metaAnswers():JsonMap {
    TypeValidator.throwOnNullInvalidObject(this.answers.meta, `${this.dbgNsExt}`, `this.answers.meta`);
    return this.answers.meta as JsonMap;
  }
  /** "Confirmation" Answers from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get confirmationAnswers():ConfirmationAnswers {
    TypeValidator.throwOnNullInvalidObject(this.answers.confirmation, `${this.dbgNsExt}`, `this.answers.confirmation`);
    return this.answers.confirmation as ConfirmationAnswers;
  }
  /** "Shared Data" from the External Context. This is a required part of the calling environment when using an `InterviewQuestionsBuilder` derived class. */
  protected get sharedData():object {
    TypeValidator.throwOnNullInvalidObject(this.extCtx.sharedData, `${this.dbgNsExt}`, `this.extCtx.sharedData`);
    return this.extCtx.sharedData;
  }

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


    SfdxFalconDebug.debugString(`xxxxxxx`, `ARGGGGH!!!`);

    // Define the local debug namespace.
    const funcName    = `constructor`;
    const dbgNsLocal = `${dbgNs}:${funcName}`;
    const dbgNsExt    = (typeof extCtx === 'object' && typeof extCtx.dbgNs === 'string' && extCtx.dbgNs) ? `${extCtx.dbgNs}:InterviewQuestionsBuilder:${funcName}` : dbgNsLocal;

    // Ensure that an External Context argument was provided.
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx, `${dbgNsExt}`, `ExternalContext`);

    // Ensure that the External Context contains a vaild Interview Scope.
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx.context,                            `${dbgNsExt}`, `ExternalContext.context`);
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx.context['answers'],                 `${dbgNsExt}`, `ExternalContext.context.answers`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['answers']['default'],      `${dbgNsExt}`, `ExternalContext.context.answers.default`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['answers']['user'],         `${dbgNsExt}`, `ExternalContext.context.answers.user`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['answers']['final'],        `${dbgNsExt}`, `ExternalContext.context.answers.final`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['answers']['meta'],         `${dbgNsExt}`, `ExternalContext.context.answers.meta`);
    TypeValidator.throwOnEmptyNullInvalidObject (extCtx.context['answers']['confirmation'], `${dbgNsExt}`, `ExternalContext.context.answers.confirmation`);
    TypeValidator.throwOnNullInvalidObject      (extCtx.context['sharedData'],              `${dbgNsExt}`, `ExternalContext.context.sharedData`);

    // Make sure we're only using one Shared Data object.
    extCtx.sharedData = extCtx.context['sharedData'];

    // Call the superclass constructor.
    super(extCtx);
  }

  // Require that the `build()` method must be implemented to return an Inquirer `Questions` object.
  public abstract build():Questions;
}
