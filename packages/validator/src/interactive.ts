//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/validator/src/yeoman.ts
 * @summary       Yeoman generator validation library.
 * @description   Exports validation functions for checking values provided interactively by a user
 *                where sharing a reason why the value is invalid is a critical part of the output.
 *
 *                To do this, all validation functions implemented here return `true` when valid
 *                and a `string` when not, with the `string` indicating why the value supplied
 *                by the user is invalid.
 *
 *                Inquirer-based prompts are going to be the most likely consumers of these
 *                validation functions. All functions implemented here rely on other functions
 *                inside `@sfdx-falcon/validator` for their baseline validation implementations.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import Internal Libraries
import * as core from './core';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    gitRemoteUri
 * @param       {string}  userInput Required.
 * @returns     {boolean|string}  TRUE if input is valid. Error message STRING if invalid.
 * @description Validate that the user-provided string is a properly formed URI for a Git Remote.
 *              Only the syntax of the URI is being checked, not whether the repo exists or not.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitRemoteUri(userInput:string):boolean|string {

  // Make sure we only accept http and https Git Remote URIs.
  const acceptedProtocols = /^(http(s)?)/;

  return  (core.validateGitRemoteUri(userInput, acceptedProtocols)
          || 'Please provide a valid URI (http/https only) for your Git remote');
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    targetPath
 * @param       {string}  userInput Required.
 * @returns     {boolean|string}  TRUE if input is valid. Error message STRING if invalid.
 * @description Validate that the user-provided string is a valid local path, based on the running
 *              user's environment (ie. Mac/PC/Linux)
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function targetPath(userInput:string):boolean|string {
  return  (core.validateLocalPath(userInput)
          || 'Target Directory can not begin with ~, have unescaped spaces, or contain invalid characters (\' \" ` ; & * |)');
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    projectName
 * @param       {string}  userInput Required.
 * @returns     {boolean|string}  TRUE if input is valid. Error message STRING if invalid.
 * @description Validate that the user-provided string is...
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function projectName(userInput:string):boolean|string {
  // - 1 to 50 characters long
  // - Alphanumeric
  const minLength = 1;
  const maxLength = 50;
  return  (core.validateStandardName(userInput.trim(), maxLength)
          ||  `Names must be alphanumeric strings with ${minLength}-${maxLength} characters`);
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    standardAlias
 * @param       {string}  userInput Required.  User input from a Yeoman/Inquirer interview.
 * @returns     {boolean|string}  TRUE if input is valid. Error message STRING if invalid.
 * @description Validate that the user-provided string is 1-15 characters long and includes only
 *              letters (a-Z), numbers (0-9), hyphens (-), and underscores (_).
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function standardAlias(userInput:string):boolean|string {
  // - 1 to 15 characters long
  // - Alphanumeric (a-Z, 0-9) with hyphens and underscore OK
  const minLength = 1;
  const maxLength = 50;
  return  (core.validateStandardAlias(userInput, maxLength)
          ||  `Alias must be ${minLength}-${maxLength} chars long and include only `
            + `letters (a-Z), numbers (0-9), dash (-), and underscore (_)`);
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    standardName
 * @param       {string}  userInput Required.  User input from a Yeoman/Inquirer interview.
 * @returns     {boolean|string}  TRUE if input is valid. Error message STRING if invalid.
 * @description Validate that the user-provided string is less than ?? chars long
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export function standardName(userInput:string):boolean|string {
  // - 1 to 50 characters long
  // - Alphanumeric
  const minLength = 1;
  const maxLength = 50;
  return  (core.validateStandardName(userInput.trim(), maxLength)
          ||  `Names must be alphanumeric strings with ${minLength}-${maxLength} characters`);
}
