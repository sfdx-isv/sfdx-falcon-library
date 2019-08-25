//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/types/metadata-api.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Collection of types/interfaces that model Salesforce Metadata API structures.
 * @description   Collection of types/interfaces that model Salesforce Metadata API structures.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import {JsonMap}  from  '@salesforce/ts-types';


/**
 * Interface. Modeled on the MDAPI Object `CodeCoverageResult`. May be part of the results returned by `force:mdapi:deploy` or `force:apex:test:report`.
 *
 * Contains information about whether or not the compile of the specified Apex and run of the unit tests was successful. Child of the `RunTestsResult`.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_retrieveresult.htm
 */
export interface CodeCoverageResult extends JsonMap {
  /** For each class or trigger tested, for each portion of code tested, this property contains the DML statement locations, the number of times the code was executed, and the total cumulative time spent in these calls. This can be helpful for performance monitoring. */
  dmlInfo?:             CodeLocation[];
  /** The ID of the CodeLocation. The ID is unique within an organization. */
  id?:                  string;
  /** For each class or trigger tested, if any code is not covered, the line and column of the code not tested, and the number of times the code was executed. */
  locationsNotCovered?: CodeLocation[];
  /** For each class or trigger tested, the method invocation locations, the number of times the code was executed, and the total cumulative time spent in these calls. This can be helpful for performance monitoring. */
  methodInfo?:          CodeLocation[];
  /** The name of the class or trigger covered. */
  name?:                string;
  /** The namespace that contained the unit tests, if one is specified. */
  namespace?:           string;
  /** The total number of code locations. */
  numLocations?:        number;
  /** For each class or trigger tested, the location of SOQL statements in the code, the number of times this code was executed, and the total cumulative time spent in these calls. This can be helpful for performance monitoring. */
  soqlInfo?:            CodeLocation[];
  /** Do not use. In early, unsupported releases, used to specify class or package. */
  type?:                string;
}

/**
 * Interface. Modeled on the MDAPI Object `CodeCoverageWarning`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about the Apex class which generated warnings. Child of the `RunTestsResult` object.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface CodeCoverageWarning extends JsonMap {
  /** The ID of the CodeLocation. The ID is unique within an organization. */
  id?:        string;
  /** The message of the warning generated. */
  message?:   string;
  /** The namespace that contained the unit tests, if one is specified. */
  name?:      string;
  /** The namespace that contained the unit tests, if one is specified. */
  namespace?: string;
}

/**
 * Interface. Modeled on the MDAPI Object `CodeLocation`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Child of the `RunTestsResult` object.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface CodeLocation extends JsonMap {
  /** The column location of the Apex tested. */
  column?:        number;
  /** The line location of the Apex tested. */
  line?:          number;
  /** The number of times the Apex was executed in the test run. */
  numExecutions?: number;
  /** The total cumulative time spent at this location. This can be helpful for performance monitoring. */
  time?:          number;
}

/**
 * Interface. Modeled on the MDAPI Object `DeployDetails`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * While a deployment is still in-progress, the `DeployDetails` object only contains `componentFailures` data. After the deployment process finishes, the other fields populate with the data for the entire deployment.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface DeployDetails extends JsonMap {
  /** One or more DeployMessage objects containing deployment errors for each component. */
  componentFailures?:   DeployMessage[];
  /** One or more DeployMessage objects containing successful deployment details for each component. */
  componentSuccesses?:  DeployMessage[];
  /** If the performRetrieve parameter was specified for the deploy() call, a retrieve() call is performed immediately after the deploy() process completes. This field contains the results of that retrieval. */
  retrieveResult?:      RetrieveResult;
  /** If tests were run for the deploy() call, this field contains the test results. While a deployment is still in-progress, this field only contains error data. After the deployment process finishes, this field populates with the data for the entire deployment. */
  runTestResult?:       RunTestsResult;
}

