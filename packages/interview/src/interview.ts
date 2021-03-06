//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/interview/src/interview.ts
 * @summary       Exports `SfdxFalconInterview` which provides complex interactions via the console.
 * @description   Helps developers quickly build complex Inquirer based interviews as a collection
 *                of `SfdxFalconPrompt` objects. Can export interviews to external consumers (like
 *                Yeoman), or directly run Inquirer-based interactions.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Libraries
import  {TypeValidator}             from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {Builder}                   from  '@sfdx-falcon/builder';   // Abstract Class. Basis for creating "builder" classes that can create Tasks, Questions, and more.
import  {ExternalContext}           from  '@sfdx-falcon/builder';   // Class. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconPrompt}          from  '@sfdx-falcon/prompt';    // Class. Wraps user prompting/interaction functionality provided by Inquirer.
import  {SfdxFalconKeyValueTable}   from  '@sfdx-falcon/status';    // Class. Uses table creation code borrowed from the SFDX-Core UX library to make it easy to build "Key/Value" tables.

// Import SFDX-Falcon Types
import  {InquirerAnswers}           from  '@sfdx-falcon/types';     // Type. Alias to the Inquirer packaged type representing answers from a prompt.
import  {AnswersDisplay}            from  '@sfdx-falcon/types';     // Type. Defines a function that displays answers to a user.
import  {ConfirmationAnswers}       from  '@sfdx-falcon/types';     // Interface. Represents what an answers hash should look like during Yeoman/Inquirer interactions where the user is being asked to proceed/retry/abort something.
import  {JsonMap}                   from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import  {Questions}                 from  '@sfdx-falcon/types';     // Type. Alias to the Questions type from the yeoman-generator module.
import  {QuestionsBuilder}          from  '@sfdx-falcon/types';     // Type. Function type alias defining a function that returns Inquirer Questions.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:interview';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the options that can be set by the `SfdxFalconInterview` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface InterviewOptions<T extends JsonMap> {
  defaultAnswers: T;
  confirmation?: Questions | QuestionsBuilder | Builder;
  confirmationHeader?: string;
  invertConfirmation?: boolean;
  display?: AnswersDisplay<T>;
  displayHeader?: string;
  context?: object;
  sharedData?: object;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the options that can be set by the `InterviewGroup` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface InterviewGroupOptions<T extends JsonMap> {
  questions: Questions | QuestionsBuilder | Builder;
  questionsArgs?: unknown[];
  confirmation?: Questions | QuestionsBuilder | Builder;
  confirmationArgs?: unknown[];
  invertConfirmation?: boolean;
  display?: AnswersDisplay<T>;
  when?: ShowInterviewGroup;
  abort?: AbortInterview;
  title?: string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents a set of status indicators for an `SfdxFalconInterview`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface InterviewStatus {
  aborted?: boolean;
  completed?: boolean;
  reason?: string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type alias defining a function that checks whether an Interview should be aborted.
 */
export declare type AbortInterview = (groupAnswers:InquirerAnswers, userAnswers?:InquirerAnswers) => boolean | string;
/**
 * Type alias defining a function that can be used to determine boolean control-flow inside an Interview.
 */
export declare type InterviewControlFunction = (userAnswers:InquirerAnswers, sharedData?:object) => boolean | Promise<boolean>;
/**
 * Type alias defining a function or simple boolean that checks whether an Interview Group should be shown.
 */
export declare type ShowInterviewGroup = boolean | InterviewControlFunction;
//─────────────────────────────────────────────────────────────────────────────────────────────────┘

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       InterviewGroup
 * @summary     Represents the combination of an SFDX-Falcon Prompt with an "abort check" function.
 * @description Objects created from this class are able to be run through an Interview, one at a
 *              time, and have their "abort check" function executed once the user indicates they
 *              are ready to proceed.  This way, if the user provided data that is invalid, the
 *              entire interview can be aborted.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class InterviewGroup<T extends JsonMap> {

  // Public members.
  public  readonly  title:        string;
  public  readonly  abort:        AbortInterview;
  public            when:         ShowInterviewGroup;

  // Private members.
  private readonly falconPrompt:  SfdxFalconPrompt<T>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  InterviewGroup
   * @param       {SfdxFalconPrompt<T>} falconPrompt Required.
   * @param       {AbortInterview}  [abort] Optional.
   * @param       {ShowInterviewGroup}  [when] Optional.
   * @description Constructs an InterviewGroup object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(falconPrompt:SfdxFalconPrompt<T>, abort?:AbortInterview, when?:ShowInterviewGroup, title?:string) {
    this.falconPrompt = falconPrompt;
    this.abort        = abort;
    this.when         = when;
    this.title        = title;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prompt
   * @returns     {Promise<T>}  Returns the results of inquirer.prompt()
   * @description Executes the Inquirer prompt() function that lives inside of
   *              this SfdxFalconPrompt object.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async prompt():Promise<T> {
    if (this.title) {
      console.log(this.title);
    }
    return this.falconPrompt.prompt();
  }
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconInterview
 * @summary     Provides a standard way of building a multi-group Interview to collect user input.
 * @description Uses Inquirer to prompt the user in the terminal using a flexible, multi-group set
 *              of prompts.  Each group can have it's own set of "abort" questions, and may be shown
 *              or hidden independently. The Interview ends with a final "proceed/restart/abort"
 *              question for the user.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconInterview<T extends JsonMap> {

  // Public members
  public readonly   defaultAnswers: T;                                            // ???
  public            status:         InterviewStatus;                              // ???
  public            userAnswers:    T;                                            // ???
  public            when:           ShowInterviewGroup;                           // ???

  // Private members
  private readonly  _interviewGroups:     Array<InterviewGroup<T>>;               // ???
  private readonly  _confirmation:        Questions | QuestionsBuilder | Builder; // ???
  private readonly  _confirmationHeader:  string;                                 // ???
  private readonly  _display:             AnswersDisplay<T>;                      // ???
  private readonly  _displayHeader:       string;                                 // ???
  private readonly  _invertConfirmation:  boolean;                                // ???

  // Public Accessors
  public get finalAnswers():T {
    return {
      ...this.defaultAnswers as object,
      ...this.userAnswers as object
    } as T;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconInterview
   * @param       {InterviewOptions<T>} opts Required. Options that define the
   *              default answers, Prompt Engine, and special "context" object
   *              for the entire inteview. These values will be carried on to
   *              each SfdxFalconPrompt group contained in this Interview.
   * @description Constructs an SfdxFalconInterview object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:InterviewOptions<T>) {

    // Define function-local debug namespace and debug incoming args.
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Initialize this instance.
    this.defaultAnswers       = opts.defaultAnswers as T;
    this.userAnswers          = {} as T;
    this.status               = {aborted: false, completed: false};
    this._confirmation        = opts.confirmation;
    this._confirmationHeader  = opts.confirmationHeader || '';
    this._display             = opts.display;
    this._displayHeader       = opts.displayHeader      || '';
    this._invertConfirmation  = opts.invertConfirmation || false;
    this._interviewGroups     = new Array<InterviewGroup<T>>();
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createGroup
   * @param       {InterviewGroupOptions} opts  Required.
   * @returns     {void}
   * @description Given valid Interview Group Options, creates an SFDX-Falcon
   *              Prompt and then combines it with an "abort" function (if
   *              provided) in order to create an Interview Group.  The Interview
   *              Group is then added to the Interview Groups collection.
   * @public
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public createGroup(opts:InterviewGroupOptions<T>):void {

    // Define function-local debug namespace and reflect incoming arguments.
    const funcName    = `createGroup`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Create a new SFDX Falcon Prompt based on the incoming options.
    const falconPrompt = new SfdxFalconPrompt<T>({
      questions:          opts.questions,
      questionsArgs:      opts.questionsArgs,
      confirmation:       opts.confirmation,
      confirmationArgs:   opts.confirmationArgs,
      invertConfirmation: opts.invertConfirmation,
      defaultAnswers:     this.defaultAnswers,
      context:            this
    });

    // Create a new Interview Group using the Prompt we just created.
    const interviewGroup = new InterviewGroup<T>(falconPrompt, opts.abort, opts.when, opts.title);

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNsLocal}:interviewGroup:`, interviewGroup);

    // Add the new Interview Group to the Interview Groups Array.
    this._interviewGroups.push(interviewGroup);
  }
  
  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      start
   * @returns     {Promise<T>}  Returns the answers provided by the user.
   * @description Starts the interview. Once started, the Interview will only stop
   *              once completed, aborted by the user, or an Error is thrown.
   * @public @async
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  public async start():Promise<T> {

    // Define function-local debug namespace.
    const funcName    = `start`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    // DEBUG - Don't typically need this level of detail, so keep commented out.
    //SfdxFalconDebug.obj(`${dbgNsLocal}:_interviewGroups:`, this._interviewGroups);

    // Iterate over each Interview Group
    for (const interviewGroup of this._interviewGroups) {

      // Determine if this Interview Group should be skipped.
      if (await this.skipInterviewGroup(interviewGroup)) {
        SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Interview Group Skipped! `);
        continue;
      }

      // DEBUG
      SfdxFalconDebug.obj(`${dbgNsLocal}:userAnswers:`, this.userAnswers, `PRE-PROMPT: `);

      // Prompt the user with questions from the current Interview Group.
      const groupAnswers = await interviewGroup.prompt();

      // DEBUG
      SfdxFalconDebug.obj(`${dbgNsLocal}:groupAnswers:`, groupAnswers);
      
      // Blend the answers just provided with those from the Interview as a whole.
      this.userAnswers = {
      ...this.userAnswers as object,
      ...groupAnswers as object
      } as T;

      // DEBUG
      SfdxFalconDebug.obj(`${dbgNsLocal}:userAnswers:`, this.userAnswers, `POST-PROMPT: `);

      // Check if this group has an "abort" function. If so, check the abort conditions.
      if (typeof interviewGroup.abort === 'function') {
        const abort = interviewGroup.abort(groupAnswers, this.userAnswers);
        if (abort) {
          return this.abortInterview(abort as string);
        }
      }
    }

    // Return the FINAL (Default merged with User) answers to the caller.
    return await this.proceedRestartAbort();
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      abortInterview
   * @param       {string}
   * @returns     {T} Returns the Final Answers for this interview.
   * @description Marks the status of this Interview as "Aborted" and "Incomplete",
   *              then returns the interview's "Final Answers" to the caller.
   * @private
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  private abortInterview(message:string):T {
    console.log(`\n${message}`);
    this.status.aborted   = true;
    this.status.completed = false;
    this.status.reason    = message;
    return this.finalAnswers;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      displayAnswers
   * @returns     {Promise<void>}
   * @description Uses the Display function (if present) to display the User
   *              Answers from the prompt to the user. If the Display function
   *              returns void, it means that it rendered output to the user.
   *              If it returns an Array, it means that we need to manually
   *              render the returned data in a FalconTable.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async displayAnswers():Promise<void> {

    // If there's a Display Function, use that to build/display the output.
    if (typeof this._display === 'function') {

      // The display function *might* render something on its own. If it does, it will return void.
      const displayResults = await this._display(this.userAnswers);

      // If the display function returned an Array, then we'll show it to the user with a Falcon Table.
      if (Array.isArray(displayResults)) {
        const falconTable = new SfdxFalconKeyValueTable();

        // If there's a Display Header, render it. Otherwise, add a line break.
        if (this._displayHeader) {
          console.log(this._displayHeader);
        }
        else {
          console.log('');
        }

        // Render the Falcon Table, and add a line break afterwards.
        falconTable.render(displayResults);
        console.log('');
      }
    }
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      proceedRestartAbort
   * @returns     {Promise{T}}
   * @description Propmts the user with a special "final" prompt that needs to
   *              return a Confirmation Answers (proceed, restart) structure.
   *              If the user indicates a desire to "proceed", this function will
   *              return the Final Answers. If they want to "restart", this
   *              function will recursively call this.start(). If they don't want
   *              to proceed and they don't want to restart, the interview will
   *              be aborted.
   * @private @async
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  private async proceedRestartAbort():Promise<T> {

    // Define function-local debug namespace and reflect incoming arguments.
    const funcName    = `proceedRestartAbort`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    // Debug
    SfdxFalconDebug.obj(`${dbgNsLocal}:this.finalAnswers`, this.finalAnswers);

    // PROCEED if this Interview does NOT have confirmation questions.
    if (typeof this._confirmation === 'undefined') {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `No Confirmation Questions Found. PROCEED by default. `);
      return this.finalAnswers;
    }

    // If there is anything to display, displayAnswers() will take care of it.
    await this.displayAnswers();

    // If there is a Confirmation Header, show it here.
    if (this._confirmationHeader) {
      console.log(this._confirmationHeader);
    }

    // Create a Confirmation Answers structure to hold what we get back from the prompt.
    const confirmationDefaults = {
      proceed:  false,
      restart:  false
    } as ConfirmationAnswers;

    // Create a new SFDX Falcon Prompt based on the incoming options.
    const confirmationPrompt = new SfdxFalconPrompt<ConfirmationAnswers>({
      questions:          this._confirmation,
      defaultAnswers:     confirmationDefaults,
      context:            this
    });

    // Prompt the user for confirmation.
    const confirmationAnswers = await confirmationPrompt.prompt();

    // Process the Confirmation Answers and invert them if required.
    const invertConfirmation  = this._invertConfirmation ? 1 : 0;
    const proceed             = (invertConfirmation ^ (confirmationAnswers.proceed ? 1 : 0)) === 1 ? true : false;
    const restart             = (invertConfirmation ^ (confirmationAnswers.restart ? 1 : 0)) === 1 ? true : false;

    // ABORT
    if (proceed !== true && restart !== true) {
      SfdxFalconDebug.obj(`${dbgNsLocal}:confirmationDetails:`, {confirmationAnswers: confirmationAnswers, invertConfirmation: invertConfirmation, proceed: proceed, restart: restart}, `ABORT DETECTED. Relevant Variables: `);
      return this.abortInterview('Command Aborted');
    }

    // PROCEED
    if (proceed === true) {
      SfdxFalconDebug.obj(`${dbgNsLocal}:confirmationDetails:`, {confirmationAnswers: confirmationAnswers, invertConfirmation: invertConfirmation, proceed: proceed, restart: restart}, `PROCEED DETECTED. Relevant Variables: `);
      return this.finalAnswers;
    }

    // RESTART
    SfdxFalconDebug.obj(`${dbgNsLocal}:confirmationDetails:`, {confirmationAnswers: confirmationAnswers, invertConfirmation: invertConfirmation, proceed: proceed, restart: restart}, `RESTART DETECTED. Relevant Variables: `);
    console.log(''); // Place a line break before the restart.
    return this.start();
  }

  //─────────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      skipInterviewGroup
   * @param       {InterviewGroup<T>} interviewGroup  Required.
   * @returns     {Promise<boolean>}
   * @description Given an Interview Group, determines if that group should be
   *              skipped based on the result of the "when" member of the group.
   *              If the "when" member is a function, it's executed with the
   *              expectation of getting back a boolean. If it's a simple boolean,
   *              that value is returned. If there is no "when" member, the value
   *              returned defaults to FALSE, ensuring the group isn't skipped.
   * @private @async
   */
  //─────────────────────────────────────────────────────────────────────────────┘
  private async skipInterviewGroup(interviewGroup:InterviewGroup<T>):Promise<boolean> {

    // If the "when" member is already a boolean, just return the INVERSE value.
    if (typeof interviewGroup.when === 'boolean') {
      return !interviewGroup.when;
    }

    // If the "when" is a function, execute it and return the INVERSE value.
    if (typeof interviewGroup.when === 'function') {
      return !interviewGroup.when(this.userAnswers);
    }

    // If the "when" member wasn't a boolean OR a function, just return FALSE.
    // This means that, by default, any Interview Group with an undefined "when"
    // will always run.
    return false;
  }
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateInterviewScope
 * @param       {unknown} unknownContext  Required. The calling scope, ie. the caller's `this`
 *              scope or an `ExternalContext` object, that will be validated by this method.
 * @param       {string}  [dbgNsExt]  Optional. Allows the caller to specify a Debug Namespace that
 *              will be used by any `TypeValidator` errors to indicate where the callling code
 *              originated.
 * @description Ensures that the calling scope has access to a suite of certain variables that make
 *              it easier to build multi-step `Questions`.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateInterviewScope(unknownContext:unknown, dbgNsExt?:string):void {

  // Define function-local debug namespace.
  const funcName    = `validateInterviewScope`;
  const dbgNsLocal  = `${TypeValidator.isNotEmptyNullInvalidString(dbgNsExt) ? `${dbgNsExt}` : `${dbgNs}`}:${funcName}`;

  // Make sure we got a Calling Scope object.
  TypeValidator.throwOnEmptyNullInvalidObject(unknownContext, `${dbgNsLocal}`, `unknownContext`);

  // Two paths for validation depending on whether or not the "unknown context" is an `External Context` object.
  if (unknownContext instanceof ExternalContext) {

    // If the "unknown context" is an `ExternalContext` object, dig into the `context` member var for validation.
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext.context,                            `${dbgNsLocal}`, `ExternalContext.context`);
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext.context['answers'],                 `${dbgNsLocal}`, `ExternalContext.context.answers`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext.context['answers']['default'],      `${dbgNsLocal}`, `ExternalContext.context.answers.default`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext.context['answers']['user'],         `${dbgNsLocal}`, `ExternalContext.context.answers.user`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext.context['answers']['final'],        `${dbgNsLocal}`, `ExternalContext.context.answers.final`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext.context['answers']['meta'],         `${dbgNsLocal}`, `ExternalContext.context.answers.meta`);
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext.context['answers']['confirmation'], `${dbgNsLocal}`, `ExternalContext.context.answers.confirmation`);
  }
  else {

    // If we get here, the "unknown context" is likely the caller's `this` context.
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext['answers'],                 `${dbgNsLocal}`, `CallingContext.answers`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext['answers']['default'],      `${dbgNsLocal}`, `CallingContext.answers.default`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext['answers']['user'],         `${dbgNsLocal}`, `CallingContext.answers.user`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext['answers']['final'],        `${dbgNsLocal}`, `CallingContext.answers.final`);
    TypeValidator.throwOnNullInvalidObject      (unknownContext['answers']['meta'],         `${dbgNsLocal}`, `CallingContext.answers.meta`);
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext['answers']['confirmation'], `${dbgNsLocal}`, `CallingContext.answers.confirmation`);
    TypeValidator.throwOnEmptyNullInvalidObject (unknownContext['answers']['sharedData'],   `${dbgNsLocal}`, `CallingContext.answers.sharedData`);
  }
}
