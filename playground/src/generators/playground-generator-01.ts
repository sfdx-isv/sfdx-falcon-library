//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          playground/src/generators/playground-generator-01.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Sample Generator File for test-driving the `@sfdx-falcon/generator` package.
 * @description   Sample Generator File for test-driving the `@sfdx-falcon/generator` package.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
//import {fs}       from  '@salesforce/core'; // File System utility from the Core SFDX library.
import chalk      from  'chalk';            // Helps write colored text to the console.
import * as path  from  'path';             // Library. Helps resolve local paths at runtime.

// Import Internal Libraries
//import  * as QB from '../builders/questions-builder';
import  {QBLibrary as QBL}                 from  '@sfdx-falcon/builder-library';  // Library. Builders for Interview Questions.
//import  {TBLibrary}                      from  '@sfdx-falcon/builder-library';  // Library. Builders for Tasks.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';       // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxEnvironment}           from  '@sfdx-falcon/environment'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconGenerator}       from  '@sfdx-falcon/generator';   // Class. Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.
import  {SfdxFalconInterview}       from  '@sfdx-falcon/interview';   // Class. Provides a standard way of building a multi-group Interview to collect user input.

// Import SFDX-Falcon Types
//import  {SfdxFalconKeyValueTable}   from  '@sfdx-falcon/status';      // Class. Uses table creation code borrowed from the SFDX-Core UX library to make it easy to build "Key/Value" tables.
import  {GeneratorOptions}            from  '@sfdx-falcon/command';     // Interface. Specifies options used when spinning up an SFDX-Falcon Yeoman environment.
import  {GeneratorRequirements}     from  '@sfdx-falcon/generator';   // Interface. Collection of requirements for the initialization process of an SfdxFalconGenerator.
import  {SfdxFalconKeyValueTableDataRow} from  '@sfdx-falcon/status'; // Interface. Represents a row of data in an SFDX-Falcon data table.
import  {SfdxFalconTableData}         from  '@sfdx-falcon/status';      // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import  {JsonMap}                     from  '@sfdx-falcon/types';       // Interface. Any JSON-compatible object.
//import  {ListrTaskBundle}                from  '../modules/sfdx-falcon-types';                     // Interface. Represents the suite of information required to run a Listr Task Bundle.
//import  {StatusMessageType}              from  '../modules/sfdx-falcon-types';                     // Enum. Represents the various types/states of a Status Message.


