//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/types/src/misc.ts
 * @summary       All types/interfaces that could not be organized into one of the other buckets.
 * @description   All types/interfaces that could not be organized into one of the other buckets.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import  {Connection}  from  '@salesforce/core';
import  * as Csv2Json from  'csv-parser';
import  {Observable}  from  'rxjs';
import  {Observer}    from  'rxjs';
import  {Subscriber}  from  'rxjs';
import  {Questions}   from  'yeoman-generator';
import  {Question}    from  'yeoman-generator';

// Import Internal Modules/Types
import  {StatusMessage}       from  './core';
import  {StyledMessage}       from  './core';
import  {AnyJson}             from  './core';
import  {JsonMap}             from  './core';
import  {Status}              from  './enum';

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Various External Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//


/**
 * Type. Represents the options that are available when converting CSV to JSON. See https://www.npmjs.com/package/csv-parser for documentation.
 */
export type Csv2JsonOptions = Csv2Json.Options;

/**
 * Type. Represents the options that are available when converting JSON to CSV. See https://www.npmjs.com/package/json2csv for documentation.
 */
export interface Json2CsvOptions<T=unknown> {
  fields?: Array<string | Json2CsvFieldInfo<T>>;
  ndjson?: boolean;
  unwind?: string | string[];
  unwindBlank?: boolean;
  flatten?: boolean;
  defaultValue?: string;
  quote?: string;
  doubleQuote?: string;
  delimiter?: string;
  eol?: string;
  excelStrings?: boolean;
  header?: boolean;
  includeEmptyRows?: boolean;
  withBOM?: boolean;
}

