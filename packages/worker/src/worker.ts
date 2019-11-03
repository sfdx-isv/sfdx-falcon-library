//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/worker/src/worker.ts
 * @summary       Exports `SfdxFalconWorker`, an abstract class for building classes that implement
 *                task-specific functionality.
 * @description   Exports `SfdxFalconWorker`, an abstract class for building classes that implement
 *                task-specific functionality. **Worker** classes implement a critical method,
 *                `_generateReport()`, which allows the **Worker** class to be interrogated for its
 *                status at any time.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  * as  fse           from  'fs-extra';               // Module that adds a few extra file system methods that aren't included in the native fs module. It is a drop in replacement for fs.

// Import SFDX-Falcon Libraries
import  {TypeValidator}     from  '@sfdx-falcon/validator'; // Library. Collection of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}   from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Types
import  {JsonMap}           from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:worker';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the collective options object for classes derived from `SfdxFalconWorker`.
 *
 * * `constructorOpts`: Used by the `constructor()` method of the derived class
 * * `prepareOpts`: Used by the `_prepare()` method of the derived class
 *
 * Derived classes should define their own Options interface that extends `SfdxFalconWorkerOptions`,
 * then provide this interface as the type parameter `T` when extendeing `SfdxFalconWorker<T>`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconWorkerOptions {
  /**
   * Optional. Used by the `constructor()` method of classes that extend `SfdxFalconWorker`.
   */
  constructorOpts?: {
    [key:string]: unknown;
  };
  /**
   * Optional. Used by the `_prepare()` method of classes that extend `SfdxFalconWorker`.
   */
  prepareOpts?: {
    [key:string]: unknown;
  };
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options that can be passed to the `SfdxFalconWorker` base constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface SfdxFalconWorkerBaseOptions {
  /**
   * Optional. Sets the base debug namespace (`this.dbgNs`) of the class being instantiated. Useful
   * for normalizing the namespace when set by the code that's instantiating an `SfdxFalconWorker`
   * derived class. Defaults to `@sfdx-falcon:worker` if not provided.
   */
  dbgNsExt?:      string;
  /**
   * Optional. Sets an initial value for `this._reportPath`. Defaults to `null` if not provided.
   */
  reportPath?:    string;
  /**
   * Optional. Specifies that this `Worker` requires preparation and should not be used before
   * its `prepare()` method is called.
   */
  requiresPrep?:  boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SfdxFalconWorker
 * @summary     Abstract class for building classes that implement task-specific functionality.
 * @description Classes that extend `SfdxFalconWorker` must implement one critical method:
 *              `_generateReport()`.  The idea is that any `Worker` class should be able to be
 *              interrogated for its status at any time.
 *
 *              Derived classes may also overried the `_prepare()` method to support asynchronous
 *              preparation of a `Worker` instance.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconWorker<T extends SfdxFalconWorkerOptions> {

  /**
   * Determines whether the methods and properties of this instance are ready for use.
   * Useful for Workers that must undergo some sort of `async` setup that's not possible
   * via the `constructor`.
   */
  protected _prepared:  boolean;
  /**
   * Fully resolved filepath where this Worker should write it's report when `saveReport()`
   * is called without passing a value for the `targetFile` parameter.
   */
  protected _reportPath:  string;
  /**
   * The debug namespace for this instance. Set automatically by the constructor in the
   * `SfdxFalconWorker` base class.
   */
  private readonly _dbgNs:  string;
  /**
   * Indicates whether or not this `Worker` requires preparation.
   */
  private readonly _requiresPrep: boolean;
  /**
   * The debug namespace for this instance. Will always return `@sfdx-falcon:worker`
   * appended by `:` and the name of the derived class, eg. `@sfdx-falcon:worker:MyCustomWorker`.
   */
  public get dbgNs():string { return this._dbgNs; }
  /**
   * Indicates wheter or not the methods and properties of this instance are ready for use.
   */
  public get prepared():boolean {
    if (this._requiresPrep !== true) {

      // This worker does not require Preparation, so it's always considered to be "prepared".
      return true;
    }
    else {

      // This worker requires Preparation. Return the current "prepared" state.
      return this._prepared ? true : false;
    }
  }
  /**
   * Indicates whether or not this `Worker` requires preparation.
   */
  public get requiresPrep():boolean { return this._requiresPrep ? true : false; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconWorker
   * @param       {SfdxFalconWorkerBaseOptions} [opts]  Optional. Allows the
   *              caller to customize how this `SfdxFalconWorker`-derived object is
   *              is constructed.
   * @description Constructs an `SfdxFalconWorker` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(opts?:SfdxFalconWorkerBaseOptions) {

    // Define the local and external debug namespaces.
    const funcName          = `constructor`;
    const derivedClassName  = this.constructor.name;
    const dbgNsLocal        = `${dbgNs}:${funcName}`;
    const dbgNsExt          = `${determineDbgNsExt(opts, derivedClassName, dbgNs)}`;

    // Debug the incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    if (dbgNsLocal !== dbgNsExt) SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`, arguments);

    // If the caller provided options, make sure it's a valid object. Otherwise just initialize an empty object.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsExt}:${funcName}`, `SfdxFalconWorkerBaseOptions`);
    }
    else {
      opts = {};
    }

    // Validate the members of the options object, if provided.
    if (typeof opts.dbgNsExt      !== 'undefined')  TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,     `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerBaseOptions.dbgNsExt`);
    if (typeof opts.reportPath    !== 'undefined')  TypeValidator.throwOnEmptyNullInvalidString (opts.reportPath,   `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerBaseOptions.reportPath`);
    if (typeof opts.requiresPrep  !== 'undefined')  TypeValidator.throwOnNullInvalidBoolean     (opts.requiresPrep, `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerBaseOptions.requiresPrep`);

    // Initialize member variables.
    this._dbgNs         = `${dbgNsExt}`;
    this._reportPath    = (typeof opts.reportPath   !== 'undefined') ? opts.reportPath    : null;
    this._requiresPrep  = (typeof opts.requiresPrep !== 'undefined') ? opts.requiresPrep  : null;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {JsonMap} JSON representation this `Worker` object's status.
   * @description Fetches a JSON representation providing details about the
   *              status of the operations performed by this `Worker`.  Will
   *              throw an error if not provided with valid JSON by a call to
   *              `this._generateReport()`.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public generateReport():JsonMap {

    // Use of this method requires that the instance be prepared.
    this.operationRequiresPreparation();

    // Define function-local and external debug namespaces and validate incoming arguments.
    const funcName    = `generateReport`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    
    // Generate the report using the function implemented by the derived class.
    const report = this._generateReport();
    SfdxFalconDebug.obj(`${dbgNsLocal}:report:`,  report);
    SfdxFalconDebug.obj(`${dbgNsExt}:report:`,    report);

    // Make sure a valid object was provided.
    TypeValidator.throwOnNullInvalidObject(report, `${dbgNsExt}`, `the result of this._generateReport()`);
    return report;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {T} [opts]  Optional. If provided, should contain an
   *              `SfdxFalconWorkerOptions` derived object with preparation-specific
   *              options in its `prepareOpts` member. The generic type for this
   *              parameter is supplied by the derived class, providing type
   *              safety for this method in instances of the derived class.
   * @return      {Promise<boolean>}  Returns `true` if preparation succeeded,
   *              `false` or throws an error if not.
   * @description Executes the `_prepare()` method from the dervied class and
   *              returns the result from that method call.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async prepare(opts?:T):Promise<boolean> {

    // Define function-local and external debug namespaces.
    const funcName    = `prepare`;
    const errName     = `PreparationError`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    
    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);
    
    // Check if the caller is trying to prepare an instance that doesn't require it.
    if (this._requiresPrep !== true) {
      throw new SfdxFalconError	( `Workers created by ${this.constructor.name} do not require preparation. `
                                + `The prepare() method can only be called on objects that require preparation.`
                                , `${errName}`
                                , `${dbgNsExt}`);
    }

    // Make sure this Worker has not already been Prepared.
    if (this.prepared) {
      throw new SfdxFalconError	( `This worker has already been prepared. Workers may not `
                                + `be prepared more than once. `
                                , `${errName}`
                                , `${dbgNsExt}`);
    }

    // If provided, Make sure that the `opts` argument is an object AND that it's got some Prepare Options.
    if (TypeValidator.isNotNullUndefined(opts)) {
      TypeValidator.throwOnEmptyNullInvalidObject(opts,	            `${dbgNsExt}`,	`SfdxFalconWorkerOptions`);
      TypeValidator.throwOnEmptyNullInvalidObject(opts.prepareOpts, `${dbgNsExt}`,	`SfdxFalconWorkerOptions.prepareOpts`);
    }
    else {
      opts = {} as T;
    }

    // Prepare this worker using the method implemented by the derived class.
    await this._prepare(opts)
    .then((success:boolean) => {
      if (success === true) {
        this._prepared = true;
      }
      else {
        throw new SfdxFalconError ( `The _prepare() function failed but did not provide specifics.`
                                  , `${errName}`
                                  , `${dbgNsExt}`);
      }
    })
    .catch((preparationError:Error) => {
      this._prepared = false;
      throw new SfdxFalconError	( `Worker Preparation Failed. ${preparationError.message}`
                                  , `${errName}`
                                  , `${dbgNsExt}`
                                  , preparationError);
    });
    
    // Return the final "prepared" state of this Worker.
    SfdxFalconDebug.str(`${dbgNsLocal}:_preared:`,  `${this._prepared}`);
    SfdxFalconDebug.str(`${dbgNsExt}:_prepared:`,   `${this._prepared}`);
    return this._prepared;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [reportPath] Optional.
   * @return      {Promise<JsonMap>}
   * @description Generates a report as a `JsonMap` then writes it to the
   *              local filesystem at the location specified by `this._reportPath`
   *              or the `reportPath` location specified by the caller.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async saveReport(reportPath?:string):Promise<JsonMap> {

    // Use of this method requires that the instance be prepared.
    this.operationRequiresPreparation();

    // Define function-local and external debug namespaces and validate incoming arguments.
    const funcName    = `reportPath`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`, arguments);

    // Default Report Path to `this._reportPath` unless the caller overrides.
    if (TypeValidator.isEmptyNullInvalidString(reportPath)) {
      reportPath = this._reportPath;
    }

    // Make sure the Report Path points to a valid JSON filename.
    TypeValidator.throwOnEmptyNullInvalidString(reportPath, `${dbgNsExt}`, `reportPath`);
    if (reportPath.endsWith('.json') !== true) {
      throw new SfdxFalconError ( `The reportPath must end with the '.json' extension. The path/file '${reportPath}' is invalid.`
                                , `InvalidFileName`
                                , `${dbgNsExt}`);
    }

    // Generate the report.
    const report = this.generateReport();
    SfdxFalconDebug.obj(`${dbgNsLocal}:report:`,  report);
    SfdxFalconDebug.obj(`${dbgNsExt}:report:`,    report);

    // Write the report to the local filesystem.
    await fse.ensureFile(reportPath);
    await fse.writeJson(reportPath, report, {spaces: '\t'});

    // Send the report back to the caller.
    return report;
  }

  /**
   * Generates a `JsonMap` that provides details about the status of the operations
   * performed by this `Worker`.  Must produce valid JSON or an error will be thrown.
   */
  protected abstract _generateReport():JsonMap;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _prepare
   * @param       {T} opts  Required. Custom prepare options proxied to this
   *              method from the public `prepare()` method.
   * @return      {Promise<boolean>}
   * @description **IMPORTANT: Must be overriden by derived class**
   *              Performs the work of "preparing" this worker. Must return
   *              `true` if preparation was successful, `false` (or throw an
   *              error) if not. This method is called by the public method
   *              `prepare()`, which is defined by the base class.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _prepare(_opts:T):Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_prepare`;
    const dbgNsExt  = `${this._dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented.
    throw new SfdxFalconError	( `The ability to prepare this Worker has not been implemented. `
                              + `Please override the _prepare() method in the ${this.constructor.name} `
                              + `class if you'd like to support the use of this feature.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      operationRequiresPreparation
   * @return      {void}
   * @description Throws an error if the intantiated Worker is not prepared.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected operationRequiresPreparation():void {

    // Define external debug namespace.
    const dbgNsExt = `${this._dbgNs}:requiresPreparation`;

    // Check if this instance is explicitly prepared (eg. strict inequality for `true`).
    if (this.prepared !== true) {
      throw new SfdxFalconError ( `The operation against this ${this.constructor.name} worker object is not allowed until the instance is prepared.`
                                , `WorkerNotPrepared`
                                , `${dbgNsExt}`);
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDbgNsExt
 * @param       {SfdxFalconWorkerBaseOptions} opts  Required. Options passed to the `SfdxFalconWorker`
 *              constructor.
 * @param       {string}  derivedClassName  Required. Name of the class extending `SfdxFalconWorker`.
 * @param       {string}  dbgNsAlt  Required. Alternative DbgNs to be used if the `opts` argument
 *              did not contain a valid `dbgNsExt` string member.
 * @returns     {string}  The correct External Debug Namespace based on the provided values.
 * @description Given an `SfdxFalconWorkerBaseOptions` object, the name of the derived class, and an
 *              alternative debug namespace to use if the `SfdxFalconWorkerBaseOptions` don't have
 *              the appropriate info, returns the correct External Debug Namespace string.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function determineDbgNsExt(opts:SfdxFalconWorkerBaseOptions, derivedClassName:string, dbgNsAlt:string):string {

  // Define local debug namespace.
  const dbgNsLocal = `${dbgNs}:determineDbgNsExt`;

  // Validate arguments.
  TypeValidator.throwOnEmptyNullInvalidString(derivedClassName, `${dbgNsLocal}`,  `derivedClassName`);
  TypeValidator.throwOnEmptyNullInvalidString(dbgNsAlt,         `${dbgNsLocal}`,  `dbgNsAlt`);

  // Construct the appropriate External Debug Namespace.
  const dbgNsExt =  (TypeValidator.isNotEmptyNullInvalidObject(opts) && TypeValidator.isNotEmptyNullInvalidString(opts.dbgNsExt))
                    ? `${opts.dbgNsExt}:${derivedClassName}`
                    : dbgNsAlt;
  SfdxFalconDebug.str(`${dbgNsLocal}:dbgNsExt:`, dbgNsExt);
  return dbgNsExt;
}