// Set the File Local Debug Namespace
const dbgNs = 'playground-generator';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   InterviewAnswers
 * @description Represents answers to the questions asked in the Yeoman interview.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface InterviewAnswers extends JsonMap {
  baseDirectory:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Transform
 * @extends     SfdxFalconGenerator
 * @summary     Yeoman generator class. Transforms local TM1 configuration (data+metadata) files.
 * @description Uses Yeoman to run through an interview, then transforms TM1 configuration based on
 *              the specifications found in the user's tm1-extraction.json file.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class PlayGroundGenerator01 extends SfdxFalconGenerator<InterviewAnswers> {

  // Define class members specific to this Generator.
  public    publicTestVar;
  protected protectedTestVar;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  PlayGroundGenerator01
   * @param       {string|string[]} args Required. Not used (as far as I know).
   * @param       {GeneratorOptions}  opts Required. Sets generator options.
   * @description Constructs a Tm1Transform object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(args:string|string[], opts:GeneratorOptions) {

    // Specify the Requirements for this Generator.
    const genReqs:GeneratorRequirements = {
      gitEnvReqs: {},
      localEnvReqs: {},
      sfdxEnvReqs: {
        standardOrgs:     false,
        scratchOrgs:      false,
        devHubOrgs:       false,
        envHubOrgs:       false,
        managedPkgOrgs:   true,
        unmanagedPkgOrgs: false
      }
    };

    // Call the parent constructor to initialize the Yeoman Generator.
    super(args, opts, genReqs);

    // Customize all Generator messages.
    this.generatorMessages.opening        = chalk`xxxSFDX-Falcon {blue Powered} Plugin and a whole bunch of extra stuff\n{green ${this.commandName}}\nv${this.pluginVersion}`;
    this.generatorMessages.preInterview   = `xxxStarting Interview...`;
    this.generatorMessages.confirmation   = `xxxWould you like to proceed based on the above settings?`;
    this.generatorMessages.postInterview  = ``;
    this.generatorMessages.success        = `${this.commandName} xxxcompleted successfully`;
    this.generatorMessages.failure        = `${this.commandName} xxxexited without completing the expected tasks`;
    this.generatorMessages.warning        = `${this.commandName} xxxcompleted successfully, but with some warnings (see above)`;

    // Initialize DEFAULT Interview Answers.
    this.answers.default.baseDirectory = path.resolve('/users/vchawla/devtest/nothing');

    // Initialize Shared Data.
    this.sharedData['reportJson']       = {};
    this.sharedData['tmToolsTransform'] = {};
  }

  //───────────────────────────────────────────────────────────────────────────┐
  // Funnel each of Yeoman's "run loop" priority methods through the matching
  // double-underscore (__) version which is defined on the SfdxFalconGenerator
  // base class.  Those methods will, in turn, call on the single-underscore
  // "_" versions that are implemented in this derived class.
  //───────────────────────────────────────────────────────────────────────────┘
  public async initializing():Promise<void> { await this.__initializing(); }
  public async prompting():Promise<void>    { await this.__prompting(); }
  public async configuring():Promise<void>  { await this.__configuring(); }
  public async writing():Promise<void>      { await this.__writing(); }
  public async install():Promise<void>      { await this.__install(); }
  public async end():Promise<void>          { await this.__end(); }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _buildInterview
   * @returns     {SfdxFalconInterview<InterviewAnswers>} Returns a fully fleshed
   *              SfdxFalconInterview object with zero or more prompts that the
   *              user will answer in an interview once this is run.
   * @description Allows the developer to build a complex, multi-step interview
   *              that Yeoman will execute during the "prompting" phase.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _buildInterview():SfdxFalconInterview<InterviewAnswers> {

    // Initialize the Interview object.
    const interview = new SfdxFalconInterview<InterviewAnswers>({
      defaultAnswers:     this.answers.default,
//      confirmation:       QBLibrary.confirmProceedRestart,
      confirmation:       [{
        type:     'confirm',
        name:     'isScratchOrg',
        message:  'Is the target a Scratch Org?',
        default:  true,
        when:     true
      }],
      confirmationHeader: chalk.yellow('Review Your Settings:'),
      display:            this._buildInterviewAnswersTableData,
      context:            this,
      sharedData:         this.sharedData
    });

    // Group 0: Specify the directory containing the TM1 config extraction.
    interview.createGroup({
      title:      chalk.yellow('\nTM1 Extraction Directory:'),
      questions:  new QBL.Sfdx.ChooseSingleOrg(
        this.extCtx.append(`_buildInterview`),
        this.sfdxEnv.scratchOrgChoices,
        this.sfdxEnv.standardOrgChoices,
        /*
        {
          promptIsScratchOrg:       'Hello!',
          promptScratchOrgChoice:   'I am crazy!',
          promptStandardOrgChoice:  'more on the way!'
        }//*/
      ).build()
    });

    // Finished building the Interview.
    return interview;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _buildInterviewAnswersTableData
   * @param       {InterviewAnswers}  userAnswers Required.
   * @returns     {Promise<SfdxFalconTableData>}
   * @description Builds an SfdxFalconTableData object based on the Interview
   *              Answer values provided by the caller. This function can be
   *              used by an SfdxFalconInterview to reflect input to the user
   *              at the end of an Interview.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _buildInterviewAnswersTableData(interviewAnswers:InterviewAnswers):Promise<SfdxFalconTableData> {

    // Declare an array of Falcon Table Data Rows
    const tableData = new Array<SfdxFalconKeyValueTableDataRow>();
    SfdxFalconDebug.obj(`${dbgNs}:`, interviewAnswers);

    /*
    // Grab the TM1 Extraction Report from Shared Data, then extract required fields from it.
    const tm1ExtractionReport           = this.sharedData['reportJson'] as TM1ExtractionReport;
    const orgId                         = tm1ExtractionReport.orgInfo.orgId;
    const alias                         = tm1ExtractionReport.orgInfo.alias;
    const username                      = tm1ExtractionReport.orgInfo.username;
    const loginUrl                      = tm1ExtractionReport.orgInfo.loginUrl;
    const createdOrgInstance            = tm1ExtractionReport.orgInfo.createdOrgInstance;
    const territoryRecordCount          = tm1ExtractionReport.actualTm1RecordCounts.territoryRecordCount;
    const userTerritoryRecordCount      = tm1ExtractionReport.actualTm1RecordCounts.userTerritoryRecordCount;
    const ataRuleRecordCount            = tm1ExtractionReport.actualTm1RecordCounts.ataRuleRecordCount;
    const ataRuleItemRecordCount        = tm1ExtractionReport.actualTm1RecordCounts.ataRuleItemRecordCount;
    const accountShareRecordCount       = tm1ExtractionReport.actualTm1RecordCounts.accountShareRecordCount;
    const accountSharingRulesCount      = `${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
    const leadSharingRulesCount         = `${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
    const opportunitySharingRulesCount  = `${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingOwnerRulesCount} Owner-Based`;

    // User-supplied answer.
    tableData.push({option:'TM1 Extraction Directory:', value:`${interviewAnswers.baseDirectory}`});

    // Answers read from the specified tm1-extraction.json file.
    tableData.push({option:'Alias:',                      value:`${alias}`});
    tableData.push({option:'Username:',                   value:`${username}`});
    tableData.push({option:'Org ID:',                     value:`${orgId}`});
    tableData.push({option:'Login Url:',                  value:`${loginUrl}`});
    tableData.push({option:'Org Instance:',               value:`${createdOrgInstance}`});
    tableData.push({option:'Territories:',                value:`${territoryRecordCount}`});
    tableData.push({option:'User/Territory Assignments:', value:`${userTerritoryRecordCount}`});
    tableData.push({option:'Assignment Rules:',           value:`${ataRuleRecordCount}`});
    tableData.push({option:'Assignment Rule Items:',      value:`${ataRuleItemRecordCount}`});
    tableData.push({option:'Account Shares:',             value:`${accountShareRecordCount}`});
    tableData.push({option:'Account Sharing Rules:',      value:`${accountSharingRulesCount}`});
    tableData.push({option:'Lead Sharing Rules:',         value:`${leadSharingRulesCount}`});
    tableData.push({option:'Opportunity Sharing Rules:',  value:`${opportunitySharingRulesCount}`});
    //*/

    // Return the Falcon Table Data.
    return tableData;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @returns     {Promise<void>}
   * @description Generates the TM1 Transformation Report (`tm1-transformation.json`)
   *              and saves it to the user's local system.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  protected async _generateReport():Promise<void> {
    
    // Define function-local debug namespace.
    const dbgNsLocal = `${dbgNs}_generateReport`;

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNsLocal}`,        // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: false,                  // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                       // Message displayed to the user BEFORE tasks are run.
        message: `Generating TM1 Transformation Report...`,
        styling: `yellow`
      },
      postTaskMessage: {                      // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {               // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM1 Transformation Report`,
        message:  `TM1 transformation report saved to ${this.tm1TransformFilePaths.tm1TransformationReportPath}`
      },
      generatorStatusFailure: {               // Generator Status message used on FAILURE.
        type:     StatusMessageType.WARNING,
        title:    `TM1 Transformation Report`,
        message:  `WARNING - TM1 transformation report could not be created`
      },
      listrObject:                            // The Listr Tasks that will be run.
      listrTasks.generateTm1TransformationReport.call(this,
                                                      this.tmToolsTransform)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _transformTm1Config
   * @returns     {Promise<void>}
   * @description Uses information from the User's "Final Answers" to transform
   *              a set of local TM1 Config (data and metadata) into a suite of
   *              files that can be used to deploy/load TM2 Config back into the
   *              original source org once Enterprise Territory Management (TM2)
   *              has been activated.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  protected async _transformTm1Config():Promise<void> {

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_transformTm1Config`,  // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: true,                           // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Transforming TM1 Data/Metadata to TM2...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `Transform TM1 Config`,
        message:  `TM1 configuration (data/metadata) successfully transformed to TM2`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.ERROR,
        title:    `Transform TM1 Config`,
        message:  `TM1 configuration could not be transformed to TM2`
      },
      listrObject:                                    // The Listr Tasks that will be run.
        TBLibrary.SfdxTasks.transformTm1Config.call( this,
                                            this.tm1AnalysisReport,
                                            this.tm1ExtractionReport,
                                            this.tm1TransformFilePaths)
    };

    // Run the Task Bundle.
//    await this._runListrTaskBundle(taskBundle);

    // Extract the tmToolsTransform worker from shared data.
//    this.tmToolsTransform = this.sharedData['tmToolsTransform'];
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _initializing
   * @returns     {Promise<void>}
   * @description STEP ONE in the Yeoman run-loop.  Uses Yeoman's "initializing"
   *              run-loop priority.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _initializing():Promise<void> {
    
    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_initializing:`, `Executing Custom Run Loop method.`);
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _prompting
   * @returns     {Promise<void>}
   * @description STEP TWO in the Yeoman run-loop. Interviews the User to get
   *              information needed by the "writing" and "installing" phases.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _prompting():Promise<void> {

    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_prompting:`, `Executing Custom Run Loop method.`);
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _configuring
   * @returns     {Promise<void>}
   * @description STEP THREE in the Yeoman run-loop. Perform any pre-install
   *              configuration steps based on the answers provided by the User.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _configuring():Promise<void> {

    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_configuring:`, `Executing Custom Run Loop method.`);
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _writing
   * @returns     {Promise<void>}
   * @description STEP FOUR in the Yeoman run-loop. Typically, this is where
   *              you perform filesystem writes, git clone operations, etc.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _writing():Promise<void> {

    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_writing:`, `Executing Custom Run Loop method.`);
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _install
   * @returns     {Promise<void>}
   * @description STEP FIVE in the Yeoman run-loop. Typically, this is where
   *              you perform operations that must happen AFTER files are
   *              written to disk. For example, if the "writing" step downloaded
   *              an app to install, the "install" step would run the
   *              installation.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _install():Promise<void> {

    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_install:`, `Executing Custom Run Loop method.`);
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _end
   * @returns     {Promise<void>}
   * @description STEP SIX in the Yeoman run-loop. This is the FINAL step that
   *              Yeoman runs and it gives us a chance to do any post-Yeoman
   *              updates and/or cleanup.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _end():Promise<void> {

    // Add custom implementation here.
    SfdxFalconDebug.debugString(`${this.dbgNs}:_end:`, `Executing Custom Run Loop method.`);
    return;
  }
}