// Local types that support Json2CsvOptions
type FieldValueCallback<T> = FieldValueCallbackWithoutField<T> | FieldValueCallbackWithField<T>;
type FieldValueCallbackWithoutField<T> = (row:T) => any; // tslint:disable-line: no-any
type FieldValueCallbackWithField<T> = (row:T, field:FieldValueCallbackInfo) => any; // tslint:disable-line: no-any
interface FieldValueCallbackInfo {
  label: string;
  default?: string;
}
interface Json2CsvFieldInfo<T> {
  label?: string;
  default?: string;
  value: string | FieldValueCallback<T>;
  stringify?: boolean;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Metadata API Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Falcon and SFDX Config-related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Represents the status code and JSON result that is sent to the caller when SFDX-Falcon CLI Commands are run.
 */
export interface SfdxFalconJsonResponse extends JsonMap {
  falconStatus: number;
  falconResult: AnyJson;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Packaging-related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a Metadata Package (033). Can be managed or unmanaged.
 */
export interface MetadataPackage extends JsonMap {
  Id:                       string;
  Name:                     string;
  NamespacePrefix:          string;
  MetadataPackageVersions:  MetadataPackageVersion[];
}

/**
 * Interface. Represents a Metadata Package Version (04t).
 */
export interface MetadataPackageVersion extends JsonMap {
  Id:                 string;
  Name:               string;
  MetadataPackageId:  string;
  MajorVersion:       number;
  MinorVersion:       number;
  PatchVersion:       number;
  BuildNumber:        number;
  ReleaseState:       string;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Listr related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
 */
export interface ListrObject extends Object {
  run():Promise<any>; // tslint:disable-line: no-any
}

/**
 * Interface. Represents a Listr Task object that can be executed by a Listr Task Runner.
 */
export interface ListrTask {
  title:    string;
  task:     ListrTaskFunction;
  skip?:    boolean|ListrSkipFunction|ListrSkipCommand;
  enabled?: boolean|ListrEnabledFunction;
}

/**
 * Represents an "enabled" function for use in a Listr Task.
 */
export type ListrEnabledFunction =
  (context?:any)=> boolean; // tslint:disable-line: no-any

/**
 * Type. Represents a "skip" function for use in a Listr Task.
 */
export type ListrSkipFunction =
  (context?:any) => boolean|string|Promise<boolean|string>;  // tslint:disable-line: no-any

/**
 * Type. A built-in function of the "this task" Listr Task object that gets passed into executable task code.
 */
export type ListrSkipCommand =
  (message?:string) => void;

/**
 * Represents a "task" function for use in a Listr Task.
 */
export type ListrTaskFunction =
  (context?:ListrContext, task?:ListrTask) => void|Promise<void>|Observable<any>; // tslint:disable-line: no-any

/**
 * Represents the set of "execution options" related to the use of Listr.
 */
export interface ListrExecutionOptions {
  listrContext: any;  // tslint:disable-line: no-any
  listrTask:    any;  // tslint:disable-line: no-any
  observer:     any;  // tslint:disable-line: no-any
  sharedData?:  object;
}

/**
 * Represents the Listr "Context" that's passed to various functions set up inside Listr Tasks.
 */
export type ListrContext = any; // tslint:disable-line: no-any

/**
 * Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
 */
export interface ListrContextFinalizeGit extends JsonMap {
  gitInstalled:           boolean;
  gitInitialized:         boolean;
  projectFilesStaged:     boolean;
  projectFilesCommitted:  boolean;
  gitRemoteIsValid:       boolean;
  gitRemoteAdded:         boolean;
}

/**
 * Interface. Represents the Listr Context variables used by the "Package Retrieve/Extract/Convert" task collection.
 */
export interface ListrContextPkgRetExCon extends JsonMap {
  packagesRetrieved:  boolean;
  sourceExtracted:    boolean;
  sourceConverted:    boolean;
}

/**
 * Interface. Represents the suite of information required to run a Listr Task Bundle.
 */
export interface ListrTaskBundle {
  /** Required. A fully instantiated Listr Object representing the tasks that the caller would like to run. */
  listrObject:            ListrObject;
  /** Required. The debug namespace that will be used by SfdxFalconDebug and SfdxFalconError objects. */
  dbgNsLocal:             string;
  /** Required. Status Message that will be added to the GeneratorStatus object if the Task Bundle completes successfully. */
  generatorStatusSuccess: StatusMessage;
  /** Required. Status Message that will be added to the GeneratorStatus object if the Task Bundle does not complete successfully. */
  generatorStatusFailure: StatusMessage;
  /** Required. Specifies whether an error will be thrown if any of the Tasks in the Task Bundle fail. */
  throwOnFailure:         boolean;
  /** Optional. A styled message that will be shown to the user BEFORE the Task Bundle is run. */
  preTaskMessage?:        StyledMessage;
  /** Optional. A styled message that will be shown to the user AFTER the Task Bundle is run. */
  postTaskMessage?:       StyledMessage;
}

/**
 * Type. Alias to an rxjs Observer<unknown> type.
 */
export type Observer = Observer<unknown>;

/**
 * Type. Alias to an rxjs Subscriber<unknown> type.
 */
export type Subscriber = Subscriber<unknown>;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Yeoman/Inquirer/SfdxFalconInterview/SfdxFalconPrompt related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

export type InquirerChoice<U=unknown>   = import('inquirer/lib/objects/choice')<U>;
export type InquirerSeparator           = import('inquirer/lib/objects/separator');
export type InquirerChoices             = Array<InquirerChoice|InquirerSeparator>;
export type InquirerQuestion            = import('inquirer').Question;
export type InquirerQuestions           = import('inquirer').QuestionCollection;
export type InquirerAnswers             = import('inquirer').Answers;

/**
 * Represents a Yeoman/Inquirer choice object.
 */
export type  YeomanChoice = InquirerChoice;

/**
 * Type. Represents a "checkbox choice" in Yeoman/Inquirer.
 */
export type YeomanCheckboxChoice = InquirerChoice;

/**
 * Type. Represents the function signature for a "Disabled" function.
 */
export type YeomanChoiceDisabledFunction = (answers:unknown) => boolean|string; // tslint:disable-line: no-any

/**
 * Type. Represents the function signature for an Inquirer `validate()` function.
 */
export type InquirerValidateFunction = (input:unknown, answers?:InquirerAnswers) => string|boolean|Promise<string|boolean>;

/**
 * Represents what an answers hash should look like during Yeoman/Inquirer interactions
 * where the user is being asked to proceed/retry/abort something.
 */
export interface ConfirmationAnswers extends JsonMap {
  proceed:  boolean;
  restart:  boolean;
  abort:    boolean;
}

/**
 * Interface. Represents a single row of data for use in an SFDX-Falon Table.
 */
export interface SfdxFalconKeyValueTableDataRow {
  option:   string;
  value:    string;
  height?:  number;
}

/**
 * Type. Represents an array of SfdxFalconKeyValueTableDataRow object literals.
 */
export type SfdxFalconTableData = SfdxFalconKeyValueTableDataRow[];

/**
 * Type. Defines a function that displays answers to a user.
 */
export type AnswersDisplay<T extends JsonMap> = (userAnswers?:T) => Promise<void | SfdxFalconTableData>;

/**
 * Function type alias defining a function that returns Inquirer Questions.
 */
export type QuestionsBuilder = () => Questions;

/**
 * Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.
 */
export type Questions = Questions;

/**
 * Alias to the Question type from yeoman-generator. This is the "official" type for SFDX-Falcon.
 */
export type Question = Question;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Salesforce DX / JSForce related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents either an Org Alias or a JSForce Connection.
 */
export type AliasOrConnection = string | Connection;

/**
 * Interface. Represents a resolved (active) JSForce connection to a Salesforce Org.
 */
export interface ResolvedConnection {
  connection:       Connection;
  orgIdentifier:    string;
}

/**
 * Interface. Represents information needed to make a REST API request via a JSForce connection.
 */
export interface RestApiRequestDefinition {
  aliasOrConnection:  string|Connection;
  request:            import ('jsforce').RequestInfo;
  options?:           {any};
}

/**
 * Interface. Represents the unparsed response to a "raw" REST API request via a JSForce connection.
 */
export interface RawRestResponse extends JsonMap {
  statusCode:     number;
  statusMessage:  string;
  headers:        JsonMap;
  body:           string;
}

/**
 * Interface. Represents the request body required to close or abort a Bulk API 2.0 job.
 */
export interface Bulk2JobCloseAbortRequest extends JsonMap {
  /** The state to update the job to. Use "UploadComplete" to close a job, or "Aborted" to abort a job. */
  state:  'UploadComplete'|'Aborted';
}

/**
 * Interface. Represents the request body required to create a Bulk API 2.0 job.
 */
export interface Bulk2JobCreateRequest extends JsonMap {
  /** The column delimiter used for CSV job data. */
  columnDelimiter?:     'BACKQUOTE'|'CARET'|'COMMA'|'PIPE'|'SEMICOLON'|'TAB';
  /** The format of the data being processed. Only CSV is supported */
  contentType?:          'CSV';
  /** The external ID field in the object being updated. Only needed for upsert operations. Field values must also exist in CSV job data. */
  externalIdFieldName?: string;
  /** The line ending used for CSV job data. */
  lineEnding?:          'LF'|'CRLF';
  /** The object type for the data being processed. */
  object:               string;
  /** The processing operation for the job. Values include "insert", "delete", "update", and "upsert". */
  operation:            'insert'|'delete'|'update'|'upsert';
}

/**
 * Interface. Represents the response body returned by Salesforce after attempting to create a Bulk API 2.0 job.
 */
export interface Bulk2JobCreateResponse extends Bulk2JobCreateRequest {
  /** The API version that the job was created in. */
  apiVersion?:          string;
  /** How the request was processed. */
  concurrencyMode?:     string;
  /** The URL to use for Upload Job Data requests for this job. Only valid if the job is in Open state. */
  contentUrl?:          string;
  /** The ID of the user who created the job. */
  createdById?:         string;
  /** The date and time in the UTC time zone when the job was created. */
  createdDate?:         string;
  /** Unique ID for this job. */
  id?:                  string;
  /** The job’s type. Values include "BigObjectIngest" (BigObjects), "Classic" (Bulk API 1.0), or "V2Ingest" (Bulk API 2.0 job) */
  jobType?:             'BigObjectIngest'|'Classic'|'V2Ingest';
  /** The current state of processing for the job. */
  state?:               'Open'|'UploadComplete'|'InProgress'|'JobComplete'|'Failed'|'Aborted';
  /** Date and time in the UTC time zone when the job finished. */
  systemModstamp?:      string;
}

/**
 * Interface. Represents the response body returned by Salesforce when closing or aborting a specific Bulk API 2.0 job.
 */
export interface Bulk2JobCloseAbortResponse extends Bulk2JobCreateResponse {} // tslint:disable-line: no-empty-interface

/**
 * Interface. Represents the response body returned by Salesforce when requesting info about a specific Bulk API 2.0 job.
 */
export interface Bulk2JobInfoResponse extends Bulk2JobCloseAbortResponse {
  /** The number of milliseconds taken to process triggers and other processes related to the job data. This doesn't include the time used for processing asynchronous and batch Apex operations. If there are no triggers, the value is 0. */
  apexProcessingTime?:      number;
  /** The number of milliseconds taken to actively process the job and includes apexProcessingTime, but doesn't include the time the job waited in the queue to be processed or the time required for serialization and deserialization. */
  apiActiveProcessingTime?: number;
  /** The number of records that were not processed successfully in this job. */
  numberRecordsFailed?:     number;
  /** The number of records already processed. */
  numberRecordsProcessed?:  number;
  /** The number of times that Salesforce attempted to save the results of an operation. The repeated attempts are due to a problem, such as a lock contention. */
  retries?:                 number;
  /** The number of milliseconds taken to process the job. */
  totalProcessingTime?:     number;
}

/**
 * Interface. Represents a record that encountered an error while being processed by a Bulk API 2.0 job.
 * Contains all field data that was provided in the original job data upload request.
 */
export interface Bulk2FailedRecord extends JsonMap {
  /** Error code and message, if applicable. */
  sf__Error:    string;
  /** ID of the record that had an error during processing, if applicable. */
  sf__Id:       string;
  /** Field data for the row that was provided in the original job data upload request. */
  [key:string]: string;
}

/**
 * Type. Represents the collection of "Failed Results" data from a Bulk API 2.0 job.
 */
export type Bulk2FailedResults = Bulk2FailedRecord[];

/**
 * Interface. Represents a record that has been successfully processed by a Bulk API 2.0 job.
 * Contains all field data that was provided in the original job data upload request.
 */
export interface Bulk2SuccessfulRecord extends JsonMap {
  /** Indicates if the record was created. */
  sf__Created:  string;
  /** ID of the record that was successfully processed. */
  sf__Id:       string;
  /** Field data for the row that was provided in the original job data upload request. */
  [key:string]: string;
}

/**
 * Type. Represents the collection of "Successful Results" data from a Bulk API 2.0 job.
 */
export type Bulk2SuccessfulResults = Bulk2SuccessfulRecord[];

/**
 * Interface. Represents the overall status of a Bulk API 2.0 operation.
 */
export interface Bulk2OperationStatus extends JsonMap {
  currentJobStatus?:        Bulk2JobInfoResponse;
  dataSourcePath?:          string;
  dataSourceSize?:          number;
  dataSourceUploadStatus?:  Status;
  failedResults?:           Bulk2FailedResults;
  failedResultsPath?:       string;
  initialJobStatus?:        Bulk2JobCreateResponse;
  successfulResults?:       Bulk2SuccessfulResults;
  successfulResultsPath?:   string;
}

/**
 * Type. Represents a collection of either "Successful" or "Failure" Results data from a Bulk API 2.0 job.
 */
export type Bulk2Results = Bulk2SuccessfulResults | Bulk2FailedResults;

/**
 * Type. Alias to a Map with string keys and MetadataPackageVersion values.
 */
export type PackageVersionMap = Map<string, MetadataPackageVersion[]>;

/**
 * Type. Alias to the JSForce definition of QueryResult.
 */
export type QueryResult<T> = import('jsforce').QueryResult<T>;

/**
 * Interface. Represents the "nonScratchOrgs" (aka "standard orgs") data returned by the sfdx force:org:list command.
 */
export interface RawStandardOrgInfo {
  orgId?:                   string;     // Why?
  username?:                string;     // Why?
  alias?:                   string;     // Why?
  accessToken?:             string;     // Why?
  instanceUrl?:             string;     // Why?
  loginUrl?:                string;     // Why?
  clientId?:                string;     // Why?
  isDevHub?:                boolean;    // Why?
  isDefaultDevHubUsername?: boolean;    // Why?
  defaultMarker?:           string;     // Why?
  connectedStatus?:         string;     // Why?
  lastUsed?:                string;     // Why?
}

/**
 * Interface. Represents the "scratchOrgs" data returned by the sfdx force:org:list --all command.
 */
export interface RawScratchOrgInfo {
  orgId?:                   string;     // Why?
  username?:                string;     // Why?
  alias?:                   string;     // Why?
  accessToken?:             string;     // Why?
  instanceUrl?:             string;     // Why?
  loginUrl?:                string;     // Why?
  clientId?:                string;     // Why?
  createdOrgInstance?:      string;     // Why?
  created?:                 string;     // Wyy?
  devHubUsername?:          string;     // Why?
  connectedStatus?:         string;     // Why?
  lastUsed?:                string;     // Why?
  attributes?:              object;     // Why?
  orgName?:                 string;     // Why?
  status?:                  string;     // Why?
  createdBy?:               string;     // Why?
  createdDate?:             string;     // Why?
  expirationDate?:          string;     // Why?
  edition?:                 string;     // Why?
  signupUsername?:          string;     // Why?
  devHubOrgId?:             string;     // Why?
  isExpired?:               boolean;    // Why?
}

/**
 * Interface. Represents the options that can be set when constructing a StandardOrgInfo object.
 */
export interface StandardOrgInfoOptions extends RawStandardOrgInfo {
  metadataPackageResults?:  QueryResult<MetadataPackage>;
}

/**
 * Interface. Represents the result of a call to shell.execL().
 */
export interface ShellExecResult {
  code?:     number;
  stdout?:   string;
  stderr?:   string;
  message?:  string;
  resolve?:  boolean;
}

/**
 * Interface. Represents the REST response provided for an Object Describe.
 */
export interface ObjectDescribe {
  activateable?:        boolean;
  createable?:          boolean;
  custom?:              boolean;
  customSetting?:       boolean;
  deletable?:           boolean;
  deprecatedAndHidden?: boolean;
  feedEnabled?:         boolean;
  hasSubtypes?:         boolean;
  isSubtype?:           boolean;
  keyPrefix?:           string;
  label?:               string;
  labelPlural?:         string;
  layoutable?:          boolean;
  mergeable?:           boolean;
  mruEnabled?:          boolean;
  name?:                string;
  queryable?:           boolean;
  replicateable?:       boolean;
  retrieveable?:        boolean;
  searchable?:          boolean;
  triggerable?:         boolean;
  undeletable?:         boolean;
  updateable?:          boolean;
  urls?:                any;      // tslint:disable-line: no-any
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// SObject related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//