/**
 * Interface. Modeled on the MDAPI object `DeployMessage`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about the deployment success or failure of a component in the deployment .zip file. `DeployResult` objects contain one or more `DeployMessage` objects.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface DeployMessage extends JsonMap {
  /** If true, the component was changed as a result of this deployment. If false, the deployed component was the same as the corresponding component already in the organization. */
  changed?:       boolean;
  /** Each component is represented by a text file. If an error occurred during deployment, this field represents the column of the text file where the error occurred. */
  columnNumber?:  number;
  /** The metadata type of the component in this deployment. */
  componentType?: string;
  /** If true, the component was created as a result of this deployment. If false, the component was either deleted or modified as a result of the deployment. */
  created?:       boolean;
  /** The date and time when the component was created as a result of this deployment. */
  createdDate?:   string;
  /** If true, the component was deleted as a result of this deployment. If false, the component was either new or modified as result of the deployment. */
  deleted?:       boolean;
  /** The name of the file in the .zip file used to deploy this component. */
  fileName?:      string;
  /** The full name of the component. */
  fullName?:      string;
  /** ID of the component being deployed. */
  id?:            string;
  /** Each component is represented by a text file. If an error occurred during deployment, this field represents the line number of the text file where the error occurred. */
  lineNumber?:    number;
  /** If an error or warning occurred, this field contains a description of the problem that caused the compile to fail. */
  problem?:       string;
  /** Indicates the problem type. The problem details are tracked in the problem field. The valid values are: */
  problemType?:   `Warning`|`Error`;
  /** Indicates whether the component was successfully deployed (true) or not (false). */
  success?:       boolean;
}

/**
 * Interface. Modeled on the MDAPI Object `DeployResult`. Returned by a call to `force:mdapi:deploy`.
 *
 * Contains information about the success or failure of the associated `force:mdapi:deploy` call.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface DeployResult extends JsonMap {
  /** ID of the component being deployed. */
  id?:                        string;
  /** The ID of the user who canceled the deployment. */
  canceledBy?:                string;
  /** The full name of the user who canceled the deployment. */
  canceledByName?:            string;
  /** Indicates whether this deployment is being used to check the validity of the deployed files without making any changes in the organization (true) or not (false). A check-only deployment does not deploy any components or change the organization in any way. */
  checkOnly?:                 boolean;
  /** Timestamp for when the deployment process ended. */
  completedDate?:             string;
  /** The ID of the user who created the deployment. */
  createdBy?:                 string;
  /** The full name of the user who created the deployment. */
  createdByName?:             string;
  /** Timestamp for when the `force:mdapi:deploy` call was received. */
  createdDate?:               string;
  /** Provides the details of a deployment that is in-progress or ended */
  details?:                   DeployDetails;
  /** Indicates whether the server finished processing the `force:mdapi:deploy` call for the specified `id`. */
  done?:                      boolean;
  /** Message corresponding to the values in the errorStatusCode field, if any. */
  errorMessage?:              string;
  /** If an error occurred during the `force:mdapi:deploy` call, a status code is returned, and the message corresponding to the status code is returned in the `errorMessagefield`. */
  errorStatusCode?:           string;
  /** Optional. Defaults to false. Specifies whether a deployment should continue even if the deployment generates warnings. Do not set this argument to true for deployments to production organizations. */
  ignoreWarnings?:            boolean;
  /** Timestamp of the last update for the deployment process. */
  lastModifiedDate?:          string;
  /** The number of components that generated errors during this deployment. */
  numberComponentErrors?:     number;
  /** The number of components deployed in the deployment process. Use this value with the numberComponentsTotal value to get an estimate of the deployment’s progress. */
  numberComponentsDeployed?:  number;
  /** The total number of components in the deployment. Use this value with the numberComponentsDeployed value to get an estimate of the deployment’s progress. */
  numberComponentsTotal?:     number;
  /** The number of Apex tests that have generated errors during this deployment. */
  numberTestErrors?:          number;
  /** The number of completed Apex tests for this deployment. Use this value with the numberTestsTotal value to get an estimate of the deployment’s test progress. */
  numberTestsCompleted?:      number;
  /** The total number of Apex tests for this deployment. Use this value with the numberTestsCompleted value to get an estimate of the deployment’s test progress. The value in this field is not accurate until the deployment has started running tests for the components being deployed. */
  numberTestsTotal?:          number;
  /** Indicates whether Apex tests were run as part of this deployment (true) or not (false). Tests are either automatically run as part of a deployment or can be set to run using the `--testlevel` flag for the `force:mdapi:deploy` call. */
  runTestsEnabled?:           boolean;
  /** Optional. Defaults to true. Indicates whether any failure causes a complete rollback (true) or not (false). If false, whatever set of actions can be performed without errors are performed, and errors are returned for the remaining actions. This parameter must be set to true if you are deploying to a production organization. */
  rollbackOnError?:           boolean;
  /** Timestamp for when the deployment process began. */
  startDate?:                 string;
  /** Indicates which component is being deployed or which Apex test class is running. */
  stateDetail?:               string;
  /** Indicates the current state of the deployment. */
  status?:                    `Pending`|`InProgress`|`Succeeded`|`SucceededPartial`|`Failed`|`Canceling`|`Canceled`;
  /** Indicates whether the deployment was successful (true) or not (false). */
  success?:                   boolean;
}

