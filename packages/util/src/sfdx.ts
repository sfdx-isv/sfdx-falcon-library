//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/util/src/sfdx.ts
 * @summary       Utility Module - SFDX
 * @description   Utility functions related to Salesforce DX and the Salesforce CLI
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import {Aliases}                  from  '@salesforce/core';       // Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
import {AuthInfo}                 from  '@salesforce/core';       // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will use to keep tokens active.
import {Connection}               from  '@salesforce/core';       // Handles connections and requests to Salesforce Orgs.
import {cloneDeep}                from  'lodash';                 // Recursively clones objects.
import * as path                  from  'path';                   // Node's native tool for inspecting/manipulating file paths.
const shell                       = require('shelljs');           // Cross-platform shell access - use for setting up Git repo.

// Import SFDX-Falcon Libraries
import {TypeValidator}            from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import {SfdxFalconDebug}          from  '@sfdx-falcon/debug';     // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}          from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxCliError}             from  '@sfdx-falcon/error';     // Class. Extends SfdxFalconError to provide specialized error handling of error results returned from CLI commands run via shell exec.
import {ShellError}               from  '@sfdx-falcon/error';     // Class. Extends SfdxFalconError to provide specialized error handling of error results returned by failed shell commands
import {SfdxFalconResult}         from  '@sfdx-falcon/status';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".

// Import Internal Classes & Functions
import {waitASecond}              from  './async';                // Function. Can be used to introduce a delay when called inside async functions with the "await" keyword.
import {safeParse}                from  './index';                // Function. Given any content to parse, returns a JavaScript object based on that content.
import {convertPropertyToBoolean} from  './index';                // Function. Given a target object and key that the caller wants to convert, attempts to coerce a boolean value based on the intent of the value currently in that property.
import {convertPropertyToNumber}  from  './index';                // Function. Given a target object and key that the caller wants to convert, attempts to coerce a number value based on the intent of the value currently in that property.

