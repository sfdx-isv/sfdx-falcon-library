//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/util/src/bulk-api.ts
 * @summary       Utility Module. Exposes functionality available via the Salesforce Bulk API.
 * @description   Utility functions related to the Salesforce Bulk API. Leverages the JSForce
 *                utilities to make it easy for developers to use the Bulk API directly against any
 *                Salesforce Org that is connected to the local CLI environment.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  * as fse                      from  'fs-extra';               // Extended set of File System utils.

// Import SFDX-Falcon Libraries
import  {TypeValidator}               from  '@sfdx-falcon/validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import Internal Libraries
import  * as csv                      from  './csv';                  // Library of helper functions that make it easier to work with CSV data.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}             from  '@sfdx-falcon/debug'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}             from  '@sfdx-falcon/error'; // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import Internal Classes & Functions
import  {waitASecond}                 from  './async';            // Function. Simple helper function that can be used to introduce a delay when called inside async functions using the "await" keyword.
import  {restApiRequest}              from  './jsforce';          // Function. Given a REST API Request Definition, makes a REST call using JSForce.
import  {restApiRequestRaw}           from  './jsforce';          // Function. Given a REST API Request Definition, makes a REST call using JSForce.

// Import SFDX-Falcon Types
import  {AliasOrConnection}           from  '@sfdx-falcon/types'; // Type. Represents either an Org Alias or a JSForce Connection.
import  {Bulk2FailedResults}          from  '@sfdx-falcon/types'; // Type. Represents the collection of "Failed Results" data from a Bulk API 2.0 job.
import  {Bulk2SuccessfulResults}      from  '@sfdx-falcon/types'; // Type. Represents the collection of "Successful Results" data from a Bulk API 2.0 job.
import  {Bulk2Results}                from  '@sfdx-falcon/types'; // Type. Represents a collection of either "Successful" or "Failure" Results data from a Bulk API 2.0 job.
import  {Bulk2JobCloseAbortRequest}   from  '@sfdx-falcon/types'; // Interface. Represents the request body required to close or abort a Bulk API 2.0 job.
import  {Bulk2JobCloseAbortResponse}  from  '@sfdx-falcon/types'; // Interface. Represents the response body returned by Salesforce when closing or aborting a specific Bulk API 2.0 job.
import  {Bulk2JobCreateRequest}       from  '@sfdx-falcon/types'; // Interface. Represents the request body required to create a Bulk API 2.0 job.
import  {Bulk2JobCreateResponse}      from  '@sfdx-falcon/types'; // Interface. Represents the response body returned by Salesforce after attempting to create a Bulk API 2.0 job.
import  {Bulk2JobInfoResponse}        from  '@sfdx-falcon/types'; // Interface. Represents the response body returned by Salesforce when requesting info about a specific Bulk API 2.0 job.
import  {Bulk2OperationStatus}        from  '@sfdx-falcon/types'; // Interface. Represents the overall status of a Bulk API 2.0 operation.
import  {IntervalOptions}             from  '@sfdx-falcon/types'; // Interface. Represents options that determine how a generic interval operates.
import  {RawRestResponse}             from  '@sfdx-falcon/types'; // Interface. Represents the unparsed response to a "raw" REST API request via a JSForce connection.
import  {RestApiRequestDefinition}    from  '@sfdx-falcon/types'; // Interface. Represents information needed to make a REST API request via a JSForce connection.

