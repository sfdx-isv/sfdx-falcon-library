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
import  {AnyConstructor}    from  '@sfdx-falcon/types';     // Type. A constructor for any type T. T defaults to object when not explicitly supplied.
import  {JsonMap}           from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:worker';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options that can be passed to the `SfdxFalconWorker` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconWorkerOptions {
  /**
   * Optional. Sets the base debug namespace (`this.dbgNs`) of the class being instantiated. Useful
   * for normalizing the namespace when set by the code that's instantiating an `SfdxFalconWorker`
   * derived class. Defaults to `@sfdx-falcon:worker` if not provided.
   */
  dbgNsExt?:    string;
  /**
   * Optional. Sets an initial value for `this._prepared`. Defaults to `null` if not provided.
   */
  prepared?:    boolean;
  /**
   * Optional. Sets an initial value for `this._reportPath`. Defaults to `null` if not provided.
   */
  reportPath?:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Array of Keys that must be present to consider an object an instance of `SfdxFalconWorker`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
const SFDX_FALCON_WORKER_KEYS = [
  '_prepared',
  '_reportPath',
  '_dbgNs',
  '_generateReport',
  '_prepare',
  'prepared',
  'dbgNs',
  'generateReport',
  'saveReport',
  'isPrepared'
];

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SfdxFalconWorker
 * @summary     Abstract class for building classes that implement task-specific functionality.
 * @description Classes that extend `SfdxFalconWorker` must implement one critical method:
 *              `_generateReport()`.  The idea is that any `Worker` class should be able to be
 *              interrogated for its status at any time.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconWorker {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare<T,O>
   * @param       {AnyConstructor<T>} constructorT  Required. The `constructor`
   *              for a class that's derived from `SfdxFalconWorker`.
   * @param       {O} [opts]  Optional. Options that will be provided to the
   *              `constructorT()` and the resulting object's `_prepare()`
   *              function.
   * @return      {T}
   * @description Returns `true` if the `_prepared` member of a `Worker`
   *              instance is `true` or `null`. Throws an error otherwise.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare<T extends object, O extends object>(constructorT:AnyConstructor<T>, opts?:O):Promise<T> {
   
    // Define the local debug namespace.
    const dbgNsLocal = `${dbgNs}:prepare`;

    // Validate that the caller provided a function for constructorT
    TypeValidator.throwOnNullInvalidFunction(constructorT, `${dbgNsLocal}`, `constructorT`,
      `The first parameter passed to SfdxFalconWorker.prepare() must be the constructor for `+
      `a class derived from SfdxFalconWorker.`, `WorkerPrepError`);

    // If an Options object was provided, make sure it's not null or invalid.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsLocal}`, `WorkerPrepOptions`,
      `When provided, the second parameter passed to SfdxFalconWorker.prepare() must be `+
      `of type'object'.`, `WorkerPrepError`);
    }

    // Instantiate an object of whatever type the constructor is.
    let worker:unknown = null;
    try {
      worker = new constructorT(opts) as unknown;
    }
    catch (constructorError) {
      throw new SfdxFalconError ( `The constructor provided to SfdxFalconWorker.prepare() failed during preparation. ${constructorError.message}`
                                , `WorkerPrepError`
                                , `${dbgNsLocal}`
                                , constructorError);
    }

    // Build an array of keys (properties+methods) from the `worker` argument provided by the caller.
    const workerKeys = ((unknownObj:unknown) => {
      const properties = new Set();
      let   currentObj = unknownObj;
      do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
        currentObj = Object.getPrototypeOf(currentObj);
      } while (currentObj);
      return [...properties.keys()];
    })(worker);

    // Define Error Messages
    const invalidObjErrMsg = `The constructor provided to SfdxFalconWorker.prepare() must create an object that is derived from SfdxFalconWorker.`;

    // Ensure `worker` is an instance of `SfdxFalconWorker` by checking if it has all the required object keys.
    SfdxFalconDebug.obj(`${dbgNsLocal}:SFDX_FALCON_WORKER_KEYS:`, SFDX_FALCON_WORKER_KEYS);
    SfdxFalconDebug.obj(`${dbgNsLocal}:workerKeys:`,              workerKeys);
    for (const sfdxFalconWorkerKey of SFDX_FALCON_WORKER_KEYS) {
      if (workerKeys.includes(sfdxFalconWorkerKey) === false) {
        throw new SfdxFalconError ( `${invalidObjErrMsg}`
                                  , `WorkerPrepError`
                                  , `${dbgNsLocal}`);
      }
    }

    // Make sure certain `worker` keys are functions.
    TypeValidator.throwOnNullInvalidFunction(worker['_generateReport'], `${dbgNsLocal}`, `_generateReport`, `${invalidObjErrMsg}`, `WorkerPrepError`);
    TypeValidator.throwOnNullInvalidFunction(worker['_prepare'],        `${dbgNsLocal}`, `_prepare`,        `${invalidObjErrMsg}`, `WorkerPrepError`);
    TypeValidator.throwOnNullInvalidFunction(worker['generateReport'],  `${dbgNsLocal}`, `generateReport`,  `${invalidObjErrMsg}`, `WorkerPrepError`);
    TypeValidator.throwOnNullInvalidFunction(worker['saveReport'],      `${dbgNsLocal}`, `saveReport`,      `${invalidObjErrMsg}`, `WorkerPrepError`);

    // Call the worker's `_prepare()` method.
    return await (worker as SfdxFalconWorker)._prepare(opts)
    .catch((prepError:Error) => {
      throw new SfdxFalconError ( `Preparation failed. ${prepError.message}`
                                , `WorkerPrepError`
                                , `${dbgNsLocal}`
                                , prepError);
    }) as unknown as T;
  }

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
   * Indicates wheter or not the methods and properties of this instance are ready for use.
   */
  public get prepared() { return this._prepared; }
  /**
   * The debug namespace for this instance. Will always return `@sfdx-falcon:worker`
   * appended by `:` and the name of the derived class, eg. `@sfdx-falcon:worker:MyCustomWorker`.
   */
  public get dbgNs() { return this._dbgNs; }


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconWorker
   * @param       {SfdxFalconWorkerOptions} [opts]  Optional. Allows the caller
   *              to customize how this `SfdxFalconWorker`-derived object is
   *              constructed.
   * @description Constructs an `SfdxFalconWorker` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(opts?:SfdxFalconWorkerOptions) {

    // Define the local and external debug namespaces.
    const funcName          = `constructor`;
    const derivedClassName  = this.constructor.name;
    const dbgNsLocal        = `${dbgNs}:${funcName}`;
    const dbgNsExt          = `${determineDbgNsExt(opts, derivedClassName, dbgNs)}`;

    // Debug the incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // If the caller provided options, make sure it's a valid object.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsExt}:${funcName}`, `SfdxFalconWorkerOptions`);
    }
    else {

      // Caller did not supply options, so initialize to an empty object.
      opts = {};
    }

    // Validate the members of the options object, if provided.
    if (typeof opts.dbgNsExt    !== 'undefined')  TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,   `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerOptions.dbgNsExt`);
    if (typeof opts.reportPath  !== 'undefined')  TypeValidator.throwOnEmptyNullInvalidString (opts.reportPath, `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerOptions.reportPath`);
    if (typeof opts.prepared    !== 'undefined')  TypeValidator.throwOnNullInvalidBoolean     (opts.prepared,   `${dbgNsExt}:${funcName}`,  `SfdxFalconWorkerOptions.prepared`);

    // Initialize member variables.
    this._dbgNs       = `${dbgNsExt}`;
    this._prepared    = (typeof opts.prepared   !== 'undefined') ? opts.prepared    : null;
    this._reportPath  = (typeof opts.reportPath !== 'undefined') ? opts.reportPath  : null;
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
  /**
   * Generates a fully "prepared" version of `this` instance. This method is
   * called by the static method `SfdxFalconWorker.prepare()` when an instance of
   * an `SfdxFalconWorker`-derived object requires asynchronous operations to
   * reach a state where it can be considered fully "prepared" since `constructor`
   * functions can not implement async code.
   */
  protected async abstract _prepare(opts?:object):Promise<SfdxFalconWorker>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns `true` if the `_prepared` member of a `Worker`
   *              instance is `true` or `null`. Throws an error otherwise.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected isPrepared():boolean {

    // Define external debug namespace.
    const dbgNsExt = `${this._dbgNs}:isPrepared`;

    // Check if this instance is explicitly NOT prepared (eg. strict equality for `false`).
    if (this._prepared === false) {
      throw new SfdxFalconError ( `The operation against this ${this.constructor.name} object is not allowed until the instance is prepared.`
                                , `ObjectNotPrepared`
                                , `${dbgNsExt}`);
    }
    else {
      return this._prepared;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDbgNsExt
 * @param       {SfdxFalconWorkerOptions} opts  Required. Options passed to the `SfdxFalconWorker`
 *              constructor.
 * @param       {string}  derivedClassName  Required. Name of the class extending `SfdxFalconWorker`.
 * @param       {string}  dbgNsAlt  Required. Alternative DbgNs to be used if the `opts` argument
 *              did not contain a valid `dbgNsExt` string member.
 * @returns     {string}  The correct External Debug Namespace based on the provided values.
 * @description Given an `SfdxFalconWorkerOptions` object, the name of the derived class, and an
 *              alternative debug namespace to use if the `SfdxFalconWorkerOptions` don't have the
 *              appropriate info, returns the correct External Debug Namespace string.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function determineDbgNsExt(opts:SfdxFalconWorkerOptions, derivedClassName:string, dbgNsAlt:string):string {

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