// Import SFDX-Falcon Types
import {SfdxFalconResultType}     from  '@sfdx-falcon/status';    // Enum. Represents the different types of sources where Results might come from.
import {AliasOrConnection}        from  '@sfdx-falcon/types';     // Type. Represents either an Org Alias or a JSForce Connection.
import {AnyJson}                  from  '@sfdx-falcon/types';     // Type. Any valid JSON value.
import {DeployResult}             from  '@sfdx-falcon/types';     // Interface. Modeled on the MDAPI Object DeployResult. Returned by a call to force:mdapi:deploy.
import {DeployMessage}            from  '@sfdx-falcon/types';     // Interface. Modeled on the MDAPI object DeployMessage. May be part of the results returned by force:mdapi:deploy.
import {JsonMap}                  from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import {ResolvedConnection}       from  '@sfdx-falcon/types';     // Interface. Represents a resolved (active) JSForce connection to a Salesforce Org.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:falcon:sfdx';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the expected possible input and output of a generic Salesforce CLI call.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxUtilityResultDetail {
  sfdxCommandString:  string;
  stdOutParsed:       AnyJson;
  stdOutBuffer:       string;
  stdErrBuffer:       string;
  error:              Error;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the possible flags that are available to the force:data:soql:query command.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxForceDataSoqlQueryOptions {
  json?:          boolean;
  logLevel?:      'trace'|'debug'|'info'|'warn'|'error'|'fatal';
  apiVersion?:    string;
  useToolingApi?: boolean;
  resultFormat?:  'human'|'csv'|'json';
  perfLog?:       boolean;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    deployMetadata
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string}  deployDirectory Required. Path to directory containing a package manifest
 *              (`package.xml`) that specifies the components to deploy.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI's `force:mdapi:deploy` command to deploy the metadata
 *              components specified by the Manifest File (`package.xml`) inside the Deploy Directory.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function deployMetadata(aliasOrUsername:string, deployDirectory:string):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:deployMetadata`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString =
    `sfdx force:mdapi:deploy `
  + ` --targetusername ${aliasOrUsername}`
  + ` --deploydir "${deployDirectory}"`
  + ` --wait 10`
  + ` --testlevel NoTestRun`
  + ` --loglevel debug`
  + ` --json`;

  // Introduce a small delay in case this is being used by an Observable Listr Task.
  await waitASecond(3);

  // Initialize a UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:deployMetadata`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'Metadata Deployment Failed',
    successMessage: 'Metadata Deployment Succeeded',
    mixedMessage:   'Metadata Deployment failed but the CLI returned a Success Response'
  };

  // Execute the Salesforce CLI Command.
  return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    detectSalesforceCliError
 * @param       {unknown} thingToCheck  Required. Either a string buffer containing an
 *              stderr CLI response or a `safeParse()` JSON object that (hopefully) came from a
 *              Salesforce CLI command.
 * @returns     {boolean} Returns `true` if the `stdOutBuffer` contains something that might be
 *              considered an error.  `false` if otherwise.
 * @description Given a string buffer containing an stdout response, determines if that response
 *              should be considered a Salesforce CLI error. Please note that there could still be
 *              something wrong with the result even if this function returns `false`.  It just means
 *              that `stdOutBuffer` did not contain something that could be interpreted as a
 *              Salesforce CLI Error.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function detectSalesforceCliError(thingToCheck:unknown):boolean {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:detectSalesforceCliError`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Parse thingToCheck if it's a string, assign it directly if not.
  let possibleCliError:object;
  if (typeof thingToCheck === 'string') {
    possibleCliError  = safeParse(thingToCheck);
  }
  else {
    possibleCliError  = thingToCheck as object;
  }

  // Debug
  SfdxFalconDebug.obj(`${dbgNsLocal}:possibleCliError:`, possibleCliError);

  // If the Possible CLI Error "status" property is present AND has a non-zero value, then IT IS a Salesforce CLI Error.
  if (possibleCliError['status'] && possibleCliError['status'] !== 0) {
    return true;  // This is definitely a Salesforce CLI Error
  }
  else {
    return false; // This is NOT a Salesforce CLI Error.
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    executeRedirectedSfdxCommand
 * @param       {string}  sfdxCommandString Required. String containing an `sfdx force` command.
 * @param       {string}  outputRedirectString  Required. String specifying output redirection.
 * @param       {SfdxFalconResult}  utilityResult Required. Falcon Result used to track actions here.
 * @param       {object}  [messages]  Optional. Success, failure, and "mixed" messages.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI to execute the `sfdx force` command provided by the caller.
 *              Output from the command is redirected per the instructions in the Output Redirect
 *              String.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function executeRedirectedSfdxCommand(sfdxCommandString:string, outputRedirectString:string, utilityResult:SfdxFalconResult, messages:object={}):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:executeRedirectedSfdxCommand`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Extract the Detail object from the Utility Result.
  const utilityResultDetail = utilityResult.detail as SfdxUtilityResultDetail;

  // Override default messages if provided by the caller.
  const failureMessage  = messages['failureMessage']  ||  'Salesforce CLI Command Failed';
  const successMessage  = messages['successMessage']  ||  'Salesforce CLI Command Succeeded';
  const mixedMessage    = messages['mixedMessage']    ||  'Salesforce CLI Command failed but returned a Success Response';

  return new Promise((resolve, reject) => {

    // Declare a function-local string buffer to hold the stdio stream.
    let stdOutBuffer:string = '';
    let stdErrBuffer:string = '';

    // Set the FORCE_COLOR environment variable to 0.
    // This prevents the possibility of ANSI Escape codes polluting STDOUT
    shell.env['FORCE_COLOR'] = 0;

    // Set the SFDX_JSON_TO_STDOUT environment variable to TRUE.
    // This won't be necessary after CLI v45.  See CLI v44.2.0 release notes for more info.
    shell.env['SFDX_JSON_TO_STDOUT'] = 'true';

    // Set the SFDX_AUTOUPDATE_DISABLE environment variable to TRUE.
    // This may help prevent strange typescript compile errors when internal SFDX CLI commands are executed.
    shell.env['SFDX_AUTOUPDATE_DISABLE'] = 'true';

    // Run the SFDX Command String asynchronously inside a child process.
    const childProcess = shell.exec(sfdxCommandString, {silent:true, async: true});

    // Capture stdout datastream. Data is piped in from stdout in small chunks, so prepare for multiple calls.
    childProcess.stdout.on('data', (stdOutDataStream:string) => {
      stdOutBuffer += stdOutDataStream;
    });

    // Capture the stderr datastream. Values should only come here if there was a shell error.
    // CLI warnings used to be sent to stderr as well, but as of CLI v45 all output should be going to stdout.
    childProcess.stderr.on('data', (stdErrDataStream:string) => {
      stdErrBuffer += stdErrDataStream;
    });

    // Handle Child Process "close". Fires only once the contents of stdout and stderr are read.
    childProcess.on('close', (code:number, signal:string) => {

      // If stdout was redirected, the buffer may be empty. Provide a default value.
      if (stdOutBuffer === '') {
        stdOutBuffer = `{"status":${code}, "message":"Output redirected to ${outputRedirectString}"}`;
      }

      // Store BOTH stdout and stderr buffers (this helps track stderr WARNING messages)
      utilityResultDetail.stdOutBuffer = stdOutBuffer;
      utilityResultDetail.stdErrBuffer = stdErrBuffer;

      // Determine if the command succeded or failed.
      if (code !== 0) {
        if (detectSalesforceCliError(stdOutBuffer)) {

          // We have a Salesforce CLI Error. Prepare ERROR detail using SfdxCliError.
          utilityResultDetail.error = new SfdxCliError(sfdxCommandString, stdOutBuffer, stdErrBuffer, `${failureMessage}`, `${dbgNsLocal}`);
        }
        else {

          // We have a shell Error. Prepare ERROR detail using ShellError.
          utilityResultDetail.error = new ShellError(sfdxCommandString, code, signal, stdOutBuffer, stdErrBuffer, null, `${dbgNsLocal}`);
        }

        // Close the UTILITY result out as an ERROR.
        utilityResult.error(utilityResultDetail.error);
        utilityResult.debugResult(`${failureMessage}`, `${dbgNsLocal}:`);

        // Reject the result.
        reject(utilityResult);
      }
      else {

        //The code below can be used to simulate invalid JSON response that sometimes comes from the Salesforce CLI
        //stdOutBuffer = '\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1G{"message":"The request to create a scratch org failed with error code: C-9999.","status":1,"stack":"RemoteOrgSignupFailed: The request to create a scratch org failed with error code: C-9999.\\n    at force.retrieve.then (/Users/vchawla/.local/share/sfdx/client/node_modules/salesforce-alm/dist/lib/scratchOrgInfoApi.js:333:25)\\n    at tryCatcher (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/util.js:16:23)\\n    at Promise._settlePromiseFromHandler (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:510:31)\\n    at Promise._settlePromise (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:567:18)\\n    at Promise._settlePromise0 (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:612:10)\\n    at Promise._settlePromises (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:691:18)\\n    at Async._drainQueue (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:138:16)\\n    at Async._drainQueues (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:148:10)\\n    at Immediate.Async.drainQueues (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:17:14)\\n    at runCallback (timers.js:789:20)\\n    at tryOnImmediate (timers.js:751:5)\\n    at processImmediate [as _immediateCallback] (timers.js:722:5)","name":"RemoteOrgSignupFailed","warnings":[]}\n'

        // Make sure we got back a valid JSON Response
        const stdOutJsonResponse  = stdOutBuffer.substring(stdOutBuffer.indexOf('{'), stdOutBuffer.lastIndexOf('}')+1);
        const parsedCliResponse   = safeParse(stdOutJsonResponse) as AnyJson;

        // Unparseable responses from the CLI are SHELL ERRORS and should be rejected.
        if (parsedCliResponse['unparsed']) {
          utilityResultDetail.error = new ShellError(sfdxCommandString, code, signal, stdOutBuffer, stdErrBuffer, null, `${dbgNsLocal}`);
          utilityResult.error(utilityResultDetail.error);
          reject(utilityResult);
        }

        // Parseable responses might be CLI ERRORS and should be marked ERROR and rejected if so.
        if (detectSalesforceCliError(parsedCliResponse)) {
          utilityResultDetail.error = new SfdxCliError(sfdxCommandString, stdOutJsonResponse, stdErrBuffer, `${failureMessage}`, `${dbgNsLocal}`);
          utilityResult.error(utilityResultDetail.error);
          utilityResult.debugResult(`${mixedMessage}`, `${dbgNsLocal}:`);
          reject(utilityResult);
        }

        // If we get here, the call was successful. Prepare the SUCCESS detail for this function's Result.
        utilityResultDetail.stdOutParsed = parsedCliResponse;

        // Regiser a SUCCESS result
        utilityResult.success();
        utilityResult.debugResult(`${successMessage}`, `${dbgNsLocal}:`);

        // Resolve with the successful SFDX-Falcon Result.
        resolve(utilityResult);
      }
    });
  }) as Promise<SfdxFalconResult>;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    executeSfdxCommand
 * @param       {string}  sfdxCommandString Required. String containing an `sfdx force` command.
 * @param       {SfdxFalconResult}  utilityResult Required. Falcon Result used to track actions here.
 * @param       {object}  [messages]  Optional. Success, failure, and "mixed" messages.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI to execute the `sfdx force` command provided by the caller.
 *              All data returned from the CLI command execution is wrapped up in an `SfdxFalconResult`
 *              object, with stdout and stderr contained within the RESULT's details object.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function executeSfdxCommand(sfdxCommandString:string, utilityResult:SfdxFalconResult, messages:object={}):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:executeSfdxCommand`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Extract the Detail object from the Utility Result.
  const utilityResultDetail = utilityResult.detail as SfdxUtilityResultDetail;

  // Override default messages if provided by the caller.
  const failureMessage  = messages['failureMessage']  ||  'Salesforce CLI Command Failed';
  const successMessage  = messages['successMessage']  ||  'Salesforce CLI Command Succeeded';
  const mixedMessage    = messages['mixedMessage']    ||  'Salesforce CLI Command failed but returned a Success Response';

  return new Promise((resolve, reject) => {

    // Declare a function-local string buffer to hold the stdio stream.
    let stdOutBuffer:string = '';
    let stdErrBuffer:string = '';

    // Set the FORCE_COLOR environment variable to 0.
    // This prevents the possibility of ANSI Escape codes polluting STDOUT
    shell.env['FORCE_COLOR'] = 0;

    // Set the SFDX_JSON_TO_STDOUT environment variable to TRUE.
    // This won't be necessary after CLI v45.  See CLI v44.2.0 release notes for more info.
    shell.env['SFDX_JSON_TO_STDOUT'] = 'true';

    // Set the SFDX_AUTOUPDATE_DISABLE environment variable to TRUE.
    // This may help prevent strange typescript compile errors when internal SFDX CLI commands are executed.
    shell.env['SFDX_AUTOUPDATE_DISABLE'] = 'true';

    // Run the SFDX Command String asynchronously inside a child process.
    const childProcess = shell.exec(sfdxCommandString, {silent:true, async: true});

    // Capture stdout datastream. Data is piped in from stdout in small chunks, so prepare for multiple calls.
    childProcess.stdout.on('data', (stdOutDataStream:string) => {
      stdOutBuffer += stdOutDataStream;
    });

    // Capture the stderr datastream. Values should only come here if there was a shell error.
    // CLI warnings used to be sent to stderr as well, but as of CLI v45 all output should be going to stdout.
    childProcess.stderr.on('data', (stdErrDataStream:string) => {
      stdErrBuffer += stdErrDataStream;
    });

    // Handle Child Process "close". Fires only once the contents of stdout and stderr are read.
    childProcess.on('close', (code:number, signal:string) => {

      // Store BOTH stdout and stderr buffers (this helps track stderr WARNING messages)
      utilityResultDetail.stdOutBuffer = stdOutBuffer;
      utilityResultDetail.stdErrBuffer = stdErrBuffer;

      // Determine if the command succeded or failed.
      if (code !== 0) {
        if (detectSalesforceCliError(stdOutBuffer)) {

          // We have a Salesforce CLI Error. Prepare ERROR detail using SfdxCliError.
          utilityResultDetail.error = new SfdxCliError(sfdxCommandString, stdOutBuffer, stdErrBuffer, `${failureMessage}`, `${dbgNsLocal}`);
        }
        else {

          // We have a shell Error. Prepare ERROR detail using ShellError.
          utilityResultDetail.error = new ShellError(sfdxCommandString, code, signal, stdOutBuffer, stdErrBuffer, null, `${dbgNsLocal}`);
        }

        // Close the UTILITY result out as an ERROR.
        utilityResult.error(utilityResultDetail.error);
        utilityResult.debugResult(`${failureMessage}`, `${dbgNsLocal}:`);

        // Reject the result.
        reject(utilityResult);
      }
      else {

        //The code below can be used to simulate invalid JSON response that sometimes comes from the Salesforce CLI
        //stdOutBuffer = '\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1GProcessing... \\\u001b[2K\u001b[1GProcessing... |\u001b[2K\u001b[1GProcessing... /\u001b[2K\u001b[1GProcessing... -\u001b[2K\u001b[1G{"message":"The request to create a scratch org failed with error code: C-9999.","status":1,"stack":"RemoteOrgSignupFailed: The request to create a scratch org failed with error code: C-9999.\\n    at force.retrieve.then (/Users/vchawla/.local/share/sfdx/client/node_modules/salesforce-alm/dist/lib/scratchOrgInfoApi.js:333:25)\\n    at tryCatcher (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/util.js:16:23)\\n    at Promise._settlePromiseFromHandler (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:510:31)\\n    at Promise._settlePromise (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:567:18)\\n    at Promise._settlePromise0 (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:612:10)\\n    at Promise._settlePromises (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/promise.js:691:18)\\n    at Async._drainQueue (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:138:16)\\n    at Async._drainQueues (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:148:10)\\n    at Immediate.Async.drainQueues (/Users/vchawla/.local/share/sfdx/client/node_modules/bluebird/js/release/async.js:17:14)\\n    at runCallback (timers.js:789:20)\\n    at tryOnImmediate (timers.js:751:5)\\n    at processImmediate [as _immediateCallback] (timers.js:722:5)","name":"RemoteOrgSignupFailed","warnings":[]}\n'

        // Make sure we got back a valid JSON Response
        const stdOutJsonResponse  = stdOutBuffer.substring(stdOutBuffer.indexOf('{'), stdOutBuffer.lastIndexOf('}')+1);
        const parsedCliResponse   = safeParse(stdOutJsonResponse) as AnyJson;

        // Unparseable responses from the CLI are SHELL ERRORS and should be rejected.
        if (parsedCliResponse['unparsed']) {
          utilityResultDetail.error = new ShellError(sfdxCommandString, code, signal, stdOutBuffer, stdErrBuffer, null, `${dbgNsLocal}`);
          utilityResult.error(utilityResultDetail.error);
          reject(utilityResult);
        }

        // Parseable responses might be CLI ERRORS and should be marked ERROR and rejected if so.
        if (detectSalesforceCliError(parsedCliResponse)) {
          utilityResultDetail.error = new SfdxCliError(sfdxCommandString, stdOutJsonResponse, stdErrBuffer, `${failureMessage}`, `${dbgNsLocal}`);
          utilityResult.error(utilityResultDetail.error);
          utilityResult.debugResult(`${mixedMessage}`, `${dbgNsLocal}:`);
          reject(utilityResult);
        }

        // If we get here, the call was successful. Prepare the SUCCESS detail for this function's Result.
        utilityResultDetail.stdOutParsed = parsedCliResponse;

        // Regiser a SUCCESS result
        utilityResult.success();
        utilityResult.debugResult(`${successMessage}`, `${dbgNsLocal}:`);

        // Resolve with the successful SFDX-Falcon Result.
        resolve(utilityResult);
      }
    });
  }) as Promise<SfdxFalconResult>;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    executeSoqlQuery
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string}  soqlQuery  Required.
 * @param       {SfdxForceDataSoqlQueryOptions} [opts]  Optional. Allows the caller to set various
 *              flags that are available to the `force:data:soql:query` command.
 * @param       {string}  [targetFile] Optional. The complete path to a file where the results of
 *              the query should be sent to INSTEAD of to stdout.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI's `force:mdapi:retrieve` command to retrieve the metadata
 *              components specified by the supplied Manifest File (ie. `package.xml`).
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function executeSoqlQuery(aliasOrUsername:string, soqlQuery:string, opts:SfdxForceDataSoqlQueryOptions={}, targetFile:string=''):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:executeSoqlQuery`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // TODO: Sanitize the targetFile variable to ensure the caller can't run arbitrary code.

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString =
    `sfdx force:data:soql:query`
  + ` --targetusername ${aliasOrUsername}`
  + ` --query "${soqlQuery}"`
  + (opts.resultFormat  ? ` --resultformat ${opts.resultFormat}` : ``)
  + (opts.apiVersion    ? ` --apiversion ${opts.apiVersion}` : ``)
  + (opts.logLevel      ? ` --loglevel ${opts.logLevel}` : ``)
  + (opts.useToolingApi ? ` --usetoolingapi` : ``)
  + (opts.perfLog       ? ` --perflog` : ``)
  + (opts.json          ? ` --json` : ``)
  + (targetFile         ? ` > ${targetFile}` : ``);

  // Introduce a small delay in case this is being used by an Observable Listr Task.
  await waitASecond(3);

  // Initialize a UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:executeSoqlQuery`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'SOQL Query Failed',
    successMessage: 'SOQL Query Succeeded',
    mixedMessage:   'SOQL Query failed but the CLI returned a Success Response'
  };

  // If the caller specified a Target File, then we must execute a "redirected" SFDX command.
  if (targetFile) {

    // Make sure that a path to the Target File exists. There should be no ill effects if targetFile is an empty string.
    shell.mkdir('-p', path.dirname(targetFile));

    // Execute the Salesforce CLI Command and redirect output to file.
    return executeRedirectedSfdxCommand(sfdxCommandString, `> ${targetFile}`, utilityResult, messages);
  }
  else {

    // Execute the SFDX command in the standard way.
    return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    fetchMetadataPackages
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string[]}  packageNames  Required. String array containing the names of all
 *              packages that should be retrieved.
 * @param       {string}  retrieveTargetDir Required. The root of the directory structure where
 *              the retrieved .zip or metadata files are put.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI's `force:mdapi:retrieve` command to retrieve one or more
 *              metadata packages from the target org.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function fetchMetadataPackages(aliasOrUsername:string, packageNames:string[], retrieveTargetDir:string):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:fetchMetadataPackages`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString =
    `sfdx force:mdapi:retrieve `
  + ` --targetusername ${aliasOrUsername}`
  + ` --packagenames "${packageNames.join('","')}"`
  + (packageNames.length === 1 ? ' --singlepackage' : '')
  + ` --retrievetargetdir ${retrieveTargetDir}`
  + ` --wait 10`
  + ` --loglevel debug`
  + ` --json`;

  // Introduce a small delay in case this is being used by an Observable Listr Task.
  await waitASecond(3);

  // Initialize a UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:fetchMetadataPackages`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'Package Retrieval Failed',
    successMessage: 'Package Retrieval Succeeded',
    mixedMessage:   'Package retrieval failed but the CLI returned a Success Response'
  };

  // Execute the Salesforce CLI Command.
  return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getConnection
 * @param       {string}  orgAlias  Required. The alias of the org to create a connection to.
 * @param       {string}  [apiVersion]  Optional. Expects format `[1-9][0-9].0`, i.e. `42.0`.
 * @returns     {Promise<Connection>} Resolves with an authenticated JSForce `Connection` object.
 * @description Given an SFDX alias, resolves with an authenticated JSForce `Connection` object
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function getConnection(aliasOrUsername:string, apiVersion?:string):Promise<Connection> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:getConnection`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Fetch the username associated with this alias.
  let username:string = await getUsernameFromAlias(aliasOrUsername);

  // If the alias didn't result in a username, assume that aliasOrUsername held a username, not a alias.
  if (typeof username === 'undefined') {
    username = aliasOrUsername;
  }

  // DEBUG
  SfdxFalconDebug.str(`${dbgNsLocal}:username:`, username);

  // Create an AuthInfo object for the username we have.
  const authInfo = await AuthInfo.create({username: username});

  // Create and return a connection to the org attached to the username.
  const connection = await Connection.create({authInfo: authInfo});

  // Set the API version (if specified by the caller).
  if (typeof apiVersion !== 'undefined') {
    SfdxFalconDebug.str(`${dbgNsLocal}:apiVersion:`, apiVersion);
    connection.setApiVersion(apiVersion);
  }

  // The connection is ready for use.
  return connection;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getRecordCountFromResult
 * @param       {SfdxFalconResult}  result  Required. An `SfdxFalconResult` object that should have
 *              a valid block of Salesforce Response JSON in its detail member.
 * @returns     {number}  Returns the value of `totalSize` from the parsed JSON response.
 * @description Given an `SfdxFalconResult`, opens up the result's `detail` member and looks for a
 *              `stdOutParsed` key, then inspects the JSON result, ultimately returning the value
 *              of the `totalSize` key. If this process yields anything that's `NaN`, this function
 *              will throw an Error.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getRecordCountFromResult(result:SfdxFalconResult):number {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:getRecordCountFromResult`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Make sure that the caller passed us an SfdxFalconResult.
  TypeValidator.throwOnInvalidInstance(result, SfdxFalconResult, `${dbgNsLocal}`, `result`);

  // Make sure that the result detail contains a "stdOutParsed" key.
  if (typeof result.detail['stdOutParsed'] !== 'object') {
    throw new SfdxFalconError( `The provided SfdxFalconResult object's details do not contain a 'stdOutParsed' key.`
                             , `InvalidResultDetail`
                             , `${dbgNsLocal}`);
  }

  // Make sure that the "stdOutParsed" detail contains a "result" key.
  if (typeof result.detail['stdOutParsed']['result'] !== 'object') {
    throw new SfdxFalconError( `The provided SfdxFalconResult object's 'stdOutParsed' details do not contain a 'result' key.`
                             , `InvalidResultDetail`
                             , `${dbgNsLocal}`);
  }

  // Make sure that the "stdOutParsed" detail contains a "result" key with a numeric "totalSize" value.
  if (isNaN(result.detail['stdOutParsed']['result']['totalSize'])) {
    throw new SfdxFalconError( `The provided SfdxFalconResult object's 'stdOutParsed' details do not contain a numeric value in the 'result.totalSize' key.`
                             , `InvalidResultDetail`
                             , `${dbgNsLocal}`);
  }

  // If we get here, we can safely return a "totalSize" result.
  return Number(result.detail['stdOutParsed']['result']['totalSize']);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getRecordsFromResult
 * @param       {SfdxFalconResult}  result  Required. An `SfdxFalconResult` object that should have
 *              a valid block of Salesforce Response JSON in its detail member.
 * @returns     {JsonMap[]} Returns the records contained in the result as an array of JsonMaps.
 * @description Given an `SfdxFalconResult`, opens up the result's `detail` member and looks for a
 *              `stdOutParsed` key, then inspects the JSON result, ultimately returning the
 *              `records` array. If this process discovers anything other than a `records` array,
 *              it will throw an Error.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function getRecordsFromResult(result:SfdxFalconResult):JsonMap[] {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:getRecordsFromResult`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Make sure that the caller passed us an SfdxFalconResult.
  TypeValidator.throwOnNullInvalidInstance(result, SfdxFalconResult, `${dbgNsLocal}`, `result`);

  // Make sure that the result detail contains a "stdOutParsed" key.
  TypeValidator.throwOnEmptyNullInvalidObject(result.detail['stdOutParsed'], `${dbgNsLocal}`, `result.detail.stdOutParsed`);

  // Make sure that the "stdOutParsed" detail contains a "result" key.
  TypeValidator.throwOnEmptyNullInvalidObject(result.detail['stdOutParsed']['result'], `${dbgNsLocal}`, `result.detail.stdOutParsed.result`);

  // Make sure that the "stdOutParsed" detail contains a "result" key with a "records" array.
  TypeValidator.throwOnNullInvalidArray(result.detail['stdOutParsed']['result']['records'], `${dbgNsLocal}`, `result.detail.stdOutParsed.result.records`);

  // If we get here, we can safely return the "records" array.
  return result.detail['stdOutParsed']['result']['records'];
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    getUsernameFromAlias
 * @param       {string}  sfdxAlias The local SFDX alias whose Salesforce Username should be found.
 * @returns     {Promise<string>}   Resolves to the username if the alias was found, `null` if not.
 * @description Given an SFDX org alias, return the Salesforce Username associated with the alias
 *              in the local environment the CLI is running in.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function getUsernameFromAlias(sfdxAlias:string):Promise<string> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:getUsernameFromAlias`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Fetch the username from the alias.
  const username = await Aliases.fetch(sfdxAlias);

  // Debug and return.
  SfdxFalconDebug.str(`${dbgNsLocal}:username:`, username);
  return username;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    parseDeployMessages
 * @param       {object[]}  rawDeployMessages Required. Expected to be "raw" JSON that represents an
 *              array of `DeployMessage` objects returned from a call to `force:mdapi:deploy`.
 * @returns     {DeployMessage[]}  The contents of the "raw" deploy result JSON parsed into an array
 *              of solid instances of `DeployMessage` JsonMap objects.
 * @description Given an object variable that should contain the "raw" JSON representing an array of
 *              `DeployMessage` objects resulting from a call to `force:mdapi:deploy`, validates and
 *              parses the contents of each and transforms them into an array of as fleshed-out as
 *              possible instances of a `DeployMessage` JsonMap objects.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function parseDeployMessages(rawDeployMessages:object[]):DeployMessage[] {

  // Define function-local deubg namespace and debug arguments.
  const dbgNsLocal = `${dbgNs}:parseDeployMessages`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate arguments.
  TypeValidator.throwOnNullInvalidArray(rawDeployMessages, `${dbgNsLocal}`, `rawDeployMessages`);

  // Declare an array to hold the parsed deploy messages.
  const deployMessages = [] as DeployMessage[];

  // Iterate over the collection of Raw Deploy Messages.
  try {
    for (const rawDeployMessage of rawDeployMessages) {

      // Make sure we have a valid object.
      TypeValidator.throwOnNullInvalidObject(rawDeployMessage, `${dbgNsLocal}`, `rawDeployMessage`);

      // Create a deep clone of the raw deploy message.
      const deployMessage = cloneDeep(rawDeployMessage) as JsonMap;
      
      // Convert any existing member who should be a boolean.
      convertPropertyToBoolean(deployMessage, 'changed');
      convertPropertyToBoolean(deployMessage, 'created');
      convertPropertyToBoolean(deployMessage, 'deleted');
      convertPropertyToBoolean(deployMessage, 'success');
      
      // Convert any existing member who should be a number.
      convertPropertyToNumber(deployMessage, 'columnNumber');
      convertPropertyToNumber(deployMessage, 'lineNumber');

      // Add the parsed DeployMessage to the array.
      deployMessages.push(deployMessage);
    }
  }
  catch (validationError) {
    throw new SfdxFalconError ( `The object being parsed is not a valid DeployMessage.`
                              , `InvalidDeploymentResult`
                              , `${dbgNsLocal}`
                              , validationError);
  }

  // Send back the parsed array of Deploy Messages.
  return deployMessages;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    parseDeployResult
 * @param       {object}  rawDeployResult Required. Expected to be the "raw" JSON from the `result`
 *              key returned from a call to `force:mdapi:deploy`.
 * @returns     {DeployResult}  The contents of the "raw" deploy result JSON parsed into a solid
 *              instance of a `DeployResult` JsonMap.
 * @description Given an object variable that should contain the "raw" JSON resulting from a call
 *              to `force:mdapi:deploy`, validates and parses the contents into as fleshed-out as
 *              possible an instance of a `DeployResult` JsonMap.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function parseDeployResult(rawDeployResult:object):DeployResult {

  // Define function-local deubg namespace and debug arguments.
  const dbgNsLocal = `${dbgNs}:parseDeployResult`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate arguments.
  TypeValidator.throwOnEmptyNullInvalidObject(rawDeployResult, `${dbgNsLocal}`, `rawDeployResult`);

  // Validate that the RAW DeployResult object has the minimum set of expected fields.
  try {
    TypeValidator.throwOnNullUndefined          (rawDeployResult['checkOnly'],                `${dbgNsLocal}`,  `rawDeployResult.checkOnly`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['createdBy'],                `${dbgNsLocal}`,  `rawDeployResult.createdBy`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['createdByName'],            `${dbgNsLocal}`,  `rawDeployResult.createdByName`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['createdDate'],              `${dbgNsLocal}`,  `rawDeployResult.createdDate`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['done'],                     `${dbgNsLocal}`,  `rawDeployResult.done`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['id'],                       `${dbgNsLocal}`,  `rawDeployResult.id`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['ignoreWarnings'],           `${dbgNsLocal}`,  `rawDeployResult.ignoreWarnings`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberComponentErrors'],    `${dbgNsLocal}`,  `rawDeployResult.numberComponentErrors`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberComponentsDeployed'], `${dbgNsLocal}`,  `rawDeployResult.numberComponentsDeployed`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberComponentsTotal'],    `${dbgNsLocal}`,  `rawDeployResult.numberComponentsTotal`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberTestErrors'],         `${dbgNsLocal}`,  `rawDeployResult.numberTestErrors`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberTestsCompleted'],     `${dbgNsLocal}`,  `rawDeployResult.numberTestsCompleted`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['numberTestsTotal'],         `${dbgNsLocal}`,  `rawDeployResult.numberTestsTotal`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['rollbackOnError'],          `${dbgNsLocal}`,  `rawDeployResult.rollbackOnError`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['runTestsEnabled'],          `${dbgNsLocal}`,  `rawDeployResult.runTestsEnabled`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['startDate'],                `${dbgNsLocal}`,  `rawDeployResult.startDate`);
    TypeValidator.throwOnEmptyNullInvalidString (rawDeployResult['status'],                   `${dbgNsLocal}`,  `rawDeployResult.status`);
    TypeValidator.throwOnNullUndefined          (rawDeployResult['success'],                  `${dbgNsLocal}`,  `rawDeployResult.success`);
  }
  catch (validationError) {
    throw new SfdxFalconError ( `The object being parsed is not a valid DeployResult.`
                              , `InvalidDeploymentResult`
                              , `${dbgNsLocal}`
                              , validationError);
  }

  // Create a deep clone of the raw deploy result.
  const deployResult = cloneDeep(rawDeployResult);

  // Convert any existing member who should be a boolean.
  convertPropertyToBoolean(deployResult, 'checkOnly');
  convertPropertyToBoolean(deployResult, 'done');
  convertPropertyToBoolean(deployResult, 'ignoreWarnings');
  convertPropertyToBoolean(deployResult, 'runTestsEnabled');
  convertPropertyToBoolean(deployResult, 'rollbackOnError');
  convertPropertyToBoolean(deployResult, 'success');

  // Convert any existing member who should be a number.
  convertPropertyToNumber(deployResult, 'numberComponentErrors');
  convertPropertyToNumber(deployResult, 'numberComponentsDeployed');
  convertPropertyToNumber(deployResult, 'numberComponentsTotal');
  convertPropertyToNumber(deployResult, 'numberTestErrors');
  convertPropertyToNumber(deployResult, 'numberTestsCompleted');
  convertPropertyToNumber(deployResult, 'numberTestsTotal');

  // Convert DeployDetails
  if (typeof deployResult['details'] === 'object') {

    // Convert Component Successes and Failures.
    deployResult['details']['componentFailures']  = Array.isArray(deployResult['details']['componentFailures'])   ? parseDeployMessages(deployResult['details']['componentFailures'])   : [];
    deployResult['details']['componentSuccesses'] = Array.isArray(deployResult['details']['componentSuccesses'])  ? parseDeployMessages(deployResult['details']['componentSuccesses'])  : [];

    // Convert Retrieve Results.
    if (typeof deployResult['details']['retrieveResult'] === 'object') {

      // Convert any existing member who should be a boolean.
      convertPropertyToBoolean(deployResult['details']['retrieveResult'], 'done');
      convertPropertyToBoolean(deployResult['details']['retrieveResult'], 'success');

      // Make sure "messages" is an array. If not, make it an empty array.
      if (Array.isArray(deployResult['details']['retrieveResult']['messages']) !== true) {
        deployResult['details']['retrieveResult']['messages'] = [];
      }
    }
    else {
      delete deployResult['details']['retrieveResult'];
    }

    // Convert RunTest Results
    if (typeof deployResult['details']['runTestResult'] === 'object') {

      // Convert any existing member who should be a number.
      convertPropertyToNumber(deployResult['details']['runTestResult'], 'numFailures');
      convertPropertyToNumber(deployResult['details']['runTestResult'], 'numTestsRun');
      convertPropertyToNumber(deployResult['details']['runTestResult'], 'totalTime');

      // TODO: Implement the remaining parsing/processing steps in this section.

      // Process Code Coverage Results...


      // Process Code Coverage Warnings...


      // Process RunTest Failures...


      // Process Flow Coverage Results...


      // Process Flow Coverage Warnings...


      // Process RunTest Successes...

    }
    else {
      delete deployResult['details']['runTestResult'];
    }
  }
  else {
    delete deployResult['details'];
  }

  // Debug the original "raw" DeployResult and the newly parsed one.
  SfdxFalconDebug.obj(`${dbgNsLocal}:rawDeployResult:`,   rawDeployResult);
  SfdxFalconDebug.obj(`${dbgNsLocal}:parsedDeployResult`, deployResult);

  // Send back the parsed DeployResult.
  return deployResult as DeployResult;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    mdapiConvert
 * @param       {string}  mdapiSourceRootDir  Required. ???
 * @param       {string}  sfdxSourceOutputDir Required. ???
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI's `force:mdapi:convert` command to convert MDAPI source to
 *              SFDX source.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function mdapiConvert(mdapiSourceRootDir:string, sfdxSourceOutputDir:string):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:mdapiConvert`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString =
    `sfdx force:mdapi:convert `
  + ` --rootdir ${mdapiSourceRootDir}`
  + ` --outputdir ${sfdxSourceOutputDir}`
  + ` --loglevel debug`
  + ` --json`;

  // Introduce a small delay in case this is being used by an Observable Listr Task.
  await waitASecond(3);

  // Initialize a UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:mdapiConvert`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'MDAPI Source Conversion Failed',
    successMessage: 'MDAPI Source Conversion Succeeded',
    mixedMessage:   'MDAPI Source Conversion failed but the CLI returned a Success Response'
  };

  // Execute the Salesforce CLI Command.
  return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    resolveConnection
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce `Connection` object.
 * @returns     {Promise<ResolvedConnection>}  Resolves with an authenticated JSForce `Connection`.
 * @description Given an Alias/Username or a JSForce `Connection`, returns a valid JSForce `Connection`.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function resolveConnection(aliasOrConnection:AliasOrConnection):Promise<ResolvedConnection> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:resolveConnection`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Input validation
  if (typeof aliasOrConnection !== 'string'
      && (typeof aliasOrConnection === 'object'
          && ((aliasOrConnection as object) instanceof Connection) !== true))  {
    throw new SfdxFalconError( `Expected aliasOrConnection to be a string or Connection Object. Got '${typeof aliasOrConnection}' instead. `
                             , `TypeError`
                             , `${dbgNsLocal}`);
  }
  
  let connection:Connection;
  let orgIdentifier:string;

  // Either get a new connection based on an alias or use one provided to us.
  if (typeof aliasOrConnection === 'string') {
    orgIdentifier = aliasOrConnection;
    connection    = await getConnection(aliasOrConnection);
  }
  else {
    connection    = aliasOrConnection;
    orgIdentifier = connection.getUsername();
  }
  
  // Return a ResolvedConnection object
  return {
    connection: connection,
    orgIdentifier: orgIdentifier
  };
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    retrieveMetadata
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string}  manifestFilePath  Required. Complete path for the manifest file (ie.
 *              `package.xml`) that specifies the components to retrieve.
 * @param       {string}  retrieveTargetDir Required. The root of the directory structure where
 *              the retrieved `.zip` or metadata files are put.
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxShellResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Uses the Salesforce CLI's `force:mdapi:retrieve` command to retrieve the metadata
 *              components specified by the supplied Manifest File (ie. `package.xml`).
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function retrieveMetadata(aliasOrUsername:string, manifestFilePath:string, retrieveTargetDir:string):Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:retrieveMetadata`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString =
    `sfdx force:mdapi:retrieve `
  + ` --targetusername ${aliasOrUsername}`
  + ` --unpackaged "${manifestFilePath}"`
  + ` --retrievetargetdir ${retrieveTargetDir}`
  + ` --wait 10`
  + ` --loglevel debug`
  + ` --json`;

  // Introduce a small delay in case this is being used by an Observable Listr Task.
  await waitASecond(3);

  // Initialize a UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:retrieveMetadata`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'Metadata Retrieval Failed',
    successMessage: 'Metadata Retrieval Succeeded',
    mixedMessage:   'Metadata retrieval failed but the CLI returned a Success Response'
  };

  // Execute the Salesforce CLI Command.
  return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    scanConnectedOrgs
 * @returns     {Promise<SfdxFalconResult>} Uses an `SfdxFalconResult` to return data to the caller
 *              for both RESOLVE and REJECT.
 * @description Calls `force:org:list --all` via an async shell command, then sends the results back
 *              to the caller as an `SfdxFalconResult`.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function scanConnectedOrgs():Promise<SfdxFalconResult> {

  // Define local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}:scanConnectedOrgs`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Set the SFDX Command String to be used by this function.
  const sfdxCommandString = `sfdx force:org:list --all --json`;

  // Initialize an UTILITY Result for this function.
  const utilityResult = new SfdxFalconResult(`sfdx:executeSfdxCommand`, SfdxFalconResultType.UTILITY);
  const utilityResultDetail = {
    sfdxCommandString:  sfdxCommandString,
    stdOutParsed:       null,
    stdOutBuffer:       null,
    stdErrBuffer:       null,
    error:              null
  } as SfdxUtilityResultDetail;
  utilityResult.detail = utilityResultDetail;
  utilityResult.debugResult('Utility Result Initialized', `${dbgNsLocal}:`);

  // Define the success, failure, and "mixed" messages for the SFDX command execution.
  const messages = {
    failureMessage: 'Unable to scan Connected Orgs',
    successMessage: 'Scan Connected Orgs Succeeded',
    mixedMessage:   'Scan Connected Orgs Failed but the CLI Returned a Success Response'
  };

  // Execute the Salesforce CLI Command.
  return executeSfdxCommand(sfdxCommandString, utilityResult, messages);
}