/**
 * Interface. Modeled on the MDAPI Object `FileProperties`. May be part of the results returned by `force:mdapi:retrieve`.
 *
 * Contains information about the properties of each component in the .zip file, and the manifest file `package.xml`.
 * One object per component is returned. Note that this component does not contain information about any associated
 * metadata files in the .zip file, only the component files and manifest file. `FileProperties` contains the
 * following properties:
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_retrieveresult.htm
 */
export interface FileProperties extends JsonMap {
  /** ID of the user who created the file. */
  createdById?:         string;
  /** Name of the user who created the file. */
  createdByName?:       string;
  /** Date and time when the file was created. */
  createdDate?:         string;
  /** Name of the file. */
  fileName?:            string;
  /** The file developer name used as a unique identifier for API access. The value is based on the fileName but the characters allowed are more restrictive. The fullName can contain only underscores and alphanumeric characters. It must be unique, begin with a letter, not include spaces, not end with an underscore, and not contain two consecutive underscores. */
  fullName?:            string;
  /** ID of the file. */
  id?:                  string;
  /** ID of the user who last modified the file. */
  lastModifiedById?:    string;
  /** Name of the user who last modified the file. */
  lastModifiedByName?:  string;
  /** Date and time that the file was last modified. */
  lastModifiedDate?:    string;
  /** Indicates the manageable state of the specified component if it is contained in a package. */
  manageableState?:     `beta`|`deleted`|`deprecated`|`installed`|`released`|`unmanaged`;
  /** If any, the namespace prefix of the component. */
  namespacePrefix?:     string;
  /** Required. The metadata type, such as CustomObject, CustomField, or ApexClass. */
  type?:                string;
}

/**
 * Interface. Modeled on the MDAPI Object `FlowCoverageResult`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about the flow version and the number of elements executed by a test run. Available in API version 44.0 and later.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface FlowCoverageResult extends JsonMap {
  /** List of elements in the flow version that weren’t executed by the test run. */
  elementsNotCovered?:    string;
  /** The ID of the flow version. The ID is unique within an org. */
  flowId?:                string;
  /** The name of the flow that was executed by the test run. */
  flowName?:              string;
  /** The namespace that contains the flow, if one is specified. */
  flowNamespace?:         string;
  /** The total number of elements in the flow version. */
  numElements?:           number;
  /** The number of elements in the flow version that weren’t executed by the test run */
  numElementsNotCovered?: number;
  /** The process type of the flow version. */
  processType?:  string;
}

/**
 * Interface. Modeled on the MDAPI Object `FlowCoverageWarning`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about the flow version that generated warnings. Available in API version 44.0 and later.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface FlowCoverageWarning extends JsonMap {
  /** The ID of the flow version that generated the warning. */
  flowId:         string;
  /** The name of the flow that generated the warning. If the warning applies to the overall test coverage of flows within your org, this value is null. */
  flowName:       string;
  /** The namespace that contains the flow, if one was specified. */
  flowNamespace:  string;
  /** The message of the warning that was generated. */
  message:        string;
}

/**
 * Interface. Modeled on the MDAPI Object `RetrieveResult`. Returned by a call to `force:mdapi:retrieve`.
 *
 * Contains information about the success or failure of the associated `force:mdapi:retrieve` call.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_retrieveresult.htm
 */
