//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/validator/src/git.ts
 * @summary       Git validation library.
 * @description   Exports validation functions related to Git.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import SFDX-Falcon Library Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import Internal Libraries
import  * as typeValidator  from  './type'; // Library. Type validation functions.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:validator:git';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Globals
const gitUriRegEx = /(^(git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?$/;


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isGitUriValid
 * @param       {string}  gitRemoteUri  Required.
 * @param       {RegExp}  [acceptedProtocols] Optional.
 * @returns     {boolean} `TRUE` if gitRemoteUri is a syntactically valid Git Remote URI.
 * @description Determines if the URI provided is a syntactically valid Git Remote URI. The
 *              accepted protocols are `ssh:`, `git:`, `http:`, and `https:`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isGitUriValid(gitRemoteUri:string,  acceptedProtocols?:RegExp):boolean {

  // Debug and input validation
  const dbgNsLocal = `${dbgNs}:isGitUriValid`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  typeValidator.throwOnInvalidString(gitRemoteUri, `${dbgNsLocal}`, `gitRemoteUri`);

  // Perform the core RegExp test for valid Git Remote URI.
  if (gitUriRegEx.test(gitRemoteUri)) {
    
    // Git URI was valid.  Check against accepted protocols, if provided.
    if (acceptedProtocols) {
      return (acceptedProtocols.test(gitRemoteUri));
    }
    else {
      return true;
    }
  }

  // If we get here, the Git Remote URI was not valid.
  return false;
}
