//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/generator/src/project-generator.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports `SfdxFalconProjectGenerator` for use with custom Yeoman generators that
 *                focus on standing up local projects.
 * @description   Exports an abstract class that extends the SFDX-Falcon Library's `SfdxFalconGenerator`
 *                class, adding customized support for tools and capabilities that make it easier
 *                to stand up a local git-based project.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {JsonMap}       from  '@salesforce/ts-types'; // Any JSON-compatible object.
//import  chalk           from  'chalk';                // Helps write colored text to the console.
//import  * as path       from  'path';                 // Library. Helps resolve local paths at runtime.
import  * as Generator  from  'yeoman-generator';     // Class. Custom Generator classes must extend this.

// Import SFDX-Falcon Libraries
//import  {GitUtil}                 from  '@sfdx-falcon/util';                  // Library. Git Helper functions specific to SFDX-Falcon.
//import  listrTasks            from  '@sfdx-falcon/util';          // Library. Helper functions that make using Listr with SFDX-Falcon easier.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';       // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxEnvironment}           from  '@sfdx-falcon/environment'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconInterview}       from  '@sfdx-falcon/interview';   // Class. Provides a standard way of building a multi-group Interview to collect user input.
import  {SfdxFalconResult}          from  '@sfdx-falcon/status';      // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {printStyledMessage}        from  '@sfdx-falcon/status';      // Function. Prints a Styled Message to the console using Chalk.
//import  {SfdxFalconKeyValueTable}   from  '@sfdx-falcon/status';      // Class. Uses table creation code borrowed from the SFDX-Core UX library to make it easy to build "Key/Value" tables.
import  {GeneratorStatus}           from  '@sfdx-falcon/status';      // Class. Status tracking object for use with Yeoman Generators.

// Import SFDX-Falcon Types
import  {GeneratorOptions}            from  '@sfdx-falcon/command';     // Interface. Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
import  {SfdxEnvironmentRequirements} from  '@sfdx-falcon/environment'; // Interface. Represents the elements of the local SFDX Environment that are required by the calling code.
import  {SfdxFalconTableData}         from  '@sfdx-falcon/status';      // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
//import  {InquirerChoices}           from  '@sfdx-falcon/types';       // Type. Represents a single "choice" option in an Inquirer multi-choice/multi-select question.
//import  {ListrContextFinalizeGit}   from  '@sfdx-falcon/types';       // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
//import  {ListrTaskBundle}           from  '@sfdx-falcon/types';       // Interface. Represents the suite of information required to run a Listr Task Bundle.
import  {StatusMessageType}         from  '@sfdx-falcon/types';       // Enum. Represents the various types/states of a Status Message.
import  {StyledMessage}             from  '@sfdx-falcon/types';       // Interface. Allows for specification of a message string and chalk-specific styling information.

