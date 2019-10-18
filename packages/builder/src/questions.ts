//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder/src/questions.ts
 * @summary       Exports the `QuestionsBuilder` and `InterviewQuestionsBuilder` abstract classes.
 * @description   Exports the `QuestionsBuilder` and `InterviewQuestionsBuilder` abstract classes.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Libraries
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}     from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import Package-Local Classes & Functions
import  {Builder}             from  './builder';              // Abstract Class. Basis for creating "builder" classes that can create Tasks, Questions, and more.
import  {ExternalContext}     from  './external-context';     // Class. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.

// Import SFDX-Falcon Types
import  {ConfirmationAnswers} from  '@sfdx-falcon/types';     // Interface. Represents what an answers hash should look like during Yeoman/Inquirer interactions where the user is being asked to proceed/retry/abort something.
import  {JsonMap}             from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import  {Questions}           from  '@sfdx-falcon/types';     // Interface. Represents mulitple Inquirer Questions.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Baseline structure for the options object that should be provided to the `constructor`
 * of any class that extends `InterviewQuestionsBuilder`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface InterviewQuestionsBuilderOptions {
  extCtx:     ExternalContext;
  msgStrings: {
    [key:string]: string
  };
}

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
   * @param       {InterviewQuestionsBuilderOptions} opts Required. Options
   *              that determine how this `InterviewQuestionsBuilder` object
   *              will be constructed.
   * @description Constructs a `InterviewQuestionsBuilder` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:InterviewQuestionsBuilderOptions) {

    // Define the local debug namespace.
    const baseClassName     = `InterviewQuestionsBuilder`;
    const funcName          = `constructor`;
    const dbgNsLocal        = `${dbgNs}:${baseClassName}:${funcName}`;

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Ensure that an object was provided for the opts argument, and that it has *something* for extCtx.
    // We have to check for an empty/null/invalid extCtx here because the base class won't fail hard
    // if it's not there.  For Interview Question Builders, we *want* to fail hard on missing extCtx though.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,         `${dbgNsLocal}`,  `InterviewQuestionsBuilderOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.extCtx,  `${dbgNsLocal}`,  `InterviewQuestionsBuilderOptions.extCtx`);

    // Make sure the Message Strings option is an object, if supplied.
    // If not supplied, initialize it to an empty object.
    if (opts.msgStrings) {
      TypeValidator.throwOnInvalidObject(opts.msgStrings,  `${dbgNsLocal}`,  `InterviewQuestionsBuilderOptions.msgStrings`);
    }
    else {
      opts.msgStrings = {};
    }

    // Call the superclass constructor.
    super(opts.extCtx);

    // Define the external debug namespaces.
    const derivedClassName  = this.constructor.name;
    const dbgNsExt          = `${this.dbgNsExt}:${derivedClassName}:${funcName}(${baseClassName})`;

    // Ensure that the External Context contains a vaild Interview Scope.
    TypeValidator.throwOnEmptyNullInvalidObject (this.extCtx.context,                            `${dbgNsExt}`, `ExternalContext.context`);
    TypeValidator.throwOnEmptyNullInvalidObject (this.extCtx.context['answers'],                 `${dbgNsExt}`, `ExternalContext.context.answers`);
    TypeValidator.throwOnNullInvalidObject      (this.extCtx.context['answers']['default'],      `${dbgNsExt}`, `ExternalContext.context.answers.default`);
    TypeValidator.throwOnNullInvalidObject      (this.extCtx.context['answers']['user'],         `${dbgNsExt}`, `ExternalContext.context.answers.user`);
    TypeValidator.throwOnNullInvalidObject      (this.extCtx.context['answers']['final'],        `${dbgNsExt}`, `ExternalContext.context.answers.final`);
    TypeValidator.throwOnNullInvalidObject      (this.extCtx.context['answers']['meta'],         `${dbgNsExt}`, `ExternalContext.context.answers.meta`);
    TypeValidator.throwOnEmptyNullInvalidObject (this.extCtx.context['answers']['confirmation'], `${dbgNsExt}`, `ExternalContext.context.answers.confirmation`);

    // Make sure that the external context has a reference to a `sharedData` object variable.
    if (TypeValidator.isNullInvalidObject(this.extCtx.context['sharedData'])) {
      throw new SfdxFalconError ( `The context referenced by 'ExternalContext.context' must have a 'sharedData' `
                                + `object varialbe defined in order to use instances of ${derivedClassName}.`
                                , `SharedDataNotFound`
                                , `${dbgNsExt}`);
    }

    // Make sure that there is only one Shared Data object in use.
    if (this.extCtx.sharedData !== this.extCtx.context['sharedData']) {
      throw new SfdxFalconError ( `ExternalContext member 'sharedData' must point to the same object `
                                + `as the 'sharedData' variable that is defined in the caller's context.`
                                , `SharedDataMismatch`
                                , `${dbgNsExt}`);
    }
  }

  // Require that the `build()` method must be implemented to return an Inquirer `Questions` object.
  public abstract build(buildCtx?:unknown):Questions;
}
