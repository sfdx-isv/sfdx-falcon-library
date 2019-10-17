//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/generator/src/generator.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports `SfdxFalconGenerator` for use with custom Yeoman generators.
 * @description   Exports an abstract class that extends Yeoman's `Generator` class, adding
 *                customized support for SFDX-Falcon specific tools and capabilities.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  * as Generator              from  'yeoman-generator';           // Class. Custom Generator classes must extend this.

// Import SFDX-Falcon Libraries
import  {BannerUtil}                from  '@sfdx-falcon/util';          // Library. Helper functions for building and showing banners to the user.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxEnvironment}           from  '@sfdx-falcon/environment';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconInterview}       from  '@sfdx-falcon/interview';     // Class. Provides a standard way of building a multi-group Interview to collect user input.
import  {SfdxFalconResult}          from  '@sfdx-falcon/status';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {printStyledMessage}        from  '@sfdx-falcon/status';        // Function. Prints a Styled Message to the console using Chalk.
import  {GeneratorStatus}           from  '@sfdx-falcon/status';        // Class. Status tracking object for use with Yeoman Generators.

// Import SFDX-Falcon Types
import  {ExternalContext}             from  '@sfdx-falcon/builder';     // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {GeneratorOptions}            from  '@sfdx-falcon/command';     // Interface. Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
import  {SfdxEnvironmentRequirements} from  '@sfdx-falcon/environment'; // Interface. Represents the elements of the local SFDX Environment that are required by the calling code.
import  {SfdxFalconTableData}         from  '@sfdx-falcon/status';      // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import  {ConfirmationAnswers}         from  '@sfdx-falcon/types';       // Interface. Represents what an answers hash should look like during Yeoman/Inquirer interactions where the user is being asked to proceed/retry/abort something.
import  {JsonMap}                     from  '@sfdx-falcon/types';       // Interface. Any JSON-compatible object.
import  {StatusMessageType}           from  '@sfdx-falcon/types';       // Enum. Represents the various types/states of a Status Message.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of objects that represent the Answers that will be leveraged by an
 * `SfdxFalconGenerator`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface Answers<T extends JsonMap> {
  /** Required. The set of default answers for the Interview of an `SfdxFalconGenerator`. */
  default:      T;
  /** Required. The set of answers provided by the user for the Interview of an `SfdxFalconGenerator`. */
  user:         T;
  /** Required. The set of final answers for the Interview of an `SfdxFalconGenerator`. In other words, the merging of User and Default answers in case the user did not supply some answers. */
  final:        T;
  /** Required. Special set of answers. Provides a means to send meta values (usually template tags) to EJS templates. */
  meta:         T;
  /** Required. The set of answers provided when the user is asked to proceed/retry/abort something. */
  confirmation: ConfirmationAnswers;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of message strings that are displayed at various times during the execution
 * of an `SfdxFalconGenerator`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface GeneratorMessages {
  /** Required. Message that will be displayed by the yosay "Yeoman" ASCII art when the generator is loaded. */
  opening:        string;
  /** Required. Message shown to the user before the interview starts during the prompting() run-loop function. */
  preInterview:   string;
  /** Required. Message shown to the user to help them decide to exit the prompting() run-loop function. */
  confirmation:   string;
  /** Required. Message shown to the user after the interview ends but before the prompting() run-loop function exits. */
  postInterview:  string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon successful completion of the Generator. */
  success:        string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon failure of the Generator. */
  failure:        string;
  /** Required. Message that will be displayed by the `end()` run-loop function upon partial success of the Generator.  */
  warning:        string;
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
  /** Debug namespace of the derived class. Makes it easier to debug superclass operations when extending `SfdxFalconGenerator`. */
  protected readonly  dbgNs:                    string;
  /** Name of the CLI command that kicked off this Generator. */
  protected readonly  commandName:              string;
  /** External Context describing an instance of the derived class. Used by Builder-derived classes. */
  protected readonly  extCtx:                   ExternalContext;
  /** Reference to the package manifest (`package.json`) of the module that owns the class that implements the command entrypoint. */
  protected readonly  packageJson:              JsonMap;
  /** Version of the plugin that's running this Generator. Taken dynamically from `package.json`. */
  protected readonly  pluginVersion:            string;
  /** Custom `falcon` options key from `package.json`. Can be used to read package-global settings that a plugin developer chooses to add to `package.json`. */
  protected readonly  falcon:                   JsonMap;
  /** Specifies the various messages used by this Generator. */
  protected readonly  generatorMessages:        GeneratorMessages;
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
    TypeValidator.throwOnNullInvalidObject      (reqs.gitEnvReqs,    `${dbgNsLocal}`, `GeneratorRequirements.gitEnvReqs`);
    TypeValidator.throwOnNullInvalidObject      (reqs.localEnvReqs,  `${dbgNsLocal}`, `GeneratorRequirements.localEnvReqs`);
    TypeValidator.throwOnNullInvalidObject      (reqs.sfdxEnvReqs,   `${dbgNsLocal}`, `GeneratorRequirements.sfdxEnvReqs`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts,               `${dbgNsLocal}`, `GeneratorOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject (opts.packageJson,   `${dbgNsLocal}`, `GeneratorOptions.packageJson`);
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

    // Attempt to pull the VERSION key from package.json.
    const version     = opts.packageJson['version'] as string;
    const pkgVersion  = TypeValidator.isNotEmptyNullInvalidString(version) ? version : `??.??.??`;
    SfdxFalconDebug.str(`${dbgNsLocal}:pkgVersion:`, pkgVersion);

    // Attempt to pull the FALCON key from package.json.
    const falcon    = opts.packageJson['falcon'] as JsonMap;
    const pkgFalcon = TypeValidator.isNotNullInvalidObject(falcon) ? falcon : {} as JsonMap;
    SfdxFalconDebug.obj(`${dbgNsLocal}:pkgFalcon:`, pkgFalcon);

    // Initialize class members.
    this.commandName          = opts.commandName;       // Name of the command that's executing the Generator (eg. 'falcon:adk:clone').
    this.dbgNs                = `${dbgNs}`;             // Initial debug namespace. This should be overwritten in the derived class's constructor.
    this.generatorType        = opts.generatorType;     // Type (ie. file name minus the .ts extension) of the Generator being run.
    this.generatorResult      = opts.generatorResult;   // Used for activity tracking and communication back to the calling command.
    this.generatorReqs        = generatorReqs;          // Generator Requirements. Should be modified by the derived class.
    this.generatorStatus      = new GeneratorStatus();  // Tracks status and build messages to the user.
    this.packageJson          = opts.packageJson;       // Refers to the package manifest (package.json) of the module that implements the command that's executing this generator.
    this.pluginVersion        = pkgVersion;             // Version of the plugin, taken from package.json.
    this.falcon               = pkgFalcon;              // Falcon global JsonMap, taken from package.json.
    this.sharedData           = {} as object;           // Special context for sharing data between Generator, Inquirer Questions, and Listr Tasks.

    // Initialize the External Context.
    this.extCtx = {
      dbgNs:            null,
      context:          null,
      generatorStatus:  this.generatorStatus,
      parentResult:     this.generatorResult,
      sharedData:       this.sharedData
    };

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
      meta:     {} as T,
      confirmation: {
        proceed:  null,
        restart:  null,
        abort:    null
      }
    };

    // Set defaults for all Generator messages.
    this.generatorMessages = {
      opening:        `SFDX-Falcon Powered Plugin\n${this.commandName}\nv${this.pluginVersion}`,
      preInterview:   `Starting Interview...`,
      confirmation:   `Would you like to proceed based on the above settings?`,
      postInterview:  ``,
      success:        `${this.commandName} completed successfully`,
      failure:        `${this.commandName} exited without completing the expected tasks`,
      warning:        `${this.commandName} completed successfully, but with some warnings (see above)`
    };

    // Start the GeneratorStatus object and add it to the detail of the GENERATOR Result.
    this.generatorStatus.start();
    this.generatorResult.setDetail({
      commandName:        this.commandName,
      generatorType:      this.generatorType,
      generatorPath:      this.generatorPath,
      generatorReqs:      this.generatorReqs,
      generatorMsgs:      this.generatorMessages,
      interviewAnswers:   this.answers,
      runLoopStatus:      this.runLoopStatus,
      generatorStatus:    this.generatorStatus
    });
    this.generatorResult.debugResult(`After setting Detail in constructor`, `${dbgNsLocal}`);

    // Initialize Shared Data.
    this.sharedData['commandName']            = this.commandName;
    this.sharedData['generatorRequirements']  = this.generatorReqs;
    this.sharedData['generatorStatus']        = this.generatorStatus;
  }

  // Public abstract methods.
  public abstract async initializing():Promise<void>;
  public abstract async prompting():Promise<void>;
  public abstract async configuring():Promise<void>;
  public abstract async writing():Promise<void>;
  public abstract async install():Promise<void>;
  public abstract async end():Promise<void>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _showOpener
   * @returns     {Promise<void>}
   * @description Shows an opening message when the `initializing` run-loop
   *              function is executed. Uses the string from
   *              `this.generatorMessage.opening` as the source of the message
   *              contents. Can be overridden by derived class to customize the
   *              opener behavior.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _showOpener():Promise<void> {

    // Use the SFDX-Falcon Banner Utility to show the opening message.
    console.error(BannerUtil.buildBanner(this.generatorMessages.opening));
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      __initializing
   * @returns     {Promise<void>}
   * @description STEP ONE in the Yeoman run-loop.  Intended to be executed as
   *              part of Yeoman's `initializing` run-loop priority.  Will call
   *              the matching single-underscore method `_initializing()` from
   *              the derived class after executing logic that's specialized
   *              for `SfdxFalconGenerator` based Generators. This method must
   *              be called by the `initializing()` method that's implemented
   *              by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __initializing():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__initializing`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);
      return;
    }

    // Show the Yeoman to announce that the generator is running.
    await this._showOpener();

    // Execute the initialization tasks for this generator
    try {

      // SFDX Environment Initialization
      this.sfdxEnv = await SfdxEnvironment.initialize({
        requirements: this.generatorReqs.sfdxEnvReqs,
        dbgNs:        this.dbgNs,
        verbose:      true,
        silent:       false
      });

      // TODO: Git Initialization

      // TODO: Local Initialization

    }
    catch (initializationError) {
      SfdxFalconDebug.obj(`${dbgNsLocal}:initializationError:`, initializationError);

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

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._initializing();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      __prompting
   * @returns     {Promise<void>}
   * @description STEP TWO in the Yeoman run-loop.  Interviews the User to get
   *              information needed by the `writing` and `installing` phases.
   *              Intended to be executed as part of Yeoman's `prompting`
   *              run-loop priority.  Will call the matching single-underscore
   *              method `_prompting()` from the derived class after executing
   *              logic that's specialized for `SfdxFalconGenerator` based
   *              Generators. This method must be called by the `prompting()`
   *              method that's implemented by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __prompting():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__prompting`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);
      return;
    }

    // Show the pre-interview message.
    printStyledMessage({
      message:  this.generatorMessages.preInterview,
      styling:  `yellow`
    });

    // Build the User Interview.
    this.userInterview = this._buildInterview();

    // Start the User Interview.
    this.answers.final = await this.userInterview.start();

    // Extract the "User Answers" from the Interview for inclusion in the GENERATOR Result's detail.
    this.generatorResult.detail['userAnswers'] = this.userInterview.userAnswers;

    // Check if the user aborted the Interview.
    if (this.userInterview.status.aborted) {
      this.generatorStatus.abort({
        type:     StatusMessageType.ERROR,
        title:    'Command Aborted',
        message:  `${this.commandName} canceled by user. ${this.userInterview.status.reason}`
      });
    }

    // Show the post-interview message.
    printStyledMessage({
      message:  this.generatorMessages.postInterview,
      styling:  `yellow`
    });

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._prompting();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      __configuring
   * @returns     {void}
   * @description STEP THREE in the Yeoman run-loop. Perform any pre-install
   *              configuration steps based on the answers provided by the User.
   *              Intended to be executed as part of Yeoman's `configuring`
   *              run-loop priority.  Will call the matching single-underscore
   *              method `_configuring()` from the derived class after executing
   *              logic that's specialized for `SfdxFalconGenerator` based
   *              Generators. this method must be called by the `configuring()`
   *              method that's implemented by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __configuring():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__configuring`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);
      return;
    }

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._configuring();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      __writing
   * @returns     {Promise<void>}
   * @description __STEP FOUR in the Yeoman run-loop.__ Typically, this is where
   *              you perform filesystem writes, git clone operations, etc.
   *              Intended to be executed as part of Yeoman's `writing` run-loop
   *              priority.  Will call the matching single-underscore method
   *              `_writing()` from the derived class after executing logic
   *              that's specialized for `SfdxFalconGenerator` based Generators.
   *              This method must] be called by the `writing()` method that's
   *              implemented by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __writing():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__writing`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);
      return;
    }

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._writing();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      install
   * @returns     {Promise<void>}
   * @description __STEP FIVE in the Yeoman run-loop.__ Typically, this is where
   *              you perform operations that must happen AFTER files are
   *              written to disk. For example, if the `writing` step downloaded
   *              an app to install, the `install` step would run the
   *              installation. Intended to be executed as part of Yeoman's
   *              `install` run-loop priority.  Will call the matching
   *              single-underscore method `_install()` from the derived class
   *              after executing logic that's specialized for `SfdxFalconGenerator`
   *              based Generators. This method must be called by the `install()`
   *              method that's implemented by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __install():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__install`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);
      return;
    }

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._install();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      __end
   * @returns     {Promise<void>}
   * @description __STEP SIX in the Yeoman run-loop.__ This is the FINAL step
   *              that Yeoman runs and it gives us a chance to do any post-Yeoman
   *              updates and/or cleanup. Intended to be executed as part of the
   *              `end` run-loop priority.  Will call the matching single-underscore
   *              method `_end()` from the derived class after executing logic
   *              that's specialized for `SfdxFalconGenerator` based Generators.
   *              This method must be called by the `end()` method that's
   *              implemented by the dervived class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async __end():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `__end`;
    const dbgNsLocal  = `${this.dbgNs}:${funcName}`;

    // Check if the Yeoman interview/installation process was aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:`, `Generator has been aborted.`);

      // Add a final error message
      this.generatorStatus.addMessage({
        type:     StatusMessageType.ERROR,
        title:    'Command Failed',
        message:  `${this.generatorMessages.failure}\n`
      });
    }
    else {
      // Generator completed successfully. Final message depends on presence of Generator Status Warnings.
      this.generatorStatus.complete([
        {
          type:     StatusMessageType.SUCCESS,
          title:    'Command Succeded',
          message:  this.generatorStatus.hasWarning
                    ? `${this.generatorMessages.warning}\n`
                    : `${this.generatorMessages.success}\n`
        }
      ]);
    }

    // Print the final status table.
    this.generatorStatus.printStatusMessages();

    // End by calling the matching "single-underscore" run-loop method from the derived class.
    return await this._end();
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
}
