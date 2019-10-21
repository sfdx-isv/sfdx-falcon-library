//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/builder-library/src/tasks/git.ts
 * @summary       Exports a library of Task Builder functions related to Git.
 * @description   Exports a library of Task Builder functions related to Git.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {ListrTask}                 from  'listr';    // Interface. Represents a Task object as defined by Listr.
import  Listr =                     require('listr'); // Provides asynchronous list with status of task completion.
import * as path                    from  'path';     // Node's built-in path library.

// Import SFDX-Falcon Libraries
import  {GitUtil}                   from  '@sfdx-falcon/util';      // Library. Git utility helper functions.
import  {ListrUtil}                 from  '@sfdx-falcon/util';      // Library. Listr utility helper functions.
import  {TypeValidator}             from  '@sfdx-falcon/validator'; // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';           // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';           // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconTask}            from  '@sfdx-falcon/task';            // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.
import  {waitASecond}               from  '@sfdx-falcon/util/lib/async';  // Function. Simple helper function that can be used to introduce a delay when called inside async functions using the "await" keyword.

// Import SFDX-Falcon Types
import  {ExternalContext}           from  '@sfdx-falcon/builder'; // Interface. Collection of key data structures that represent the overall context of the external environment inside of which some a set of specialized logic will be run.
import  {ListrContextFinalizeGit}   from  '@sfdx-falcon/types';   // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
import  {ListrObject}               from  '@sfdx-falcon/types';   // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
import  {ShellExecResult}           from  '@sfdx-falcon/types';   // Interface. Represents the result of a call to shell.execL().

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:builder-library:tasks';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}(git)`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    addGitRemote
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  targetDir Required. Location where the git command will be run
 * @param       {string}  gitRemoteUri  Required. URI of the Git Remote to be added as origin.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that adds the provided Git Remote as the
 *              origin remote.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function addGitRemote(extCtx:ExternalContext, targetDir:string, gitRemoteUri:string):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `addGitRemote`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Adding the Git Remote`,
    statusMsg:  `Adding the Git Remote ${gitRemoteUri} to the local repository`,
    minRuntime: 3,
    showTimer:  false,
    enabled:    () => (typeof targetDir === 'string' && targetDir !== '' && typeof gitRemoteUri === 'string' && gitRemoteUri !== ''),
    skip:  (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
      if (listrContext.gitRemoteIsValid !== true) {
        return 'Git Remote is Invalid';
      }
    },
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      try {
        const shellString = GitUtil.gitRemoteAddOrigin(targetDir, gitRemoteUri);
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellString:`, shellString);
        _taskCtx.gitRemoteAdded = true;

      }
      catch (gitRemoteAddError) {
        _taskCtx.gitRemoteAdded = false;
        throw gitRemoteAddError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    cloneGitRemote
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  gitRemoteUri Required. URI of the remote repository to be cloned.
 * @param       {string}  targetDirectory Required. Directory into which the Git repo will be cloned.
 * @param       {string}  [gitCloneDirectory='']  Required. Name of the Git repo directory. If not
 *              specified will default to the name of the repo.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to clone the Git Repository referred
 *              to by the provided Git Remote URI.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function cloneGitRemote(extCtx:ExternalContext, gitRemoteUri:string, targetDirectory:string, gitCloneDirectory:string=''):ListrObject {

  // Define function-local and external debug namespaces.
  const funcName    = `cloneGitRemote`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnEmptyNullInvalidObject (extCtx,            `${dbgNsExt}`, `extCtx`);
  TypeValidator.throwOnEmptyNullInvalidString (gitRemoteUri,      `${dbgNsExt}`, `gitRemoteUri`);
  TypeValidator.throwOnEmptyNullInvalidString (targetDirectory,   `${dbgNsExt}`, `targetDirectory`);
  TypeValidator.throwOnNullInvalidString      (gitCloneDirectory, `${dbgNsExt}`, `gitCloneDirectory`);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Cloning ${gitRemoteUri}`,
    statusMsg:  `Cloning repository to ${path.join(targetDirectory, gitCloneDirectory)}`,
    minRuntime: 8,
    showTimer:  false,
    enabled:  () => (gitRemoteUri && targetDirectory ? true : false),
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      await waitASecond(5);
      GitUtil.gitClone(gitRemoteUri, targetDirectory, gitCloneDirectory)
      .then(async (shellExecResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellExecResult:`, shellExecResult);
        _taskCtx.gitRemoteCloned = true;
      })
      .catch(async (shellExecError:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellExecError:`, shellExecError);
        _taskCtx.gitRemoteCloned = false;
        throw new SfdxFalconError ( `Could not clone repository: ${shellExecError.message}`
                                  , `GitCloneFailure`
                                  , `${dbgNsExt}`
                                  , SfdxFalconError.wrap(shellExecError));
      });
    }
  });

  // Build and return a Listr Task Object.
  return new Listr(
    // TASK GROUP: Git Clone Tasks
    [
      sfdxFalconTask.build()
    ],
    // TASK GROUP OPTIONS: Git Clone Tasks
    {
      concurrent:   false,
      // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
      collapse:     false,
      exitOnError:  true,
      renderer:     ListrUtil.chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    commitProjectFiles
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  targetDir Required.
 * @param       {string}  commitMessage Required.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that commits whatever is in the Target
 *              Directory, using the commitMessage parameter for the Commit Message.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function commitProjectFiles(extCtx:ExternalContext, targetDir:string, commitMessage:string):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `commitProjectFiles`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Committing Files`,
    statusMsg:  `Committing files with message: '${commitMessage}'`,
    minRuntime: 3,
    showTimer:  false,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      try {
        const shellString = GitUtil.gitCommit(targetDir, commitMessage);
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellString:`, shellString, `shellString: `);
        _taskCtx.projectFilesCommitted = true;
      }
      catch (gitCommitError) {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:gitCommitError:`, gitCommitError);
        _taskCtx.projectFilesCommitted = false;
        _taskObj.skip('Nothing to Commit');
        // NOTE: We will NOT re-throw the error because we want the task to finalize
        // *without* forcing the Subscriber to end with error().
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    finalizeGit
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  targetDir Required. Directory that will be initialized with Git.
 * @param       {string}  [gitRemoteUri]  Optional. URI of the remote that should be associated
 *              with the repository that we're going to initialize.
 * @param       {string}  [gitCommitMsg]  Optional. Message supplied to `-m` arg on `git commit`.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that initializes Git in the Target Directory,
 *              then connects that repo to the remote specified by the Git Remote URI.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function finalizeGit(extCtx:ExternalContext, targetDir:string, gitRemoteUri:string='', gitCommitMsg:string='Initial Commit'):ListrObject {

  // Define function-local and external debug namespaces.
  const funcName    = `finalizeGit`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Make sure the caller provided a Target Directory.
  TypeValidator.throwOnEmptyNullInvalidString(targetDir, `${dbgNsExt}`, `targetDir`);

  // Build and return a Listr Object.
  return new Listr(
    [
      // TASKS: Git Finalization Tasks
      gitRuntimeCheck(extCtx),
      initializeGit(extCtx, targetDir),
      stageProjectFiles(extCtx, targetDir),
      commitProjectFiles(extCtx, targetDir, gitCommitMsg),
      validateGitRemote(extCtx, gitRemoteUri),
      addGitRemote(extCtx, targetDir, gitRemoteUri)
    ],
    {
      // TASK OPTIONS: Git Finalization Tasks
      concurrent:   false,
      // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
      collapse:     false,
      exitOnError:  false,
      renderer:     ListrUtil.chooseListrRenderer()
    }
  ) as ListrObject;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    gitEnvironmentCheck
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  [gitRemoteUri='']  Optional. URI of a Git remote that the calling code
 *              expects to be available for READ access by the default Git user on the local system.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a Listr-compatible Task Object that verifies the presence of the Git
 *              executable in the local environment and checks if a Git Remote is reachable, if
 *              one is provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitEnvironmentCheck(extCtx:ExternalContext, gitRemoteUri:string=''):ListrObject {

  // Define function-local and external debug namespaces.
  const funcName    = `gitEnvironmentCheck`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Build and return a Listr Object.
  return new Listr(
    [
      {
        // PARENT_TASK: (Git Validation/Initialization)
        title:  `Inspecting Environment`,
        task:   () => {
          return new Listr(
            [
              // SUBTASKS: Check for Git executable and for valid Git Remote URI.
              gitRuntimeCheck(extCtx),
              validateCloneableGitRemote(extCtx, gitRemoteUri)
            ],
            {
              // SUBTASK OPTIONS: (Git Init Tasks)
              concurrent:   false,
              // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
              collapse:     true,
              exitOnError:  true,
              renderer:     ListrUtil.chooseListrRenderer()
            }
          );
        }
      }
    ],
    {
      // PARENT_TASK OPTIONS: (Git Validation/Initialization)
      concurrent:   false,
      // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
      collapse:     false,
      exitOnError:  true,
      renderer:     ListrUtil.chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    gitRuntimeCheck
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that verifies the presence of the Git
 *              executable in the local environment.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitRuntimeCheck(extCtx:ExternalContext):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `gitRuntimeCheck`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Looking for Git`,
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      if (GitUtil.isGitInstalled() === true) {
        _taskCtx.gitInstalled = true;
      }
      else {
        _taskCtx.gitInstalled = false;
        throw new SfdxFalconError( 'Git must be installed in your local environment.'
                                 , 'GitNotFound'
                                 , `${dbgNsExt}:task`);
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    initializeGit
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that initializes Git in the target directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function initializeGit(extCtx:ExternalContext, targetDir:string):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `initializeGit`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Initializing Git in Target Directory`,
    statusMsg:  `Running git init in ${targetDir}`,
    minRuntime: 3,
    showTimer:  false,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      try {
        const shellString = GitUtil.gitInit(targetDir);
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellString:`, shellString);
        _taskCtx.gitInitialized = true;
      }
      catch (gitInitError) {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:gitInitError:`, gitInitError);
        _taskCtx.gitInitialized = false;
        throw gitInitError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    stageProjectFiles
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that stages (git -A) ALL files in the target
 *              directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function stageProjectFiles(extCtx:ExternalContext, targetDir:string):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `stageProjectFiles`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Staging Files`,
    statusMsg:  `Staging all new and modified files (git -A) in ${targetDir}`,
    minRuntime: 3,
    showTimer:  false,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      try {
        const shellString = GitUtil.gitAdd(targetDir);
        SfdxFalconDebug.obj(`${dbgNsExt}:task:shellString:`, shellString);
        _taskCtx.projectFilesStaged = true;
      }
      catch (gitAddError) {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:gitAddError:`, gitAddError);
        _taskCtx.projectFilesStaged = false;
        throw gitAddError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateCloneableGitRemote
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  [gitRemoteUri='']  Optional. URI of the remote Git repository that's being
 *              validated for cloning. If a Git Remote URI is not provided, this task will be skipped.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that validates the presence of and read
 *              access to the Git remote at the provided Git Remote URI. If the remote exists but
 *              is empty (and therefore has nothing to clone), throw an error.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateCloneableGitRemote(extCtx:ExternalContext, gitRemoteUri:string=''):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `validateCloneableGitRemote`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Validate incoming arguments.
  TypeValidator.throwOnNullInvalidString(gitRemoteUri, `${dbgNsExt}`, `gitRemoteUri`);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Validating Git Remote`,
    statusMsg:  `Attempting to reach ${gitRemoteUri}`,
    minRuntime: 3,
    showTimer:  false,
    enabled: (_taskCtx:ListrContextFinalizeGit) => (gitRemoteUri && _taskCtx.gitInstalled === true),
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      return GitUtil.checkGitRemoteStatus(gitRemoteUri, 3)
      .then((successResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:successResult:`, successResult);
        _taskCtx.gitRemoteIsValid = true;
      })
      .catch((errorResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:errorResult:`, errorResult);

        // Build the Error.
        let gitRemoteError:SfdxFalconError;
        if (errorResult instanceof Error) {
          gitRemoteError = new SfdxFalconError( `There was a problem with your Git Remote. ${(errorResult.message) ? `${errorResult.message}` : ``}`
                                              , `InvalidGitRemote`
                                              , `${dbgNsExt}:task`
                                              , errorResult);     // We know this is an Error, so use as the CAUSE.
        }
        else {
          gitRemoteError = new SfdxFalconError( `There was a problem with your Git Remote. ${(errorResult.message) ? `${errorResult.message}` : ``}`
                                              , 'InvalidGitRemote'
                                              , `${dbgNsExt}:task`
                                              , null
                                              , errorResult);     // We know this is NOT an Error, so use as the DETAIL.
        }

        // Throw the Error.
        throw gitRemoteError;
      });
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateGitRemote
 * @param       {ExternalContext} extCtx  Required. Defines the context of the external environment
 *              that this function is being called from.
 * @param       {string}  gitRemoteUri
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to re-validate the presence of
 *              a Git Remote at the Git Remote URI provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateGitRemote(extCtx:ExternalContext, gitRemoteUri:string):ListrTask {

  // Define function-local and external debug namespaces.
  const funcName    = `validateGitRemote`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;
  const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;

  // Update the external namespace with the new "External+Function" namespace.
  extCtx.dbgNs = dbgNsExt;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    extCtx:     extCtx,
    title:      `Validating Access to the Git Remote`,
    statusMsg:  `Attempting to reach ${gitRemoteUri}`,
    minRuntime: 3,
    showTimer:  false,
    enabled:() => (typeof gitRemoteUri === 'string' && gitRemoteUri !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
      return GitUtil.checkGitRemoteStatus(gitRemoteUri, 3)
      .then((successResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:successResult:`, successResult);
        _taskCtx.gitRemoteIsValid = true;
      })
      .catch((errorResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsExt}:task:errorResult:`, errorResult);

        // Error code 2 (Git remote reachable but empty) is the ideal state.
        // Consider that a success result.
        if (errorResult.code === 2) {
          _taskCtx.gitRemoteIsValid = true;
          return;
        }

        // Any non-zero error code other than 2 is a failure.
        _taskCtx.gitRemoteIsValid = false;
        _taskObj.title += errorResult.message;
        throw new SfdxFalconError ( `Git Remote is invalid. ${errorResult.message}. `
                                  , `GitRemoteError`
                                  , `${dbgNsExt}:task`);
      });
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}