// Set file local globals
const maxBulk2DataSourceFileSize            = 1048576;
const maxBulk2DataSourceFileSizeDescriptor  = '100MB';

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:util:bulk-api';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    bulk2Insert
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {Bulk2JobCreateRequest}  bulk2JobCreateRequest  Required. Body of the Bulk2 REST request. See
 *              https://developer.salesforce.com/docs/atlas.en-us.api_bulk_v2.meta/api_bulk_v2/create_job.htm
 *              for documentation for how to create the proper payload.
 * @param       {string}  dataSourcePath Required. Path to the file containing data to be loaded.
 * @param       {IntervalOptions} [intervalOptions] Optional. Options for Bulk2 job status polling.
 * @param       {string}  [apiVersion]  Optional. Overrides default of "most current" API version.
 * @returns     {Promise<Bulk2OperationStatus>}  Resolves with status of the Bulk2 Insert request.
 * @description Given an Alias or Connection, the path to a CSV data file, and a Bulk API v2 request
 *              body, creates a Bulk API v2 ingestion job and uploads the specified CSV file to
 *              Salesforce. Resolves with a `Bulk2OperationStatus` object containing the JSON response
 *              received from Salesforce when the Ingest Job was created as well as an indicator
 *              of the state of the CSV file upload.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function bulk2Insert(aliasOrConnection:AliasOrConnection, bulk2JobCreateRequest:Bulk2JobCreateRequest, dataSourcePath:string, intervalOptions:IntervalOptions={}, apiVersion:string=''):Promise<Bulk2OperationStatus> {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}:bulk2Insert`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidObject (bulk2JobCreateRequest, `${dbgNsLocal}`, `bulk2JobCreateRequest`);
  TypeValidator.throwOnNullInvalidString      (dataSourcePath,        `${dbgNsLocal}`, `dataSourcePath`);
  TypeValidator.throwOnNonReadablePath        (dataSourcePath,        `${dbgNsLocal}`, `dataSourcePath`);
  TypeValidator.throwOnNullInvalidString      (apiVersion,            `${dbgNsLocal}`, `apiVersion`);

  // Create a base error message.
  const baseErrorMsg = `Bulk ${bulk2JobCreateRequest.operation} of ${bulk2JobCreateRequest.object} records failed.`;

  // Get stats on the Data Source file.
  const fileStats = await validateBulk2DataSource(dataSourcePath)
  .catch(bulk2DataSourceError => {
    throw new SfdxFalconError ( `${baseErrorMsg} The data source file provided is invalid for Bulk API 2.0 operations. ${bulk2DataSourceError.message}`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2DataSourceError);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:fileStats:`, fileStats);

  // Start defining the Bulk2 Operation Status object we'll end up returning.
  const bulk2OperationStatus = {
    dataSourcePath:         dataSourcePath,
    dataSourceSize:         fileStats.size,
    successfulResultsPath:  dataSourcePath + '.successfulResults',
    failedResultsPath:      dataSourcePath + '.failedResults'
  } as Bulk2OperationStatus;
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:afterInit:`, bulk2OperationStatus);

  // Make sure that the Operation is set to "insert"
  bulk2JobCreateRequest.operation = 'insert';

  // Create the Bulk2 ingest job.
  bulk2OperationStatus.initialJobStatus = await createBulk2Job(aliasOrConnection, bulk2JobCreateRequest)
  .catch(bulk2JobError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2JobError:`, bulk2JobError);
    throw new SfdxFalconError ( `${baseErrorMsg} Bulk job to ingest data could not be created.`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2JobError
                              , bulk2OperationStatus);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:afterCreate:`, bulk2OperationStatus);

  // Upload the CSV file to Salesforce.
  await uploadBulk2DataSource(aliasOrConnection, dataSourcePath, bulk2OperationStatus.initialJobStatus.contentUrl)
  .catch(bulk2DataUploadError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2DataUploadError:`, bulk2DataUploadError);
    throw new SfdxFalconError ( `${baseErrorMsg} The data source file could not be uploaded.`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2DataUploadError
                              , bulk2OperationStatus);
  });

  // Close the Bulk2 job.
  await closeBulk2Job(aliasOrConnection, bulk2OperationStatus.initialJobStatus.id)
  .catch(bulk2CloseJobError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2CloseJobError:`, bulk2CloseJobError);
    throw new SfdxFalconError ( `${baseErrorMsg} Could not close the bulk data load job. `
                              + `You may want to try and close the job manually via the Setup UI in your org.`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2CloseJobError
                              , bulk2OperationStatus);
  });

  // Monitor the Bulk2 job. This should resolve once the Job is complete, failed, or the timeout expires.
  bulk2OperationStatus.currentJobStatus = await monitorBulk2Job(aliasOrConnection, bulk2OperationStatus.initialJobStatus.id, intervalOptions)
  .catch(bulk2JobMonitorError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2JobMonitorError:`, bulk2JobMonitorError);
    throw new SfdxFalconError ( `${baseErrorMsg} Monitoring failed for Job ID '${bulk2OperationStatus.initialJobStatus.id}'.`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2JobMonitorError
                              , bulk2OperationStatus);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:afterMonitor:`, bulk2OperationStatus);

  // Download the Successful Results.
  bulk2OperationStatus.successfulResults = await downloadSuccessfulResults(aliasOrConnection, bulk2OperationStatus.initialJobStatus.id, bulk2OperationStatus.successfulResultsPath)
  .catch(downloadSuccessfulResultsError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:downloadSuccessfulResultsError:`, downloadSuccessfulResultsError);
    throw new SfdxFalconError ( `${baseErrorMsg} Could not download Successful Results.`
                              , `Bulk2SuccessfulResultsError`
                              , `${dbgNsLocal}`
                              , downloadSuccessfulResultsError
                              , bulk2OperationStatus);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:afterSuccessDownload:`, bulk2OperationStatus);

  // Download the Failed Results.
  bulk2OperationStatus.failedResults = await downloadFailedResults(aliasOrConnection, bulk2OperationStatus.initialJobStatus.id, bulk2OperationStatus.failedResultsPath)
  .catch(downloadFailedResultsError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:downloadFailedResultsError:`, downloadFailedResultsError);
    throw new SfdxFalconError ( `${baseErrorMsg} Could not download Failed Results.`
                              , `Bulk2FailedResultsError`
                              , `${dbgNsLocal}`
                              , downloadFailedResultsError
                              , bulk2OperationStatus);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:afterFailedDownload:`, bulk2OperationStatus);

  // Debug and return the Bulk2 Operation Status.
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2OperationStatus:`, bulk2OperationStatus);
  return bulk2OperationStatus;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    closeBulk2Job
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  jobId Required. Unique ID of the Bulk API 2.0 job the caller wants to close.
 * @returns     {Promise<Bulk2JobCloseAbortResponse>} Resolves with the Bulk2 Job Close/Abort info
 *              returned from Salesforce after the state of the job was changed.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, requests that Salesforce close
 *              that job.  Resolves with the JSON response received from Salesforce.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function closeBulk2Job(aliasOrConnection:AliasOrConnection, jobId:string):Promise<Bulk2JobCloseAbortResponse> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}:closeBulk2Job`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString(jobId, `${dbgNsLocal}`, `jobId`);

  // Create a Bulk2JobCloseAbortRequest object.
  const bulk2JobCloseAbortRequest:Bulk2JobCloseAbortRequest = {
    state:  'UploadComplete'
  };

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      headers:  {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept:         'application/json'
      },
      method: 'patch',
      url:    `/jobs/ingest/${jobId}`,
      body:   JSON.stringify(bulk2JobCloseAbortRequest)
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponse = await restApiRequest(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `Error closing Job ID '${jobId}'. ${restRequestError.message}`
                              , `Bulk2JobError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  }) as Bulk2JobCloseAbortResponse;
  SfdxFalconDebug.obj(`${dbgNsLocal}:restResponse:`, {restResponse: restResponse});

  // Return the REST response.
  return restResponse;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    createBulk2Job
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {Bulk2JobCreateRequest}  bulk2JobCreateRequest  Required. Body of the Bulk2 REST request. See
 *              https://developer.salesforce.com/docs/atlas.en-us.api_bulk_v2.meta/api_bulk_v2/create_job.htm
 *              for documentation for how to create the proper payload.
 * @param       {string}  [apiVersion]  Optional. Overrides default of "most current" API version.
 * @returns     {Promise<Bulk2JobCreateResponse>}  Resolves with the response from Salesforce to the
 *              Bulk2 job creation request.
 * @description Given an Alias or Connection and a Bulk API v2 request body, creates a Bulk API 2.0
 *              job.  Resolves with the JSON response received from Salesforce.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function createBulk2Job(aliasOrConnection:AliasOrConnection, bulk2JobCreateRequest:Bulk2JobCreateRequest, apiVersion:string=''):Promise<Bulk2JobCreateResponse> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}:createBulk2Job`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidObject (bulk2JobCreateRequest, `${dbgNsLocal}`, `bulk2JobCreateRequest`);
  TypeValidator.throwOnNullInvalidString      (apiVersion,            `${dbgNsLocal}`, `apiVersion`);

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      headers:  {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept:         'application/json'
      },
      method: 'post',
      url:    apiVersion ? `/services/data/v${apiVersion}/jobs/ingest` : `/jobs/ingest`,
      body:   JSON.stringify(bulk2JobCreateRequest)
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponse = await restApiRequest(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `Error creating Bulk2 job. ${restRequestError.message}`
                              , `Bulk2JobError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  }) as Bulk2JobCreateResponse;
  SfdxFalconDebug.obj(`${dbgNsLocal}:restResponse:`, {restResponse: restResponse});

  // Return the REST response.
  return restResponse;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    downloadFailureResults
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  jobId Required. Unique ID of the Bulk API 2.0 job the caller wants
 *              Failed Results from.
 * @param       {string}  pathToResults Required. Path to the location where the Failed Results
 *              CSV file should be written.
 * @returns     {Promise<Bulk2FailedResults>} Resolves with the Failed Results, converted to an
 *              array of `JsonMap` objects.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, downloads the "Failed
 *              Results" CSV data which are related to the specified Job, then saves the data
 *              to the user's system at the specified path. Resolves with the Failed Results
 *              Records, converted to an array of `JsonMap` objects.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function downloadFailedResults(aliasOrConnection:AliasOrConnection, jobId:string, pathToResults:string):Promise<Bulk2FailedResults> {

  // Define function-local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:downloadFailedResults`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString(jobId,          `${dbgNsLocal}`, `jobId`);
  TypeValidator.throwOnEmptyNullInvalidString(pathToResults,  `${dbgNsLocal}`, `pathToResults`);

  // Create the appropriate Resource URL.
  const resourceUrl = `/jobs/ingest/${jobId}/failedResults/`;

  // Download and return the results.
  return await downloadResults(aliasOrConnection, resourceUrl, pathToResults)
  .catch(downloadResultsError => {
    throw new SfdxFalconError ( `Could not download Failed Results. ${downloadResultsError.message}`
                              , `Bulk2ResultsError`
                              , `${dbgNsLocal}`
                              , downloadResultsError);
  }) as Bulk2FailedResults;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    downloadResults
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  resourceUrl Required. Endpoint URL where the Results can be downloaded from.
 * @param       {string}  pathToResults Required. Path to the location where the results CSV file
 *              should be written.
 * @returns     {Promise<Bulk2Results>} Resolves with the Results in the form of an array of `JsonMap`
 *              objects for each Results Record.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, downloads the "Successful
 *              Results" CSV data which are related to the specified Job, then saves the data
 *              to the user's system at the specified path.  Resolves with the Results in the form
 *              of an array of `JsonMap` objects for each Results Record.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function downloadResults(aliasOrConnection:AliasOrConnection, resourceUrl:string, pathToResults:string):Promise<Bulk2Results> {

  // Define function-local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:downloadResults`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString(resourceUrl,    `${dbgNsLocal}`, `resourceUrl`);
  TypeValidator.throwOnEmptyNullInvalidString(pathToResults,  `${dbgNsLocal}`, `pathToResults`);

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      headers:  {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept:         'text/csv'
      },
      method: 'get',
      url:    resourceUrl
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponseRaw = await restApiRequestRaw(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `REST request to '${resourceUrl}' failed. ${restRequestError.message}`
                              , `Bulk2ResultsError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  })
  .then((rawRestResponse:RawRestResponse) => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:rawRestResponse:`, rawRestResponse);
    if (isNaN(rawRestResponse.statusCode) || rawRestResponse.statusCode !== 200) {
      throw new SfdxFalconError ( `REST request to '${resourceUrl}' failed (STATUS_CODE: ${rawRestResponse.statusCode}). `
                                + rawRestResponse.body
                                , `Bulk2ResultsError`
                                , `${dbgNsLocal}`);
    }
    return rawRestResponse;
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:restResponseRaw:`, restResponseRaw);

  // Save the body of the Raw REST Response to the local filesystem.
  await csv.writeCsvToFile(restResponseRaw.body, pathToResults)
  .catch(writeError => {
    throw new SfdxFalconError ( `Job results not saved. ${writeError.message}`
                              , `Bulk2ResultsError`
                              , `${dbgNsLocal}`
                              , writeError);
  });

  // Parse the CSV response into JSON.
  const bulk2Results = await csv.parseString(restResponseRaw.body)
  .catch(csvParseError => {
    throw new SfdxFalconError ( `Job results not parseable. ${csvParseError.message}`
                              , `Bulk2ResultsError`
                              , `${dbgNsLocal}`
                              , csvParseError);
  }) as Bulk2Results;
  SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2Results:`, bulk2Results);

  // Return the JSON version of the response.
  return bulk2Results;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    downloadSuccessfulResults
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  jobId Required. Unique ID of the Bulk API 2.0 job the caller wants
 *              Successful Results from.
 * @param       {string}  pathToResults Required. Path to the location where the Successful Results
 *              CSV file should be written.
 * @returns     {Promise<Bulk2SuccessfulResults>} Resolves with the Successful Results, converted
 *              to an array of `JsonMap` objects.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, downloads the "Successful
 *              Results" CSV data which are related to the specified Job, then saves the data
 *              to the user's system at the specified path.  Resolves with the Successful Results
 *              Records, converted to an array of `JsonMap` objects.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function downloadSuccessfulResults(aliasOrConnection:AliasOrConnection, jobId:string, pathToResults:string):Promise<Bulk2SuccessfulResults> {

  // Define function-local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:downloadSuccessfulResults`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString(jobId,          `${dbgNsLocal}`, `jobId`);
  TypeValidator.throwOnEmptyNullInvalidString(pathToResults,  `${dbgNsLocal}`, `pathToResults`);

  // Create the appropriate Resource URL.
  const resourceUrl = `/jobs/ingest/${jobId}/successfulResults/`;

  // Download and return the results.
  return await downloadResults(aliasOrConnection, resourceUrl, pathToResults)
  .catch(downloadResultsError => {
    throw new SfdxFalconError ( `Could not download Successful Results. ${downloadResultsError.message}`
                              , `Bulk2ResultsError`
                              , `${dbgNsLocal}`
                              , downloadResultsError);
  }) as Bulk2SuccessfulResults;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getBulk2JobInfo
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  jobId Required. Unique ID of the Bulk API 2.0 job the caller wants info for.
 * @returns     {Promise<Bulk2JobInfoResponse>} Resolves with the Bulk2 Job Info returned from
 *              Salesforce for the provided Job ID.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, requests information about
 *              that job.  Resolves with the JSON response received from Salesforce.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function getBulk2JobInfo(aliasOrConnection:AliasOrConnection, jobId:string):Promise<Bulk2JobInfoResponse> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}:getBulk2JobInfo`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString(jobId, `${dbgNsLocal}`, `jobId`);

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      headers:  {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept:         'application/json'
      },
      method: 'get',
      url:    `/jobs/ingest/${jobId}`
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponse = await restApiRequest(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `Error creating Bulk2 job. ${restRequestError.message}`
                              , `Bulk2JobError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  }) as Bulk2JobInfoResponse;
  SfdxFalconDebug.obj(`${dbgNsLocal}:restResponse:`, {restResponse: restResponse});

  // Return the REST response.
  return restResponse;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    monitorBulk2Job
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  jobId Required. Unique ID of the Bulk API 2.0 job the caller wants to close.
 * @param       {IntervalOptions} [intervalOptions] Optional. Options for Bulk2 job status polling.
 * @returns     {Promise<Bulk2JobInfoResponse>} Resolves with the last Bulk2 Job Info returned from
 *              Salesforce before monitoring stopped.
 * @description Given an Alias or Connection and a Bulk API v2 Job ID, polls Salesforce at the
 *              specified Polling Interval to request information about the specified Job.
 *              Resolves with the last Bulk2 Job Info response returned from Salesforce before
 *              monitoring stopped.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function monitorBulk2Job(aliasOrConnection:AliasOrConnection, jobId:string, intervalOptions:IntervalOptions={}):Promise<Bulk2JobInfoResponse> {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}:monitorBulk2Job`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString (jobId,           `${dbgNsLocal}`, `jobId`);
  TypeValidator.throwOnNullInvalidObject      (intervalOptions, `${dbgNsLocal}`, `intervalOptions`);

  // Finalize all Interval Options.
  const initialInterval     = isNaN(intervalOptions.initial)      ? 5   : Math.round(Math.abs(intervalOptions.initial));
  const incrementIntervalBy = isNaN(intervalOptions.incrementBy)  ? 5   : Math.round(Math.abs(intervalOptions.incrementBy));
  const maxInterval         = isNaN(intervalOptions.maximum)      ? 30  : Math.round(Math.abs(intervalOptions.maximum));
  const timeout             = isNaN(intervalOptions.timeout)      ? 600 : Math.round(Math.abs(intervalOptions.timeout));

  // Define the variable we'll use to track the interval as it changes.
  let interval = initialInterval;

  // Determine the timecode beyond which polling should end.
  const pollingEnd = Date.now() + (timeout * 1000);
  
  // Declare variable to hold Bulk2 Job Info we get back.
  let bulk2JobInfo:Bulk2JobInfoResponse = null;

  // Define the "active states" that will trigger the continuation of monitoring if they're encountered.
  const activeStates = ['Open', 'UploadComplete', 'InProgress'];

  // Begin monitoring the Bulk2 Job.
  do {

    // Debug.
    SfdxFalconDebug.str(`${dbgNsLocal}:interval:`, interval.toString());
    SfdxFalconDebug.str(`${dbgNsLocal}:secsBeforeTimeout:`, Math.round((pollingEnd - Date.now()) / 1000).toString());

    // Wait for the specified interval to pass.
    await waitASecond(interval);

    // Get the current status of the Bulk2 job.
    bulk2JobInfo = await getBulk2JobInfo(aliasOrConnection, jobId)
    .catch((bulk2JobInfoError:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2JobInfoError:`, bulk2JobInfoError);
      throw new SfdxFalconError ( `Error while monitoring Job ID '${jobId}'. ${bulk2JobInfoError.message}`
                                , `Bulk2InsertError`
                                , `${dbgNsLocal}`
                                , bulk2JobInfoError);
    });
    SfdxFalconDebug.obj(`${dbgNsLocal}:bulk2JobInfo:`, bulk2JobInfo);

    // Update the interval
    const newInterval = interval + incrementIntervalBy;
    interval = (newInterval <= maxInterval) ? newInterval : maxInterval;

    // Compute the current Timecode with the interval added on.
    const timecodeNow = Date.now();
    SfdxFalconDebug.str(`${dbgNsLocal}:timecodeNow:`, timecodeNow.toString());

    const timecodePlusInterval  = timecodeNow + (interval * 1000);
    SfdxFalconDebug.str(`${dbgNsLocal}:timecodePlusInterval:`, timecodePlusInterval.toString());

    // Break the loop if the updated interval would put the next request AFTER the timeout.
    if (timecodePlusInterval > pollingEnd) {
      SfdxFalconDebug.msg(`${dbgNsLocal}:breakFromLoop:`, `Exceeded the Bulk2 job monitoring timeout.`);
      break;
    }

  } while (activeStates.includes(bulk2JobInfo.state));

  // Wait a few more seconds to make sure the results are available.
  await waitASecond(3);

  // Return the last set of Bulk2 Job Info we got back.
  return bulk2JobInfo;

}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    uploadBulk2DataSource
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @param       {string}  dataSourcePath Required. Path to the file containing data to be loaded.
 * @param       {string}  resourceUrl Required. Determines which job the uploaded data will be
 *              associated with. Use the value provided in the contentUrl field in the response when
 *              a job is created, or the response from a Job Info request on an open job.
 * @returns     {Promise<string>}  Resolves with the HTTP response code from Salesforce.
 * @description Given an Alias or Connection and a Bulk API v2 request body, creates a Bulk API 2.0
 *              job.  Resolves with the JSON response received from Salesforce.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function uploadBulk2DataSource(aliasOrConnection:AliasOrConnection, dataSourcePath:string, resourceUrl:string):Promise<string> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}:uploadBulk2DataSource`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidString (resourceUrl,     `${dbgNsLocal}`, `resourceUrl`);
  TypeValidator.throwOnNullInvalidString      (dataSourcePath,  `${dbgNsLocal}`, `dataSourcePath`);
  TypeValidator.throwOnNonReadablePath        (dataSourcePath,  `${dbgNsLocal}`, `dataSourcePath`);

  // Make sure the caller provided a valid Bulk API 2.0 data source.
  await validateBulk2DataSource(dataSourcePath);

  // Load the data source file.
  const dataSource = await fse.readFile(dataSourcePath, 'utf8')
  .catch(readFileError => {
    throw new SfdxFalconError ( `Could not read '${dataSourcePath}'. ${readFileError.message}`
                              , `FileSystemError`
                              , `${dbgNsLocal}`
                              , readFileError);
  });

  // Make sure the Resource URL starts with a leading forward slash
  if (resourceUrl.startsWith('/') !== true) {
    resourceUrl = '/' + resourceUrl;
  }

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      headers:  {
        'Content-Type': 'text/csv',
        Accept:         'application/json'
      },
      method: 'put',
      url:    resourceUrl,
      body:   dataSource
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponse = await restApiRequest(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.obj(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `Error uploading '${dataSourcePath}' to Salesforce. ${restRequestError.message}`
                              , `DataUploadError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:restResponse:`, {restResponse: restResponse});

  // Make sure we got back HTTP 201


  // Debug and return the REST response.
  return 'xxxx';
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateBulk2DataSource
 * @param       {string}  dataSourcePath Required. Path to the file containing data to be loaded.
 * @returns     {Promise<fse.Stats>}  Resolves with a FileSystem `Stats` object.
 * @description Given the path to a Data Source file, ensures that the file exists and checks its
 *              size in bytes. Missing or inaccessible files, and files that are larger than 100MB,
 *              will cause an error to be thrown.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function validateBulk2DataSource(dataSourcePath:string):Promise<fse.Stats> {

  // Define function-local namespace.
  const dbgNsLocal = `${dbgNs}:validateBulk2DataSource`;

  // Debug and validate incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  TypeValidator.throwOnNullInvalidString(dataSourcePath,  `${dbgNsLocal}`,  `dataSourcePath`);
  TypeValidator.throwOnNonReadablePath  (dataSourcePath,  `${dbgNsLocal}`,  `dataSourcePath`);

  // Get stats on the Data Source file.
  const fileStats = await fse.stat(dataSourcePath)
  .catch(fileStatsError => {
    throw new SfdxFalconError ( `Could not get stats for '${dataSourcePath}'`
                              , `FileStatsError`
                              , `${dbgNsLocal}`
                              , fileStatsError);
  });
  SfdxFalconDebug.obj(`${dbgNsLocal}:fileStats:`, fileStats);

  // Make sure the Data Source file is not larger than 100MB (1,048,576 bytes).
  if (fileStats.size > maxBulk2DataSourceFileSize) {
    throw new SfdxFalconError ( `Maximum file size exceeded. `
                              + `Current file size of '${dataSourcePath}' is ${fileStats.size} bytes. `
                              + `Maximum file size is ${maxBulk2DataSourceFileSizeDescriptor} (${maxBulk2DataSourceFileSize} bytes).`
                              , `DataSourceSizeError`
                              , `${dbgNsLocal}`);
  }

  // If we get here, we're all good.
  return fileStats;
}