export interface RetrieveResult extends JsonMap {
  /** Required. Indicates whether the retrieve() call is completed (true) or not (false). */
  done?:            boolean;
  /** If an error occurs during the force:mdapi:retrieve call, this field contains a descriptive message about this error. */
  errorMessage?:    string;
  /** If an error occurs during the force:mdapi:retrieve call, this field contains the status code for this error. */
  errorStatusCode?: string;
  /** Contains information about the properties of each component in the .zip file, and the manifest file package.xml. One object per component is returned. */
  fileProperties?:  FileProperties;
  /** ID of the component being retrieved. */
  id?:              string;
  /** Contains information about the success or failure of the force:mdapi:retrieve call. */
  messages?:        RetrieveMessage[];
  /** The status of the retrieve() call. Valid values are 'Pending', 'InProgress', 'Succeeded', and 'Failed' */
  status?:          `Pending`|`InProgress`|`Succeeded`|`Failed`;
  /** Indicates whether the retrieve() call was successful (true) or not (false).  */
  success?:         boolean;
  /** The zip file returned by the retrieve request. Base 64-encoded binary data.  */
  zipFile?:         string;
}

/**
 * Interface. Modeled on the MDAPI Object `RunTestsResult`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about the execution of unit tests, including whether unit tests were completed successfully, code coverage results, and failures.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface RunTestsResult extends JsonMap {
  /** The ID of an `ApexLog` object that is created at the end of a test run. The `ApexLog` object is created if there is an active trace flag on the user running an Apex test, or on a class or trigger being executed. */
  apexLogId?:             string;
  /** An array of one or more `CodeCoverageResult` objects that contains the details of the code coverage for the specified unit tests. */
  codeCoverage?:          CodeCoverageResult[];
  /** An array of one or more code coverage warnings for the test run. The results include both the total number of lines that could have been executed, as well as the number, line, and column positions of code that was not executed. */
  codeCoverageWarnings?:  CodeCoverageWarning[];
  /** An array of one or more `RunTestFailure` objects that contain information about the unit test failures, if there are any. */
  failures?:              RunTestFailure[];
  /** An array of results from test runs that executed flows */
  flowCoverage?:          FlowCoverageResult[];
  /** An array of warnings generated by test runs that executed flows. */
  flowCoverageWarnings?:  FlowCoverageWarning[];
  /** The number of failures for the unit tests. */
  numFailures?:           number;
  /** The number of unit tests that were run. */
  numTestsRun?:           number;
  /** An array of one or more `RunTestSuccess` objects that contain information about successes, if there are any. */
  successes?:             RunTestSuccess[];
  /** The total cumulative time spent running tests. This can be helpful for performance monitoring. */
  totalTime?:             number;
}

/**
 * Interface. Modeled on the MDAPI Object `RunTestFailure`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about failures during the unit test run.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface RunTestFailure extends JsonMap {
  /** The ID of the class which generated failures. */
  id?:          string;
  /** The failure message. */
  message?:     string;
  /** The name of the method that failed. */
  methodName?:  string;
  /** The name of the class that failed. */
  name?:        string;
  /** The namespace that contained the class, if one was specified. */
  namespace?:   string;
  /** Indicates whether the test method has access to organization data (true) or not (false). This field is available in API version 33.0 and later. */
  seeAllData?:  boolean;
  /** The stack trace for the failure. */
  stackTrace?:  string;
  /** The time spent running tests for this failed operation. This can be helpful for performance monitoring. */
  time?:        number;
  /** Do not use. In early, unsupported releases, used to specify class or package. */
  type?:        string;
}

/**
 * Interface. Modeled on the MDAPI Object `RunTestSuccess`. May be part of the results returned by `force:mdapi:deploy`.
 *
 * Contains information about successes during the unit test run.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deployresult.htm
 */
export interface RunTestSuccess extends JsonMap {
  /** The ID of the class which generated the success. */
  id?:	        string;
  /** The name of the method that succeeded. */
  methodName:	  string;
  /** The name of the class that succeeded. */
  name?:	      string;
  /** The namespace that contained the unit tests, if one is specified. */
  namespace?:	  string;
  /** Indicates whether the test method has access to organization data (true) or not (false). */
  seeAllData?:	boolean;
  /** The time spent running tests for this operation. This can be helpful for performance monitoring. */
  time?:	      number;
}

/**
 * Interface. Modeled on the MDAPI Object `RetrieveMessage`. May be returned by a call to `force:mdapi:retrieve`.
 *
 * Contains information about the success or failure of the `force:mdapi:retrieve` call. One object per problem is returned.
 *
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_retrieveresult.htm
 */
export interface RetrieveMessage extends JsonMap {
  /** The name of the file in the retrieved .zip file where a problem occurred. */
  fileName?:  string;
  /** A description of the problem that occurred. */
  problem?:   string;
}
