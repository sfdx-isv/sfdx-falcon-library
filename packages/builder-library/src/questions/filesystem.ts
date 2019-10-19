//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder-library/src/questions/filesystem.ts
 * @summary       Exports `Builder` classes for filesystem related questions.
 * @description   Exports `Builder` classes for filesystem related questions.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  * as  fse       from  'fs-extra';               // Module that adds a few extra file system methods that aren't included in the native fs module. It is a drop in replacement for fs.
import  * as  path      from  'path';                   // Node's built-in path library.

// Import SFDX-Falcon Libraries
import  {TypeValidator} from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {InterviewQuestionsBuilder}         from  '@sfdx-falcon/builder'; // Class. Classes derived from QuestionsBuilder can be used to build an Inquirer Questions object.
import  {SfdxFalconDebug}                   from  '@sfdx-falcon/debug';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconPrompt}                  from  '@sfdx-falcon/prompt';  // Class. Allows easy creation of Inquirer prompts that have a "confirmation" question that can be used to restart collection of the information.
//import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
//import  {ExternalContext}                   from  '@sfdx-falcon/builder'; // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {InterviewQuestionsBuilderOptions}  from  '@sfdx-falcon/builder'; // Interface. Baseline structure for the options object that should be provided to the constructor of any class that extends InterviewQuestionsBuilder.
import  {JsonMap}                           from  '@sfdx-falcon/types';   // Interface. Any JSON-compatible object.
import  {InquirerValidateFunction}          from  '@sfdx-falcon/types';   // Type. Represents the function signature for an Inquirer validate() function.
import  {Questions}                         from  '@sfdx-falcon/types';   // Type. Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:questions';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(filesystem)`);



//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 *  Interface. Specifies options for the `ProvideBaseDirectory` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ProvideBaseDirectoryOptions extends InterviewQuestionsBuilderOptions {
  fileOrDirName:        string;
  validateFunction?:    InquirerValidateFunction;
  msgStrings: {
    promptProvidePath?: string,
    errorNotFound?:     string
  };
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ProvideBaseDirectory
 * @extends     InterviewQuestionsBuilder
 * @summary     Interview Questions Builder for providing a "base directory" (ie. a directory that
 *              is expected to contain a specific file or directory).
 * @description Interview Questions Builder for providing a "base directory" (ie. a directory that
 *              is expected to contain a specific file or directory).
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ProvideBaseDirectory extends InterviewQuestionsBuilder {

  public promptProvidePath: string;
  public errorNotFound:     string;
  public fileOrDirName:     string;
  public validateFunction:  InquirerValidateFunction;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ProvideBaseDirectory
   * @param       {ProvideBaseDirectoryOptions} opts  Required.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ProvideBaseDirectoryOptions) {

    // Call the superclass constructor.
    super(opts);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate required options.
    TypeValidator.throwOnEmptyNullInvalidString (opts.fileOrDirName, `${dbgNS.ext}`, `fileOrDirName`);

    // Validate optional options.
    if (opts.msgStrings.promptProvidePath)  TypeValidator.throwOnEmptyNullInvalidString (opts.msgStrings.promptProvidePath, `${dbgNS.ext}`,  `msgStrings.promptProvidePath`);
    if (opts.msgStrings.errorNotFound)      TypeValidator.throwOnEmptyNullInvalidString (opts.msgStrings.errorNotFound,     `${dbgNS.ext}`,  `msgStrings.errorNotFound`);
    if (opts.validateFunction)              TypeValidator.throwOnInvalidFunction        (opts.validateFunction,             `${dbgNS.ext}`,  `validateFunction`);
    
    // Initialize member variables.
    this.fileOrDirName      = opts.fileOrDirName;
    this.validateFunction   = opts.validateFunction             ||  null;
    this.promptProvidePath  = opts.msgStrings.promptProvidePath ||  `Path to the directory containing ${this.fileOrDirName}?`;
    this.errorNotFound      = opts.msgStrings.errorNotFound     ||  `Specified directory does not contain '${this.fileOrDirName}'`;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {Questions}
   * @description Builds the Interview Questions.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build(buildCtx:SfdxFalconPrompt<JsonMap>):Questions {

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `build`, arguments);

    // Validate the Build Context.
    TypeValidator.throwOnInvalidInstance  (buildCtx, SfdxFalconPrompt,            `${dbgNS.ext}`, `BuildContext`);
    TypeValidator.throwOnNullInvalidString(buildCtx.defaultAnswers.baseDirectory, `${dbgNS.ext}`, `BuildContext.defaultAnswers.baseDirectory`);

    return [
      {
        type:     'input',
        name:     'baseDirectory',
        message:  this.promptProvidePath,
        default:  ( typeof buildCtx.userAnswers.baseDirectory !== 'undefined' )
                  ? buildCtx.userAnswers.baseDirectory      // Current Value
                  : buildCtx.defaultAnswers.baseDirectory,  // Default Value
        filter:   filterLocalPath,                          // Returns a Resolved path
        when:     true,                                     // Always show this question
        validate: async userInput => {
  
          // Check if a path to the specified file or directory exists when combined with the user's input.
          const completePath  = path.join(userInput, this.fileOrDirName);
          const pathExists    = await fse.pathExists(completePath)
          .catch(pathExistsError => {
            SfdxFalconDebug.obj(`${dbgNS.ext}:baseDirectory:validate:pathExistsError:`, pathExistsError);
            return null;
          });
  
          // If the Complete Path does not exist, return an error message.
          if (pathExists !== true) {
            return this.errorNotFound;
          }

          // If the caller specified a validate function, run it and return the results.
          if (this.validateFunction) {
            return await this.validateFunction(completePath);
          }

          // If we get here, all validation checks passed. Return TRUE.
          return true;
        }
      }
    ];
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    filterLocalPath
 * @param       {string}  localPath Required.
 * @returns     {string}  A resolved version of the path string provided by `localPath`.
 * @description Filter function which takes a local Path value and resolves it by using
 *              path.resolve(), and then returns that value.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function filterLocalPath(localPath:string):string {

  // Define local debug namespace and debug arguments.
  const funcName    = `filterLocalPath`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate the incoming arguments.
  TypeValidator.throwOnNullInvalidString(localPath, `${dbgNsLocal}`, `localPath`);

  // Return a resolved version of localPath.
  return path.resolve(localPath);
}
