//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/task-library/src/git.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a library of pre-defined SFDX-Falcon Tasks.
 * @description   Exports a library of pre-defined SFDX-Falcon Tasks.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {ListrTask}                 from  'listr';    // Interface. Represents a Task object as defined by Listr.
import  Listr =                     require('listr'); // Provides asynchronous list with status of task completion.

// Import SFDX-Falcon Libraries
import  {GitUtil}                   from  '@sfdx-falcon/util';          // Library. Git utility helper functions.
import  {ListrUtil}                 from  '@sfdx-falcon/util';          // Library. Listr utility helper functions.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
import  {ListrContextFinalizeGit}   from  '@sfdx-falcon/types';         // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
import  {ListrObject}               from  '@sfdx-falcon/types';         // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
import  {ShellExecResult}           from  '@sfdx-falcon/types';         // Interface. Represents the result of a call to shell.execL().

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:task-library:git:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    addGitRemote
 * @param       {string}  targetDir Required. Location where the git command will be run
 * @param       {string}  gitRemoteUri  Required. URI of the Git Remote to be added as origin.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that adds the provided Git Remote as the
 *              origin remote.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function addGitRemote(targetDir:string, gitRemoteUri:string):ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}addGitRemote`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
    title:      `Adding the Git Remote...`,
    statusMsg:  `Adding the Git Remote ${gitRemoteUri} to the local repository`,
    minRuntime: 3,
    showTimer:  true,
    enabled:    () => (typeof targetDir === 'string' && targetDir !== '' && typeof gitRemoteUri === 'string' && gitRemoteUri !== ''),
    skip:  (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
      if (listrContext.gitRemoteIsValid !== true) {
        return 'Git Remote is Invalid';
      }
    },
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      try {
        const shellString = GitUtil.gitRemoteAddOrigin(targetDir, gitRemoteUri);
        SfdxFalconDebug.obj(`${dbgNsLocal}:shellString:`, shellString);
        _thisTask.title += 'Done!';
        _listrContext.gitRemoteAdded = true;

      }
      catch (gitRemoteAddError) {
        _thisTask.title += 'Failed';
        _listrContext.gitRemoteAdded = false;
        throw gitRemoteAddError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    commitProjectFiles
 * @param       {string}  targetDir Required.
 * @param       {string}  commitMessage Required.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that commits whatever is in the Target
 *              Directory, using the commitMessage parameter for the Commit Message.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function commitProjectFiles(targetDir:string, commitMessage:string):ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}commitProjectFiles`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
    title:      `Committing Files`,
    statusMsg:  `Committing files with this message: '${commitMessage}'`,
    minRuntime: 3,
    showTimer:  false,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      try {
        const shellString = GitUtil.gitCommit(targetDir, commitMessage);
        SfdxFalconDebug.obj(`${dbgNsLocal}:shellString:`, shellString, `shellString: `);
        _listrContext.projectFilesCommitted = true;
      }
      catch (gitCommitError) {
        SfdxFalconDebug.obj(`${dbgNsLocal}:gitCommitError:`, gitCommitError);
        _listrContext.projectFilesCommitted = false;
        _thisTask.skip('Nothing to Commit');
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
export function finalizeGit(targetDir:string, gitRemoteUri:string='', gitCommitMsg:string='Initial Commit'):ListrObject {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}finalizeGit`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Make sure the caller provided a Target Directory.
  TypeValidator.throwOnEmptyNullInvalidString(targetDir, `${dbgNsLocal}`, `targetDir`);

  // Build and return a Listr Object.
  return new Listr(
    [
      // TASKS: Git Finalization Tasks
      gitRuntimeCheck.call(this),
      initializeGit.call(this, targetDir),
      stageProjectFiles.call(this, targetDir),
      commitProjectFiles.call(this, targetDir, gitCommitMsg),
      reValidateGitRemote.call(this, gitRemoteUri),
      addGitRemote.call(this, targetDir, gitRemoteUri)
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
 * @function    gitRuntimeCheck
 * @param       {string}  dbgNs Required. Debug namespace. Ensures proper debug output.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that verifies the presence of the Git
 *              executable in the local environment.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitRuntimeCheck():ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}gitRuntimeCheck`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
    title:      `Looking for Git`,
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      if (GitUtil.isGitInstalled() === true) {
        _listrContext.gitInstalled = true;
      }
      else {
        _listrContext.gitInstalled = false;
        throw new SfdxFalconError( 'Git must be installed in your local environment.'
                                 , 'GitNotFound'
                                 , `${dbgNs}gitRuntimeCheck`);
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    initializeGit
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that initializes Git in the target directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function initializeGit(targetDir:string):ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}initializeGit`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
    title:      `Initializing Git in Target Directory`,
    statusMsg:  `Running git init in ${targetDir}`,
    minRuntime: 3,
    showTimer:  true,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      try {
        const shellString = GitUtil.gitInit(targetDir);
        SfdxFalconDebug.obj(`${dbgNsLocal}:shellString:`, shellString);
        _listrContext.gitInitialized = true;
      }
      catch (gitInitError) {
        SfdxFalconDebug.obj(`${dbgNsLocal}:gitInitError:`, gitInitError);
        _listrContext.gitInitialized = false;
        throw gitInitError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    reValidateGitRemote
 * @param       {string}  gitRemoteUri
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to re-validate the presence of
 *              a Git Remote at the Git Remote URI provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function reValidateGitRemote(gitRemoteUri:string):ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}reValidateGitRemote`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
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
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      return GitUtil.checkGitRemoteStatus(gitRemoteUri, 3)
      .then((successResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
        _listrContext.gitRemoteIsValid = true;
      })
      .catch((errorResult:ShellExecResult) => {
        SfdxFalconDebug.obj(`${dbgNsLocal}:errorResult:`, errorResult);

        // Error code 2 (Git remote reachable but empty) is the ideal state.
        // Consider that a success result.
        if (errorResult.code === 2) {
          _listrContext.gitRemoteIsValid = true;
          return;
        }

        // Any non-zero error code other than 2 is a failure.
        _listrContext.gitRemoteIsValid = false;
        _thisTask.title += errorResult.message;
        throw new SfdxFalconError ( `Git Remote is invalid. ${errorResult.message}. `
                                  , `GitRemoteError`
                                  , `${dbgNs}reValidateGitRemote`);
      });
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    stageProjectFiles
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that stages (git -A) ALL files in the target
 *              directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function stageProjectFiles(targetDir:string):ListrTask {

  // Define function-local debug namespace and reflect/validate incoming arguments.
  const dbgNsLocal = `${dbgNs}stageProjectFiles`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Define an SfdxFalconTask object.
  const sfdxFalconTask = new SfdxFalconTask({
    ctxExt:     this,
    dbgNsExt:   `${dbgNsLocal}`,
    title:      `Staging Files`,
    statusMsg:  `Staging all new and modified files (git -A) in ${targetDir}`,
    minRuntime: 3,
    showTimer:  true,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task: async (_listrContext, _thisTask, _taskStatus, _sharedData) => {
      try {
        const shellString = GitUtil.gitAdd(targetDir);
        SfdxFalconDebug.obj(`${dbgNsLocal}:shellString:`, shellString);
        _listrContext.projectFilesStaged = true;
      }
      catch (gitAddError) {
        SfdxFalconDebug.obj(`${dbgNsLocal}:gitAddError:`, gitAddError);
        _listrContext.projectFilesStaged = false;
        throw gitAddError;
      }
    }
  });

  // Build the SFDX-Falcon Task to return a Listr Task.
  return sfdxFalconTask.build();
}