// Requires
//const {version}         = require('../../../package.json'); // The version of the SFDX-Falcon plugin
//const {falcon}          = require('../../../package.json'); // The custom "falcon" key from package.json. This holds custom project-level values.
//const yosay             = require('yosay');                 // ASCII art creator brings Yeoman to life.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:project-generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Define function-local debug namespace.
//const funcName    = `myFuncName`;
//const dbgNsLocal  = `${dbgNs}:${funcName}`;
//SfdxFalconDebug.msg(`${dbgNsLocal}:`, `This is how you do debug.`);

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of objects that represent the Answers that will be leveraged by an
 * `SfdxFalconGenerator`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface Answers<T extends JsonMap> {
  /** Required. The set of default answers for the Interview of an `SfdxFalconGenerator`. */
  default:  T;
  /** Required. The set of answers provided by the user for the Interview of an `SfdxFalconGenerator`. */
  user:     T;
  /** Required. The set of final answers for the Interview of an `SfdxFalconGenerator`. In other words, the merging of User and Default answers in case the user did not supply some answers. */
  final:    T;
  /** Optional. Special set of answers. Provides a means to send meta values (usually template tags) to EJS templates. */
  meta?:    T;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of message strings that are displayed at various times during the execution
 * of an `SfdxFalconGenerator`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface GeneratorMessage {
  /** Required. Message shown to the user before exiting the initializing() run-loop function. */
  confirmation: string;
  /** Required. Message that will be displayed by the yosay "Yeoman" ASCII art when the generator is loaded. */
  opening:      string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon successful completion of the Generator. */
  success:      string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon failure of the Generator. */
  failure:      string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon partial success of the Generator.  */
  warning:      string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of requirements for the initialization process of an `SfdxFalconGenerator`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface GeneratorRequirements {
  gitEnvReqs:   object;
  sfdxEnvReqs:  SfdxEnvironmentRequirements;
  localEnvReqs: object;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of status `boolean` variables that reflect the status of various Yeoman
 * run-loop functions.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface RunLoopStatus {
  /** Required. Indicates that the `initializing()` run-loop function has completed successfully. */
  initializingComplete:   boolean;
  /** Required. Indicates that the `prompting()` run-loop function has completed successfully. */
  promptingComplete:      boolean;
  /** Required. Indicates that the `configuring()` run-loop function has completed successfully. */
  configuringComplete:    boolean;
  /** Required. Indicates that the `writing()` run-loop function has completed successfully. */
  writingComplete:        boolean;
  /** Required. Indicates that the `install()` run-loop function has completed successfully. */
  installComplete:        boolean;
  /** Required. Indicates that the `end()` run-loop function completed successfully. */
  endComplete:            boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconGenerator
 * @extends     Generator
 * @summary     Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.
 * @description Classes that extend `SfdxFalconGenerator` must provide a type parameter to
 *              ensure that the "answers" family of member variables (`defaultAnswers`,
 *              `userAnswers`, `metaAnswers`, and `finalAnswers`) has the appropriate interface
 *              type which defines the answers that are relevant to a concrete child class.
 * @public @abstract
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconGenerator<T extends JsonMap> extends Generator {

  // Protected class members
  /** Name of the CLI command that kicked off this Generator. */
  protected readonly  commandName:              string;
  /** Version of the plugin that's running this Generator. Taken dynamically from `package.json`. */
  protected readonly  pluginVersion:            string;
  /** Custom `falcon` options key from `package.json`. Can be used to read package-global settings that a plugin developer chooses to add to `package.json`. */
  protected readonly  falcon:                   JsonMap;
  /** Specifies the various messages used by this Generator. */
  protected readonly  generatorMessage:         GeneratorMessage;
  /** Tracks the name (type) of Generator being run, eg. `clone-appx-package-project`. */
  protected readonly  generatorType:            string;
  /** Tracks the path to the of the source file containing the Generator being run, eg `../../generators`. */
  protected readonly  generatorPath:            string;
  /** Used to keep track of status and to return messages to the caller. */
  protected readonly  generatorStatus:          GeneratorStatus;
  /** Used to keep track of status and to return messages to the caller. */
  protected readonly  generatorResult:          SfdxFalconResult;
  /** Determines which initialization tasks are performed during the Default Initialization process. */
  protected readonly  generatorReqs:            GeneratorRequirements;
  /** Tracks the status of various run-loop functions. */
  protected readonly  runLoopStatus:            RunLoopStatus;
  /** Collection of objects that represent the Answers to questions that will be asked during the Interview. */
  protected readonly  answers:                  Answers<T>;
  /** Used to share data between the Generator, Inqurirer Prompts, and Listr Tasks. */
  protected readonly  sharedData:               object;
  /** Holds the `SfdxFalconInterview` object that will be run during the `prompting()` run-loop function. */
  protected userInterview:                      SfdxFalconInterview<T>;
  /** Represents the SFDX Environment. */
  protected sfdxEnv:                            SfdxEnvironment;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconGenerator
   * @param       {string|string[]} args Required. Array of arguments that are
   *              passed to this generator by Yeoman if the generator is being
   *              invoked from the command line. Passed directly through to
   *              the superclass constructor without modification.
   * @param       {GeneratorOptions}  opts Required. Object containing options
   *              that help specify how a specific generator is run. These
   *              options are set when external code uses a Yeoman Environment
   *              to `run()` a Generator that's derived from this class.
   * @description Constructs an `SfdxFalconGenerator` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(args:string|string[], opts:GeneratorOptions, reqs:GeneratorRequirements) {

    // Define function-local debug namespace and debug incoming arguments.
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate core options.
    TypeValidator.throwOnEmptyNullInvalidObject (reqs,               `${dbgNsLocal}`, `GeneratorRequirements`);
    TypeValidator.throwOnEmptyNullInvalidObject (reqs.gitEnvReqs,    `${dbgNsLocal}`, `GeneratorRequirements.gitEnvReqs`);
    TypeValidator.throwOnEmptyNullInvalidObject (reqs.localEnvReqs,  `${dbgNsLocal}`, `GeneratorRequirements.localEnvReqs`);
    TypeValidator.throwOnEmptyNullInvalidObject (reqs.sfdxEnvReqs,   `${dbgNsLocal}`, `GeneratorRequirements.sfdxEnvReqs`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts,               `${dbgNsLocal}`, `GeneratorOptions`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.commandName,   `${dbgNsLocal}`, `GeneratorOptions.commandName`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorType, `${dbgNsLocal}`, `GeneratorOptions.generatorType`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.generatorPath, `${dbgNsLocal}`, `GeneratorOptions.generatorPath`);
    TypeValidator.throwOnNullInvalidInstance    (opts.generatorResult,  SfdxFalconResult,  `${dbgNsLocal}`, `GeneratorOptions.generatorType`);

    // Call the parent constructor to initialize the Yeoman Generator.
    super(args, opts);

    // Resolve Generator Requirements
    const generatorReqs:GeneratorRequirements = {
      sfdxEnvReqs: {
        standardOrgs:     (reqs.sfdxEnvReqs.standardOrgs      === true ? true : false),
        scratchOrgs:      (reqs.sfdxEnvReqs.scratchOrgs       === true ? true : false),
        devHubOrgs:       (reqs.sfdxEnvReqs.devHubOrgs        === true ? true : false),
        envHubOrgs:       (reqs.sfdxEnvReqs.envHubOrgs        === true ? true : false),
        managedPkgOrgs:   (reqs.sfdxEnvReqs.managedPkgOrgs    === true ? true : false),
        unmanagedPkgOrgs: (reqs.sfdxEnvReqs.unmanagedPkgOrgs  === true ? true : false)
      },
      gitEnvReqs: {
        // TODO: Implement once Git Environment is fleshed out.
      },
      localEnvReqs: {
        // TODO: Implement once Local Environment is fleshed out.
      }
    };

    // Determine the path to the package.json file for the currently running package.
    const pkgDotJsonPath    = '../../../package.json';

    // Attempt to pull the VERSION key from package.json.
    let pkgVersion:string = `??.??.??`;
    try {
      const {version} = require(pkgDotJsonPath);
      pkgVersion  = TypeValidator.isNotEmptyNullInvalidString(version) ? version : pkgVersion;
    }
    catch (pkgVersionJsonError) {
      SfdxFalconDebug.obj(`${dbgNsLocal}:pkgVersionJsonError:`, pkgVersionJsonError);
    }
    SfdxFalconDebug.str(`${dbgNsLocal}:pkgVersion:`, pkgVersion);

    // Attempt to pull the FALCON key from package.json.
    let pkgFalcon:JsonMap = {};
    try {
      const {falcon} = require(pkgDotJsonPath);
      pkgFalcon = TypeValidator.isNotNullInvalidObject(falcon) ? falcon : pkgFalcon;
    }
    catch (pkgFalconJsonError) {
      SfdxFalconDebug.obj(`${dbgNsLocal}:pkgFalconJsonError:`, pkgFalconJsonError);
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:pkgFalcon:`, pkgFalcon);

    // Initialize class members.
    this.commandName          = opts.commandName;       // Name of the command that's executing the Generator (eg. 'falcon:adk:clone').
    this.generatorType        = opts.generatorType;     // Type (ie. file name minus the .ts extension) of the Generator being run.
    this.generatorResult      = opts.generatorResult;   // Used for activity tracking and communication back to the calling command.
    this.generatorReqs        = generatorReqs;          // Generator Requirements. Should be modified by the derived class.
    this.generatorStatus      = new GeneratorStatus();  // Tracks status and build messages to the user.
    this.pluginVersion        = pkgVersion;             // Version of the plugin, taken from package.json.
    this.falcon               = pkgFalcon;              // Falcon global JsonMap, taken from package.json.
    this.sharedData           = {} as object;           // Special context for sharing data between Generator, Inquirer Questions, and Listr Tasks.

    // Initialize all Run-Loop Status booleans to `null`.
    // In practice, `null` will mean an unset value, `false` means failure, `true` means success.
    this.runLoopStatus = {
      initializingComplete: null,
      promptingComplete:    null,
      configuringComplete:  null,
      writingComplete:      null,
      installComplete:      null,
      endComplete:          null
    };

    // Initialize all Answer objects.
    this.answers = {
      default:  {} as T,
      final:    {} as T,
      user:     {} as T,
      meta:     {} as T
    };

    // Set defaults for all Generator messages.
    this.generatorMessage = {
      opening:      `SFDX-Falcon Powered Plugin\n${this.commandName}\nv${this.pluginVersion}`,
      confirmation: `Would you like to proceed based on the above settings?`,
      success:      `${this.commandName} completed successfully`,
      failure:      `${this.commandName} exited without completing the expected tasks`,
      warning:      `${this.commandName} completed successfully, but with some warnings (see above)`
    };

    // Start the GeneratorStatus object and add it to the detail of the GENERATOR Result.
    this.generatorStatus.start();
    this.generatorResult.setDetail({
      commandName:        this.commandName,
      generatorType:      this.generatorType,
      generatorPath:      this.generatorPath,
      generatorReqs:      this.generatorReqs,
      generatorMsgs:      this.generatorMessage,
      interviewAnswers:   this.answers,
      runLoopStatus:      this.runLoopStatus,
      generatorStatus:    this.generatorStatus
    });
    this.generatorResult.debugResult(`After setting Detail in constructor`, `${dbgNsLocal}`);

    // Initialize Shared Data.
    this.sharedData['cliCommandName']               = this.commandName;
//    this.sharedData['generatorRequirements']        = this.generatorRequirements;
    this.sharedData['generatorStatus']              = this.generatorStatus;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initializing
   * @returns     {Promise<void>}
   * @description STEP ONE in the Yeoman run-loop.  Uses Yeoman's "initializing"
   *              run-loop priority.  This is a "default" implementation and
   *              should work for most SFDX-Falcon use cases. It must be called
   *              from inside the initializing() method of the child class.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  public async initializing():Promise<void> {

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_default_initializing:`, `Generator has been aborted.`);
      return;
    }

    // Show the Yeoman to announce that the generator is running.
    this.log(yosay(this.generatorMessage.opening));

    // Execute the initialization tasks for this generator
    try {
      await this._executeInitializationTasks();
    }
    catch (initializationError) {

      SfdxFalconDebug.obj(`${dbgNs}default_initializing:`, initializationError, `initializationError: `);

      // Add an "abort" item to the Generator Status object.
      this.generatorStatus.abort({
        type:     StatusMessageType.ERROR,
        title:    'Initialization Error',
        message:  `${this.commandName} command aborted because one or more initialization tasks failed`
      });

      // Throw an Initialization Error.
      throw new SfdxFalconError( `Command initialization failed. ${initializationError.message}`
                               , `InitializationError`
                               , `${dbgNs}default_initializing`
                               , SfdxFalconError.wrap(initializationError));
    }

    // Add a line break to separate this section from the next in the console.
    console.log('');
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prompting
   * @param       {StyledMessage} [preInterviewMessage] Optional. Message to
   *              display to the user before the Interview starts.
   * @param       {StyledMessage} [postInterviewMessage]  Optional. Message to
   *              display to the user after the Interview ends.
   * @returns     {Promise<void>}
   * @description STEP TWO in the Yeoman run-loop. Interviews the User to get
   *              information needed by the "writing" and "installing" phases.
   *              This is a "default" implementation and should work for most
   *              SFDX-Falcon use cases. It must be called from inside the
   *              prompting() method of the child class.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async prompting(preInterviewMessage?:StyledMessage, postInterviewMessage?:StyledMessage):Promise<void> {

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}:prompting:`, `Generator has been aborted.`);
      return;
    }

    // Show the pre-interview message.
    printStyledMessage(preInterviewMessage);

    // Build the User Interview.
    this.userInterview = this._buildInterview();

    // Start the User Interview.
    this.answers.final = await this.userInterview.start();

    // Extract the "User Answers" from the Interview for inclusion in the GENERATOR Result's detail.
    (this.generatorResult.detail as object)['userAnswers'] = this.userInterview.userAnswers;

    // Check if the user aborted the Interview.
    if (this.userInterview.status.aborted) {
      this.generatorStatus.abort({
        type:     StatusMessageType.ERROR,
        title:    'Command Aborted',
        message:  `${this.commandName} canceled by user. ${this.userInterview.status.reason}`
      });
    }

    // Show the post-interview message.
    printStyledMessage(postInterviewMessage);

    // Done
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      configuring
   * @returns     {void}
   * @description STEP THREE in the Yeoman run-loop. Perform any pre-install
   *              configuration steps based on the answers provided by the User.
   *              This is a "default" implementation and should work for most
   *              SFDX-Falcon use cases. It must be called from inside the
   *              configuring() method of the child class.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async configuring():Promise<void> {

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_default_configuring:`, `Generator has been aborted.`);
      return;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writing
   * @returns     {Promise<void>}
   * @description STEP FOUR in the Yeoman run-loop. Typically, this is where
   *              you perform filesystem writes, git clone operations, etc.
   *              This is a "default" implementation and should work for most
   *              SFDX-Falcon use cases. It must be called from inside the
   *              writing() method of the child class.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async writing():Promise<void> {

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_default_writing:`, `Generator has been aborted.`);
      return;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      install
   * @returns     {Promise<void>}
   * @description STEP FIVE in the Yeoman run-loop. Typically, this is where
   *              you perform operations that must happen AFTER files are
   *              written to disk. For example, if the "writing" step downloaded
   *              an app to install, the "install" step would run the
   *              installation. This is a "default" implementation and should
   *              work for most SFDX-Falcon use cases. It must be called from
   *              inside the install() method of the child class.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async install():Promise<void> {

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_default_install:`, `Generator has been aborted.`);
      return;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      end
   * @returns     {Promise<void>}
   * @description STEP SIX in the Yeoman run-loop. This is the FINAL step that
   *              Yeoman runs and it gives us a chance to do any post-Yeoman
   *              updates and/or cleanup. This is a "default" implementation
   *              and should work for most SFDX-Falcon use cases. It must be
   *              called from inside the end() method of the child class.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async end():Promise<void> {

    // Check if the Yeoman interview/installation process was aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}end:`, `generatorStatus.aborted found as TRUE inside end()`);

      // Add a final error message
      this.generatorStatus.addMessage({
        type:     StatusMessageType.ERROR,
        title:    'Command Failed',
        message:  `${this.generatorMessage.failure}\n`
      });
    }
    else {
      // Generator completed successfully. Final message depends on presence of Generator Status Warnings.
      this.generatorStatus.complete([
        {
          type:     StatusMessageType.SUCCESS,
          title:    'Command Succeded',
          message:  this.generatorStatus.hasWarning
                    ? `${this.generatorMessage.warning}\n`
                    : `${this.generatorMessage.success}\n`
        }
      ]);
    }

    // Print the final status table.
    this.generatorStatus.printStatusMessages();
    return;
  }

  // Define abstract methods.
  /** Builds a complete `SfdxFalconInterview` object, which may include zero or more confirmation groupings. */
  protected abstract        _buildInterview():SfdxFalconInterview<T>;
  /** Creates Interview Answers table data. Can be used to render an `SfdxFalconTable` object. */
  protected abstract async  _buildInterviewAnswersTableData(userAnswers:T):Promise<SfdxFalconTableData>;
  /** STEP ONE in the Yeoman run-loop. Uses Yeoman's "initializing" run-loop priority. */
  protected abstract async  _initializing():Promise<void>;
  /** STEP TWO in the Yeoman run-loop. Interviews the User to get information needed by the `_writing()` and `_install()` functions. */
  protected abstract async  _prompting():Promise<void>;
  /** STEP THREE in the Yeoman run-loop. Perform any pre-install configuration steps based on the answers provided by the User. */
  protected abstract async  _configuring():Promise<void>;
  /** STEP FOUR in the Yeoman run-loop. Typically, this is where you perform filesystem writes, git clone operations, etc. */
  protected abstract async  _writing():Promise<void>;
  /** STEP FIVE in the Yeoman run-loop. Typically, this is where you perform operations that must happen AFTER files are written to disk. For example, if the `_writing()` step downloaded an app to install, the `_install()` step would run the installation. */
  protected abstract async  _install():Promise<void>;
  /** STEP SIX in the Yeoman run-loop. This is the FINAL step that Yeoman runs and it gives us a chance to do any post-Yeoman updates and/or cleanup. */
  protected abstract async  _end():Promise<void>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _cloneRepository
   * @returns     {Promise<string>} Local path into which the Git Repository
   *              was cloned. If the clone operation is unsuccessful, this
   *              will return an empty string.
   * @description Clones a remote Git Repository per information specified
   *              during by the command and/or during their interview. Returns
   *              the local path to which the Git Repository was cloned, or
   *              an empty string otherwise.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  protected async _cloneRepository():Promise<string> {

    // Determine a number of Path/Git related strings required by this step.
    const targetDirectory   = this.answers.final['targetDirectory'] as string;
    const gitRemoteUri      = this['gitRemoteUri'];
    const gitCloneDirectory = this['gitCloneDirectory'] || GitUtil.getRepoNameFromUri(gitRemoteUri);
    const localProjectPath  = path.join(targetDirectory, gitCloneDirectory);

    // Quick message saying we're going to start cloning.
    this.log(chalk`{yellow Cloning Project...}`);

    // Run a Listr Task that will clone the Remote Git Repo.
    return await listrTasks.cloneGitRemote.call(this, gitRemoteUri, targetDirectory, gitCloneDirectory).run()
      .then((_listrContext:unknown) => {
        // Add a message that the cloning was successful.
        this.generatorStatus.addMessage({
          type:     StatusMessageType.SUCCESS,
          title:    `Project Cloned Successfully`,
          message:  `Project cloned to ${localProjectPath}`
        });
        return localProjectPath;
      })
      .catch(gitCloneError => {
        this.generatorStatus.abort({
          type:     StatusMessageType.ERROR,
          title:    `Git Clone Error`,
          message:  gitCloneError.cause ? String(gitCloneError.cause.message).trim() : gitCloneError.message
        });
        return '';
      });
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _executeInitializationTasks
   * @returns     {Promise<void>}
   * @description Runs a series of initialization tasks using the Listr UX/Task
   *              Runner module.  Listr provides a framework for executing tasks
   *              while also providing an attractive, realtime display of task
   *              status (running, successful, failed, etc.).
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  protected async _executeInitializationTasks():Promise<void> {

    // Define the first group of tasks (Git Initialization).
    const gitInitTasks = listrTasks.gitEnvironmentCheck.call(this, this.generatorRequirements.gitRemoteUri);

    // Define the second group of tasks (SFDX Initialization).
    const sfdxInitTasks = listrTasks.sfdxInitTasks.call(this);

    // Show a message to the User letting them know we're going to initialize this command.
    console.log(chalk`{yellow Initializing ${this.cliCommandName}...}`);

    // If required, run the Git Init Tasks.
    if (this.generatorRequirements.git || this.generatorRequirements.gitRemoteUri) {
      const gitInitResults = await gitInitTasks.run();
      SfdxFalconDebug.obj(`${dbgNs}_executeInitializationTasks:`, gitInitResults, `gitInitResults: `);
    }

    // If required, run the SFDX Init Tasks.
    if (    this.generatorRequirements.standardOrgs     === true
        ||  this.generatorRequirements.scratchOrgs      === true
        ||  this.generatorRequirements.devHubOrgs       === true
        ||  this.generatorRequirements.envHubOrgs       === true
        ||  this.generatorRequirements.managedPkgOrgs   === true
        ||  this.generatorRequirements.unmanagedPkgOrgs === true
    ) {
      const sfdxInitResults = await sfdxInitTasks.run();
      SfdxFalconDebug.obj(`${dbgNs}_executeInitializationTasks:`, sfdxInitResults, `sfdxInitResults: `);
    }
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _finalizeGitActions
   * @param       {string}  destinationRoot Required.
   * @param       {boolean} isInitializingGit Required.
   * @param       {string}  gitRemoteUri  Required.
   * @param       {string}  projectAlias  Required.
   * @returns     {Promise<void>}
   * @description Intended to run after _finalizeProjectCreation() during the
   *              Yeoman "writing" phase.  Initializes local Git repo, and will
   *              even try to attach a Git remote if specified by the user.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  protected async _finalizeGitActions(destinationRoot:string, isInitializingGit:boolean, gitRemoteUri:string, projectAlias:string):Promise<void> {

    // Make sure that the caller really WANTS to initialize Git.
    if (isInitializingGit !== true) {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.SUCCESS,
        title:    `Git Initialization`,
        message:  `Skipped - Git initialization skipped at user's request`
      });
      return;
    }

    // Tell the user that we are adding their project to Git
    this.log(chalk`{yellow Adding project to Git...}`);

    // Construct a Listr Task Object for the "Finalize Git" tasks.
    const finalizeGit = listrTasks.finalizeGit.call(this, destinationRoot, gitRemoteUri);

    // Try to run the "Finalize Git" tasks. Catch any errors so we can exit the broader Falcon command gracefully.
    let finalizeGitCtx = {} as ListrContextFinalizeGit;
    try {
      finalizeGitCtx = await finalizeGit.run() as ListrContextFinalizeGit;
    }
    catch (listrError) {
      SfdxFalconDebug.obj(`${dbgNs}_finalizeGitActions:listrError:`, listrError, `listrError: `);
      finalizeGitCtx = listrError.context;
    }

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNs}_finalizeGitActions:finalizeGitCtx:`, finalizeGitCtx, `finalizeGitCtx: `);

    // Separate the end of the "Finalize Git" Listr tasks from following output.
    console.log('');

    // Check if Git was installed in the local environment.
    if (finalizeGitCtx.gitInstalled !== true) {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.WARNING,
        title:    `Initializing Git`,
        message:  `Warning - git executable not found in your environment - no Git operations attempted`
      });
      
      // Skip the remaining checks and message builds.
      return;
    }

    // Check if the project was successfully initialized (ie. "git init" was run in the project directory).
    if (finalizeGitCtx.gitInitialized) {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.SUCCESS,
        title:    `Git Initialization`,
        message:  `Success - Repository created successfully (${projectAlias})`
      });
    }
    else {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.WARNING,
        title:    `Git Initialization`,
        message:  `Warning - Git could not be initialized in your project folder`
      });

      // Skip the remaining checks and message builds.
      return;
    }

    // Check if the files were staged and committed successfully.
    if (finalizeGitCtx.projectFilesStaged && finalizeGitCtx.projectFilesCommitted) {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.SUCCESS,
        title:    `Git Commit`,
        message:  `Success - Staged all project files and executed the initial commit`
      });
    }
    else {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.WARNING,
        title:    `Git Commit`,
        message:  `Warning - Attempt to stage and commit project files failed - Nothing to commit`
      });
    }

    // If the user specified a Git Remote, check for success there.
    if (gitRemoteUri) {

      // Check if the Git Remote is valid/reachable
      if (finalizeGitCtx.gitRemoteIsValid !== true) {
        this.generatorStatus.addMessage({
          type:     StatusMessageType.WARNING,
          title:    `Git Remote`,
          message:  `Warning - Could not add Git Remote - ${gitRemoteUri} is invalid/unreachable`
        });
      }
      else {
        if (finalizeGitCtx.gitRemoteAdded) {
          this.generatorStatus.addMessage({
            type:     StatusMessageType.SUCCESS,
            title:    `Git Remote`,
            message:  `Success - Remote repository ${gitRemoteUri} added as "origin"`
          });
        }
        else {
          this.generatorStatus.addMessage({
            type:     StatusMessageType.WARNING,
            title:    `Git Remote`,
            message:  `Warning - Could not add Git Remote - A remote named "origin" already exists`
          });
        }
      }
    }

    // All done.
    return;
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _finalizeProjectCloning
   * @returns     {boolean} Returns FALSE if the project was aborted.
   * @description Intended to run after the Yeoman "writing" phase.  Has logic
   *              that ensures the Generator wasn't aborted, and then carries
   *              out finalization tasks that are generic to "cloning"
   *              Generators. Returns a boolean so the calling class can decide
   *              whether or not to perform additional actions.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _finalizeProjectCloning():boolean {

    // Check if we need to abort the Yeoman interview/installation process.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_finalizeProjectCloning:`, `generatorStatus.aborted found as TRUE inside install()`);
      return false;
    }

    // Make sure that a Destination Root was set.
    if (!this.destinationRoot()) {
      SfdxFalconDebug.msg(`${dbgNs}_finalizeProjectCloning:`, `No value returned by this.destinationRoot(). Skipping finalization tasks.`);
      return false;
    }

    // If we get here, it means that a local SFDX-Falcon config file was likely created.
    this.generatorStatus.addMessage({
      type:     StatusMessageType.SUCCESS,
      title:    `Local Config Created`,
      message:  `.sfdx-falcon/sfdx-falcon-config.json created and customized successfully`
    });

    // Add a line break to separate the end of the "writing" phase from any output in the "install" phase.
    console.log('');

    // All done.
    return true;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _finalizeProjectCreation
   * @returns     {boolean} Returns FALSE if the project was aborted.
   * @description Intended to run after the Yeoman "writing" phase.  Has logic
   *              that ensures the Generator wasn't aborted, and then carries
   *              out finalization tasks that are generic to "creation"
   *              Generators. Returns a boolean so the calling class can decide
   *              whether or not to perform additional actions.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _finalizeProjectCreation():boolean {

    // Check if we need to abort the Yeoman interview/installation process.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}_finalizeProjectCreation:`, `generatorStatus.aborted found as TRUE inside install()`);
      return false;
    }

    // Make sure that a Destination Root was set.
    if (!this.destinationRoot()) {
      SfdxFalconDebug.msg(`${dbgNs}_finalizeProjectCreation:`, `No value returned by this.destinationRoot(). Skipping finalization tasks.`);
      return false;
    }

    // Add a "project creation" success message to Generator Status.
    this.generatorStatus.addMessage({
      type:     StatusMessageType.SUCCESS,
      title:    `Project Creation`,
      message:  `Success - Project created at ${this.destinationRoot()}`
    });

    // Add a line break to separate the end of the "writing" phase from any output in the "install" phase.
    console.log('');

    // If we get this far, return TRUE so additional finalization code knows it should run.
    return true;
  }
}
