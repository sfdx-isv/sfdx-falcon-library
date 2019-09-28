//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/environment/src/sfdx.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Generates a detailed abstraction of the local SFDX Environment, making it easier
 *                to consume SFDX resources in your own code.
 * @description   Generates a detailed abstraction of the local SFDX Environment, making it easier
 *                to consume SFDX resources in your own code.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {Separator}                 from 'inquirer';                    // Separator object to help organize Inquirer Lists.
import  Listr =                     require('listr');                   // Provides asynchronous list with status of task completion.
import  pad =                       require('pad');                     // Provides consistent spacing when trying to align console output.

// Import SFDX-Falcon Libraries
import  {JsForceUtil}               from  '@sfdx-falcon/util';          // Library. Helper functions related to JSForce.
import  {ListrUtil}                 from  '@sfdx-falcon/util';          // Library. Listr utility helper functions.
import  {SfdxUtil}                  from  '@sfdx-falcon/util';          // Library. Helper functions related to SFDX and the Salesforce CLI.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library. Helper functions related to Type Validation.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}          from  '@sfdx-falcon/status';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {SfdxFalconTask}            from  '@sfdx-falcon/task';          // Class. Abstraction of a single Listr Task with a lot of extra functionality bundled in.

// Import SFDX-Falcon Types
import  {SfdxFalconResultType}     from  '@sfdx-falcon/status';  // Enum. Represents the different types of sources where Results might come from.
import  {ExternalContext}          from  '@sfdx-falcon/task';    // Interface. Collection of key data structures that represent the overall context of the external environment inside which an SfdxFalconTask is running.
import  {InquirerChoice}           from  '@sfdx-falcon/types';   // Type. Represents a single "choice" option in an Inquirer multi-choice/multi-select question.
import  {InquirerChoices}          from  '@sfdx-falcon/types';   // Type. Represents an array of Inquirer multi-choice/multi-select questions.
import  {MetadataPackage}          from  '@sfdx-falcon/types';   // Interface. Represents a Metadata Package (033). Can be managed or unmanaged.
import  {MetadataPackageVersion}   from  '@sfdx-falcon/types';   // Interface. Represents a Metadata Package Version (04t).
import  {PackageVersionMap}        from  '@sfdx-falcon/types';   // Type. Alias to a Map with string keys and MetadataPackageVersion values.
import  {QueryResult}              from  '@sfdx-falcon/types';   // Type. Alias to the JSForce definition of QueryResult.
import  {RawStandardOrgInfo}       from  '@sfdx-falcon/types';   // Interface. Represents the standard (ie. non-scratch) org data returned by the sfdx force:org:list command.
import  {RawScratchOrgInfo}        from  '@sfdx-falcon/types';   // Interface. Represents the "scratchOrgs" data returned by the sfdx force:org:list --all command.
import  {UserName}                 from  '@sfdx-falcon/types';   // Type. Represents a Salesforce username. Alias for string.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:environment:sfdx';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Alias for a Map with string keys holding ScratchOrgInfo values.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type ScratchOrgInfoMap = Map<string, ScratchOrgInfo>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the set of options that can be specified while initializing an
 * `SfdxEnvironment` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxEnvironmentOptions {
  /** Defines which elements of the local SFDX Environment must be represented by the initialized `SfdxEnvironment` object. */
  requirements: SfdxEnvironmentRequirements;
  /** The Debug Namespace that should be used within this `SfdxEnvironment` instance */
  dbgNs?:       string;
  /** Determines whether the progress/status of each initialization task is displayed to the user. Defaults to `true`. */
  verbose?:     boolean;
  /** Specifies that all initialization output should be suppressed. Defaults to `false`. */
  silent?:      boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the elements of the local SFDX Environment that are required by the
 * calling code.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxEnvironmentRequirements {
  /** Requires that Standard Orgs (ie. anything that's not a scratch orgs) be processed at initialization. */
  standardOrgs?:      boolean;
  /** Requires that Scratch Orgs be processed at initialization. */
  scratchOrgs?:       boolean;
  /** Requires that DevHub Orgs be processed at initialization. */
  devHubOrgs?:        boolean;
  /** Requires that EnvHub Orgs be processed at initialization. */
  envHubOrgs?:        boolean;
  /** Requires that first-generation Managed Package Orgs be processed at initialization. */
  managedPkgOrgs?:    boolean;
  /** Requires that first-generation Unmanaged Package Orgs be processed at initialization. */
  unmanagedPkgOrgs?:  boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Type. Alias for a Map with string keys holding StandardOrgInfo values.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type StandardOrgInfoMap = Map<string, StandardOrgInfo>;

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the options that can be set when constructing a StandardOrgInfo object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface StandardOrgInfoOptions extends RawStandardOrgInfo {
  metadataPackageResults?:  QueryResult<MetadataPackage>;
}


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ScratchOrgInfo
 * @summary     Stores information about a scratch org that is connected to the local Salesforce CLI.
 * @description This class models a single scratch org that is connected to the local Salesforce CLI.
 *              The information required to contruct a ScratchOrgInfo object can be obtained by a
 *              call to "force:org:list --all".
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ScratchOrgInfo {

  // Public members
  public  readonly  orgId:                string;     // Why?
  public  readonly  username:             string;     // Why?
  public  readonly  alias:                string;     // Why?
  public  readonly  accessToken:          string;     // Why?
  public  readonly  instanceUrl:          string;     // Why?
  public  readonly  loginUrl:             string;     // Why?
  public  readonly  clientId:             string;     // Why?
  public  readonly  createdOrgInstance:   string;     // Why?
  public  readonly  created:              string;     // Wyy?
  public  readonly  devHubUsername:       string;     // Why?
  public  readonly  connectedStatus:      string;     // Why?
  public  readonly  lastUsed:             string;     // Why?
  public  readonly  attributes:           object;     // Why?
  public  readonly  orgName:              string;     // Why?
  public  readonly  status:               string;     // Why?
  public  readonly  createdBy:            string;     // Why?
  public  readonly  createdDate:          string;     // Why?
  public  readonly  expirationDate:       string;     // Why?
  public  readonly  edition:              string;     // Why?
  public  readonly  signupUsername:       string;     // Why?
  public  readonly  devHubOrgId:          string;     // Why?
  public  readonly  isExpired:            boolean;    // Why?

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ScratchOrgInfo
   * @param       {RawScratchOrgInfo}  rawScratchOrgInfo Required.
   * @description Constructs a ScratchOrgInfo object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(rawScratchOrgInfo:RawScratchOrgInfo) {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}:ScratchOrgInfo:constructor:arguments:`, arguments);

    // Make sure the caller passed us an object.
    if (typeof rawScratchOrgInfo !== 'object') {
      throw new SfdxFalconError( `Expected rawScratchOrgInfo to an object but got type '${typeof rawScratchOrgInfo}' instead.`
                              , `TypeError`
                              , `${dbgNs}:ScratchOrgInfo:constructor`);
    }
    
    // Initialize core class members.
    this.orgId              = rawScratchOrgInfo.orgId;
    this.username           = rawScratchOrgInfo.username;
    this.alias              = rawScratchOrgInfo.alias;
    this.accessToken        = rawScratchOrgInfo.accessToken;
    this.instanceUrl        = rawScratchOrgInfo.instanceUrl;
    this.loginUrl           = rawScratchOrgInfo.loginUrl;
    this.clientId           = rawScratchOrgInfo.clientId;
    this.createdOrgInstance = rawScratchOrgInfo.createdOrgInstance;
    this.created            = rawScratchOrgInfo.created;
    this.devHubUsername     = rawScratchOrgInfo.devHubUsername;
    this.connectedStatus    = rawScratchOrgInfo.connectedStatus;
    this.lastUsed           = rawScratchOrgInfo.lastUsed;
    this.attributes         = rawScratchOrgInfo.attributes;
    this.orgName            = rawScratchOrgInfo.orgName;
    this.status             = rawScratchOrgInfo.status;
    this.createdBy          = rawScratchOrgInfo.createdBy;
    this.createdDate        = rawScratchOrgInfo.createdDate;
    this.expirationDate     = rawScratchOrgInfo.expirationDate;
    this.edition            = rawScratchOrgInfo.edition;
    this.signupUsername     = rawScratchOrgInfo.signupUsername;
    this.devHubOrgId        = rawScratchOrgInfo.devHubOrgId;
    this.isExpired          = rawScratchOrgInfo.isExpired;
  
    // If no alias was set, copy the username over as the alias.
    if (typeof this.alias !== 'string' || this.alias.length < 1) {
      this.alias = this.username;
    }
  }
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       StandardOrgInfo
 * @summary     Stores information about a standard (ie. non-scratch) org that is connected to the
 *              local Salesforce CLI.
 * @description This class models a single standard (ie. NON-scratch) org that is connected to the
 *              local Salesforce CLI. The information required to contruct a StandardOrgInfo object
 *              can be obtained by a call to "force:org:list" or "force:org:list --all".
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class StandardOrgInfo {

  // Public members
  public readonly   alias:                    string;                       // Why?
  public readonly   username:                 string;                       // Why?
  public readonly   orgId:                    string;                       // Why?
  public readonly   connectedStatus:          string;                       // Why?

  // Private members
  private           _isDevHub:                boolean;                      // Why?
  private           _isPkgOrg:                boolean;                      // Why?
  private           _isEnvHub:                boolean;                      // Why?
  private           _nsPrefix:                string;                       // Why?
  private           _packages:                MetadataPackage[];            // Why?
  private           _pkgVersionMap:           PackageVersionMap;            // Why?
  private           _metadataPackageResults:  QueryResult<MetadataPackage>; // Why?

  // Accessors
  public get isDevHub():boolean {
    return this._isDevHub ? true : false;
  }
  public get isEnvHub():boolean {
    return this._isEnvHub ? true : false;
  }
  public get isPkgOrg():boolean {
    return this._isPkgOrg ? true : false;
  }
  public get latestManagedBetaPkgVersion():MetadataPackageVersion {
    return this.getLatestPackageVersion(this.managedPkgId, 'Beta');
  }
  public get latestManagedReleasedPkgVersion():MetadataPackageVersion {
    return this.getLatestPackageVersion(this.managedPkgId, 'Released');
  }
  public get managedPkgId():string {
    for (const packageObj of this._packages) {
      if (packageObj.NamespacePrefix) {
        return packageObj.Id;
      }
    }
    return '';
  }
  public get managedPkgName():string {
    for (const packageObj of this._packages) {
      if (packageObj.NamespacePrefix) {
        return packageObj.Name;
      }
    }
    return '';
  }
  public get nsPrefix():string {
    return this._nsPrefix || '';
  }
  public get packages():MetadataPackage[] {
    return this._packages;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  StandardOrgInfo
   * @param       {StandardOrgInfoOptions}  opts Required. Sets initial values.
   * @description Constructs a StandardOrgInfo object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:StandardOrgInfoOptions) {

    // Initialize core class members.
    this.alias              = opts.alias;
    this.username           = opts.username;
    this.orgId              = opts.orgId;
    this.connectedStatus    = opts.connectedStatus;

    // Initialize org identifcation members.
    this._isDevHub          = opts.isDevHub ? true : false;
    this._isPkgOrg          = false;
    this._isEnvHub          = false;

    // Initialize package-related class members.
    this._metadataPackageResults  = opts.metadataPackageResults;
    this._packages                = this.extractPackages(this._metadataPackageResults);
    this._pkgVersionMap           = this.mapPackageVersions(this._packages);

    // If there is at least one member in the packages array, mark this as a Packaging Org.
    this._isPkgOrg = (this._packages.length > 0);

    // If no alias was set, copy the username over as the alias.
    if (typeof this.alias !== 'string' || this.alias.length < 1) {
      this.alias = this.username;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      determineEnvHubStatus
   * @returns     {Promise<boolean}
   * @description Performs a query against this object's related org to find out
   *              if it's an Environment Hub or not.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async determineEnvHubStatus():Promise<boolean> {

    // Check if the aliased user is able to get a describe of the SignupRequest object.
    const signupRequestDescribe = await JsForceUtil.describeSignupRequest(this.alias);

    SfdxFalconDebug.obj(`${dbgNs}:determineEnvHubStatus:signupRequestDescribe:`, signupRequestDescribe);

    // Make sure that SignupRequest is CREATABLE. Anything else means NOT an EnvHub.
    if (signupRequestDescribe.createable === true) {
      this._isEnvHub = true;
    }
    else {
      this._isEnvHub = false;
    }

    // Done! Let the caller know what the answer is.
    return this._isEnvHub;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      determinePkgOrgStatus
   * @returns     {Promise<boolean}
   * @description Performs a query against this object's related org to find out
   *              if it's a Packaging Org or not.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async determinePkgOrgStatus():Promise<boolean> {

    // Don't do anything if we already know this is a packaging org.
    if (this._packages.length > 0) {
      return this._isPkgOrg = true;
    }

    // Run Tooling API query.
    this._metadataPackageResults = await JsForceUtil.getPackages(this.alias);
    SfdxFalconDebug.obj(`${dbgNs}:StandardOrgInfo:determinePkgOrgStatus:_metadataPackageResults:`, this._metadataPackageResults);

    // Extract any packages from the results we just got.
    this._packages = this.extractPackages(this._metadataPackageResults);
    SfdxFalconDebug.obj(`${dbgNs}:StandardOrgInfo:determinePkgOrgStatus:_packages:`, this._packages);

    // Create a Package Version Map.
    this._pkgVersionMap = this.mapPackageVersions(this._packages);
    SfdxFalconDebug.obj(`${dbgNs}:StandardOrgInfo:determinePkgOrgStatus:_pkgVersionMap:`, this._pkgVersionMap);

    // Search the packages for a namespace.
    for (const packageObj of this._packages) {
      if (packageObj.NamespacePrefix) {
        this._nsPrefix = packageObj.NamespacePrefix;
        break;
      }
    }

    // If there is at least one member in the packages array, mark this as a Packaging Org.
    return this._isPkgOrg = (this._packages.length > 0);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getLatestPackageVersion
   * @param       {string}  metadataPackageId  Required. The Metadata Package ID
   *              (033) that the caller wants the latest package version for.
   * @param       {string}  [releaseState]  Optional. The "Release State" (eg.
   *              "Released" or "Beta") that the caller is interested in.
   * @returns     {MetadataPackageVersion}
   * @description Given a Metadata Package ID (033), returns the associated
   *              Metadata Package Version that was most recently uploaded. If
   *              the caller provides a target "Release State", ensure the chosen
   *              package version matches.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public getLatestPackageVersion(metadataPackageId:string, releaseState=''):MetadataPackageVersion {

    // Try to find an array of Package Versions for the provided Metadata Package ID.
    const metadataPackageVersions = this._pkgVersionMap.get(metadataPackageId);

    // If no Metadata Package Versions were found, return NULL.
    if (Array.isArray(metadataPackageVersions) !== true || metadataPackageVersions.length < 1) {
      return null;
    }

    // If the caller didn't specify a Release State to look for, return the first Package Version.
    // The Package Versions should ALREADY be sorted by major, minor, and patch version number
    // in DESCENDING order. The first element in the array is the LAST version uploaded.
    if (! releaseState) {
      return metadataPackageVersions.values[0];
    }

    // Iterate over the Metadata Package Versions till we find one with the RELEASED state.
    for (const metadataPackageVersion of metadataPackageVersions) {
      if (metadataPackageVersion.ReleaseState === releaseState) {
        return metadataPackageVersion;
      }
    }

    // We couldn't find a Package Version matching the caller's criteria. Return NULL.
    return null;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      extractPackages
   * @param       {QueryResult<MetadataPackage>} metadataPackages  Required. The
   *              output of a JSForce Tooling API query.
   * @returns     {MetadataPackage[]}
   * @description Given the results of a JSForce Tooling API query that fetches
   *              the package info from an org, extract the package and package
   *              version records and create a simplified MetadataPackage array.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private extractPackages(metadataPackages:QueryResult<MetadataPackage>):MetadataPackage[] {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}:StandardOrgInfo:extractPackages:arguments:`, arguments);

    // If there isn't a Metadata Package Query Result, return an empty array.
    if (typeof metadataPackages === 'undefined' || Array.isArray(metadataPackages.records) !== true) {
      return [];
    }

    // Initialize a Metadata Package array.
    const packages = new Array<MetadataPackage>();

    // Copy over core information, then extract any Metadata Package Version records.
    for (const metadataPackageRecord of metadataPackages.records) {
      const metadataPackage = {
        Id:                       metadataPackageRecord.Id,
        Name:                     metadataPackageRecord.Name,
        NamespacePrefix:          metadataPackageRecord.NamespacePrefix,
        MetadataPackageVersions:  metadataPackageRecord.MetadataPackageVersions
                                    ?
                                    metadataPackageRecord.MetadataPackageVersions['records'] as MetadataPackageVersion[]
                                    :
                                    [] as MetadataPackageVersion[]
      };

      // Add this to the Packages array.
      packages.push(metadataPackage);
    }

    // All done.
    return packages;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      mapPackageVersions
   * @param       {MetadataPackage[]} packageObjs Required. Array of Metadata
   *              Package objects.
   * @returns     {PackageVersionMap}
   * @description Given an array of MetadataPackage objects, extracts the
   *              Metadata Package Versions from each one and returns a map
   *              whose keys are Metadata Package IDs and whose values are arrays
   *              of MetadataPackageVersion objects sorted by major, minor, and
   *              patch version.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private mapPackageVersions(packageObjs:MetadataPackage[]):PackageVersionMap {

    // Initialize the Package Version Map.
    const pkgVersionMap = new Map<string, MetadataPackageVersion[]>();

    // Iterate over the array of Metadata Package objects.
    for (const packageObj of packageObjs) {

      // If this Package Object does NOT have any Metadata Package Versions, put an empty array and continue.
      if (Array.isArray(packageObj.MetadataPackageVersions) !== true || packageObj.MetadataPackageVersions.length < 1) {
        pkgVersionMap.set(packageObj.Id, [] as MetadataPackageVersion[]);
        continue;
      }

      // Sort the Metadata Package Versions array by version (major, minor, patch - DESC).
      packageObj.MetadataPackageVersions.sort((a, b) => {

        // Make sure we deal only with Numbers.
        const aMajorVersion = Number.isNaN(a.MajorVersion) ? 0 : Number(a.MajorVersion);
        const bMajorVersion = Number.isNaN(b.MajorVersion) ? 0 : Number(b.MajorVersion);

        const aMinorVersion = Number.isNaN(a.MinorVersion) ? 0 : Number(a.MinorVersion);
        const bMinorVersion = Number.isNaN(b.MinorVersion) ? 0 : Number(b.MinorVersion);

        const aPatchVersion = Number.isNaN(a.PatchVersion) ? 0 : Number(a.PatchVersion);
        const bPatchVersion = Number.isNaN(b.PatchVersion) ? 0 : Number(b.PatchVersion);

        // Sorting Result Rules: a<b: return -1; a==b: return 0; a>b: return 1

        // Compare Major Version.
        if (aMajorVersion < bMajorVersion) return -1;
        if (aMajorVersion > bMajorVersion) return 1;

        // Major Versions are equal. Compare Minor Versions.
        if (aMinorVersion < bMinorVersion) return -1;
        if (aMinorVersion > bMinorVersion) return 1;

        // Minor Versions are equal. Compare Patch Versions.
        if (aPatchVersion < bPatchVersion) return -1;
        if (aPatchVersion > bPatchVersion) return 1;

        // Major, Minor, and Patch Versions are all equal.
        return 0;
      });

      // Reverse the array so we get a DESCENDING sort order.
      packageObj.MetadataPackageVersions.reverse();

      // Place the sorted array in the Package Version Map.
      pkgVersionMap.set(packageObj.Id, packageObj.MetadataPackageVersions);
    }

    return pkgVersionMap;
  }
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxEnvironment
 * @description Representation of the local Salesforce DX environment.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxEnvironment {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initialize
   * @param       {SfdxEnvironmentOptions}  opts Required. Options that
   *              determine how the `SfdxEnvironment` object will be initialized.
   * @returns     {Promise<SfdxEnvironment>}
   * @description Given a set of initialization options, instantiates a new
   *              `SfdxEnvironment` object and runs tasks to populate it with
   *              the data specified by the options.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async initialize(opts:SfdxEnvironmentOptions):Promise<SfdxEnvironment> {

    // Define function-local and external debug namespaces.
    const funcName    = `initialize`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = (typeof opts === 'object' && typeof opts.dbgNs === 'string' && opts.dbgNs) ? `${opts.dbgNs}:${funcName}` : `NO_EXTERNAL_DBG_NS`;

    // Reflect incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,               `${dbgNsLocal}`, `SfdxEnvironmentOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.requirements,  `${dbgNsLocal}`, `SfdxEnvironmentOptions.requirements`);

    // Set defaults for all SFDX Environment Requirements, then merge with caller-supplied requirements.
    opts.requirements = {
      standardOrgs:     false,
      scratchOrgs:      false,
      devHubOrgs:       false,
      envHubOrgs:       false,
      managedPkgOrgs:   false,
      unmanagedPkgOrgs: false,
      ...opts.requirements
    };

    // Create an SfdxEnvironment object.
    const sfdxEnv = new SfdxEnvironment(opts);

    // Tell the SfdxEnvironment to create it's tasks.
    sfdxEnv.createInitializationTasks();

    // Run the Initialization Tasks.
    return sfdxEnv.runInitializationTasks()
    .then(() => {
      return sfdxEnv;
    })
    .catch(error => {
      throw error;
    });
  }

  // Public accessors
  public get standardOrgInfos():StandardOrgInfo[]                 { return this._standardOrgInfos; }
  public get scratchOrgInfos():ScratchOrgInfo[]                   { return this._scratchOrgInfos; }
  public get devHubOrgInfos():StandardOrgInfo[]                   { return this._devHubOrgInfos; }
  public get envHubOrgInfos():StandardOrgInfo[]                   { return this._envHubOrgInfos; }
  public get pkgOrgInfos():StandardOrgInfo[]                      { return this._pkgOrgInfos; }
  public get managedPkgOrgInfos():StandardOrgInfo[]               { return this._managedPkgOrgInfos; }
  public get unmanagedPkgOrgInfos():StandardOrgInfo[]             { return this._unmanagedPkgOrgInfos; }
  public get standardOrgInfoMap():Map<UserName, StandardOrgInfo>  { return this._standardOrgInfoMap; }
  public get scratchOrgInfoMap():Map<UserName, ScratchOrgInfo>    { return this._scratchOrgInfoMap; }
  public get standardOrgChoices():InquirerChoices                 { return this._standardOrgChoices; }
  public get scratchOrgChoices():InquirerChoices                  { return this._scratchOrgChoices; }
  public get allOrgChoices():InquirerChoices                      { return this._allOrgChoices; }
  public get devHubChoices():InquirerChoices                      { return this._devHubChoices; }
  public get envHubChoices():InquirerChoices                      { return this._envHubChoices; }
  public get pkgOrgChoices():InquirerChoices                      { return this._pkgOrgChoices; }
  public get managedPkgOrgChoices():InquirerChoices               { return this._managedPkgOrgChoices; }
  public get unmanagedPkgOrgChoices():InquirerChoices             { return this._unmanagedPkgOrgChoices; }

  // Private members.
  private _dbgNs:                   string;                       // Debug Namespace that should be used inside this instance.
  private _envReqs:                 SfdxEnvironmentRequirements;  // Initialization requirements for this SFDX Environment.
  private _verboseTasks:            boolean;                      // Determines whether tasks run in verbose mode.
  private _silentTasks:             boolean;                      // Determines whether tasks run in silent mode.
  private _initializationResult:    SfdxFalconResult;             // Tracks the outcome of the SFDX Environment Initialization process.

  // Initialization Tasks.
  private _initializationTasks:     Listr;                // The runable Listr Object that's used to initialize the SFDX environment.

  // Org Lists
  private _rawStandardOrgInfos:     RawStandardOrgInfo[]; // Array of raw org info for all Standard (ie. non-scratch) Orgs currently connected to the user's CLI.
  private _rawScratchOrgInfos:      RawScratchOrgInfo[];  // Array of raw org info for all Scratch Orgs currently connected to the user's CLI.

  // Org Infos
  private _standardOrgInfos:        StandardOrgInfo[];    // Array of refined org info for all Standard (ie. non-scratch) Orgs currently connected to the user's CLI.
  private _scratchOrgInfos:         ScratchOrgInfo[];     // Array of refined org info for all Scratch Orgs currently connected to the user's CLI.
  private _devHubOrgInfos:          StandardOrgInfo[];    // Array of refined org info for all DevHub Orgs currently connected to the user's CLI.
  private _envHubOrgInfos:          StandardOrgInfo[];    // Array of refined org info for all Environment Hub Orgs currently connected to the user's CLI.
  private _pkgOrgInfos:             StandardOrgInfo[];    // Array of refined org info for all Packaging Orgs (managed & unmanaged) currently connected to the user's CLI.
  private _managedPkgOrgInfos:      StandardOrgInfo[];    // Array of refined org info for all the Managed Packaging Orgs currently connected to the user's CLI.
  private _unmanagedPkgOrgInfos:    StandardOrgInfo[];    // Array of refined org info for all the Unmanaged Packaging Orgs currently connected to the user's CLI.

  // Org Info Maps
  private _standardOrgInfoMap:      Map<UserName, StandardOrgInfo>;
  private _scratchOrgInfoMap:       Map<UserName, ScratchOrgInfo>;

  // Org Choices
  private _standardOrgChoices:      InquirerChoices;  // Array of Inquirer Choices representing ALL Standard (ie. non-scratch) Org aliases/usernames.
  private _scratchOrgChoices:       InquirerChoices;  // Array of Inquirer Choices representing ALL Scratch Org aliases/usernames.
  private _allOrgChoices:           InquirerChoices;  // Array of Inquirer Choices representing ALL Scratch Org aliases/usernames AND Standard Org aliases/usernames.
  private _devHubChoices:           InquirerChoices;  // Array of Inquirer Choices representing DevOrg aliases/usernames.
  private _envHubChoices:           InquirerChoices;  // Array of Inquirer Choices representing EnvHub aliases/usernames.
  private _pkgOrgChoices:           InquirerChoices;  // Array of Inquirer Choices representing ALL Packaging Org aliases/usernames.
  private _managedPkgOrgChoices:    InquirerChoices;  // Array of Inquirer Choices representing MANAGED Packaging Org aliases/usernames.
  private _unmanagedPkgOrgChoices:  InquirerChoices;  // Array of Inquirer Choices representing UNMANAGED Packaging Org aliases/usernames.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxEnvironment
   * @param       {SfdxEnvironmentOptions}  opts Required. Options that
   *              determine how the `SfdxEnvironment` object will be initialized.
   * @description Constructs an `SfdxEnvironment` object.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(opts:SfdxEnvironmentOptions) {

    // Define function-local and external debug namespaces.
    const funcName    = `constructor`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = (typeof opts === 'object' && typeof opts.dbgNs === 'string' && opts.dbgNs) ? `${opts.dbgNs}:${funcName}` : `NO_EXTERNAL_DBG_NS`;

    // Reflect incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,               `${dbgNsLocal}`, `SfdxEnvironmentOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.requirements,  `${dbgNsLocal}`, `SfdxEnvironmentOptions.requirements`);

    // Initialize member variables based on incoming options.
    this._envReqs       = opts.requirements;
    this._dbgNs         = TypeValidator.isNotEmptyNullInvalidString(opts.dbgNs) ? `${opts.dbgNs}` : `NO_EXTERNAL_DBG_NS`;
    this._verboseTasks  = TypeValidator.isNotInvalidBoolean(opts.verbose)       ? opts.verbose  : false;
    this._silentTasks   = TypeValidator.isNotInvalidBoolean(opts.silent)        ? opts.silent   : false;

    // Initialize the Initialization Result.
    this._initializationResult  = new SfdxFalconResult(this._dbgNs, SfdxFalconResultType.INITIALIZER,
                                                      { startNow:       false,
                                                        bubbleError:    false,    // Let the parent Result handle errors (no bubbling)
                                                        bubbleFailure:  false});  // Let the parent Result handle failures (no bubbling)

    // Initialize the Initialization Tasks object to null.
    this._initializationTasks     = null;

    // Initialize Org List Arrays.
    this._rawStandardOrgInfos     = [];
    this._rawScratchOrgInfos      = [];

    // Initialize Org Info Arrays.
    this._standardOrgInfos        = [];
    this._scratchOrgInfos         = [];
    this._devHubOrgInfos          = [];
    this._envHubOrgInfos          = [];
    this._pkgOrgInfos             = [];
    this._managedPkgOrgInfos      = [];
    this._unmanagedPkgOrgInfos    = [];

    // Initialize Org Info Maps.
    this._standardOrgInfoMap      = new Map<UserName, StandardOrgInfo>();
    this._scratchOrgInfoMap       = new Map<UserName, ScratchOrgInfo>();
  
    // Initialize Org Choices.
    this._allOrgChoices           = [];
    this._standardOrgChoices      = [];
    this._scratchOrgChoices       = [];
    this._devHubChoices           = [];
    this._envHubChoices           = [];
    this._pkgOrgChoices           = [];
    this._managedPkgOrgChoices    = [];
    this._unmanagedPkgOrgChoices  = [];
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildAllOrgChoices
   * @returns     {void}
   * @description Takes the list of identified Standard and Scratch Orgs from
   *              `_standardOrgInfos` and `_scratchOrgInfos` and uses them to
   *              create an array of `InquirerChoice` objects which will be
   *              stored in the `_allOrgChoices` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildAllOrgChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildAllOrgChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;
    
    // Build Choices based on all Standard AND Scratch Org Infos, followed by a separator and a "not specified" option.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfos:`, this._standardOrgInfos);
    SfdxFalconDebug.obj(`${dbgNsLocal}:_scratchOrgInfos:`, this._scratchOrgInfos);
    this._allOrgChoices.push(new Separator(`---- Standard Orgs ----`));
    this._allOrgChoices = this.generateOrgChoices(this._standardOrgInfos);
    this._allOrgChoices.push(new Separator(`---- Scratch  Orgs ----`));
    this._allOrgChoices = this.generateOrgChoices(this._scratchOrgInfos);
    this._allOrgChoices.push(new Separator());
    this._allOrgChoices.push({name:'My Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildDevHubChoices
   * @returns     {void}
   * @description Takes the list of identified Dev Hubs in `_devHubOrgInfos`
   *              and uses it to create an array of `InquirerChoice` objects
   *              which will be stored in the `_devHubChoices` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildDevHubChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildDevHubChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Build Choices based on the DevHub Org Infos, followed by a separator and a "not specified" option.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_devHubOrgInfos:`, this._devHubOrgInfos);
    this._devHubChoices = this.generateOrgChoices(this._devHubOrgInfos);
    this._devHubChoices.push(new Separator());
    this._devHubChoices.push({name:'My DevHub Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildEnvHubChoices
   * @returns     {void}
   * @description Takes the list of identified Environment Hubs in `_envHubOrgInfos`
   *              and uses it to create an array of `InquirerChoice` objects
   *              which will be stored in the `_envHubChoices` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildEnvHubChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildEnvHubChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Build Choices based on the EnvHub Org Infos, followed by a separator and a "not specified" option.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_envHubOrgInfos:`, this._envHubOrgInfos);
    this._envHubChoices = this.generateOrgChoices(this._envHubOrgInfos);
    this._envHubChoices.push(new Separator());
    this._envHubChoices.push({name:'My Environment Hub Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildPkgOrgChoices
   * @returns     {void}
   * @description Takes the list of identified Packaging Orgs in `_pkgOrgInfos`
   *              and uses it to create multiple arrays of `InquirerChoice`
   *              objects which will be stored in the `_pkgOrgChoices`,
   *              `_managedPkgOrgChoices`, and `_unmanagedPkgOrgChoices` member
   *              variables.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildPkgOrgChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildPkgOrgChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Build Org Choices for ALL Packaging Orgs.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_pkgOrgInfos:`, this._pkgOrgInfos);
    this._pkgOrgChoices = this.generateOrgChoices(this._pkgOrgInfos);
    this._pkgOrgChoices.push(new Separator());
    this._pkgOrgChoices.push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});

    // Build Org Choices for MANAGED Packaging Orgs.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_managedPkgOrgInfos:`, this._managedPkgOrgInfos);
    this._managedPkgOrgChoices = this.generateOrgChoices(this._managedPkgOrgInfos);
    this._managedPkgOrgChoices.push(new Separator());
    this._managedPkgOrgChoices.push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});

    // Build Org Choices for UNMANAGED Packaging Orgs.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_unmanagedPkgOrgInfos:`, this._unmanagedPkgOrgInfos);
    this._unmanagedPkgOrgChoices = this.generateOrgChoices(this._unmanagedPkgOrgInfos);
    this._unmanagedPkgOrgChoices.push(new Separator());
    this._unmanagedPkgOrgChoices.push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildScratchOrgChoices
   * @returns     {void}
   * @description Takes the list of identified Scratch Orgs in `_scratchOrgInfos`
   *              and uses it to create an array of `InquirerChoice` objects
   *              which will be stored in the `_scratchOrgChoices` member
   *              variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildScratchOrgChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildScratchOrgChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Build Choices based on ALL Scratch Org Infos, followed by a separator and a "not specified" option.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_scratchOrgInfos:`, this._scratchOrgInfos);
    this._scratchOrgChoices = this.generateOrgChoices(this._scratchOrgInfos);
    this._scratchOrgChoices.push(new Separator());
    this._scratchOrgChoices.push({name:'My Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildStandardOrgChoices
   * @returns     {void}
   * @description Takes the list of identified Standard Orgs in `_standardOrgInfos`
   *              and uses it to create an array of `InquirerChoice` objects
   *              which will be stored in the `_standardOrgChoices` member
   *              variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildStandardOrgChoices():void {

    // Define function-local debug namespace.
    const funcName    = `buildStandardOrgChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Build Choices based on ALL Standard Org Infos, followed by a separator and a "not specified" option.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfos:`, this._standardOrgInfos);
    this._standardOrgChoices = this.generateOrgChoices(this._standardOrgInfos);
    this._standardOrgChoices.push(new Separator());
    this._standardOrgChoices.push({name:'My Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified', disabled: false});
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildScratchOrgInfoMap
   * @returns     {void}
   * @description Takes the raw list of Scratch Org Information currently stored
   *              in the `_rawScratchOrgList` member variable and creates a
   *              `ScratchOrgInfo` object for each one, then builds a map of
   *              `ScratchOrgInfo` objects keyed by the `username` of each
   *              Scratch Org.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildScratchOrgInfoMap():void {

    // Define function-local debug namespace.
    const funcName    = `buildScratchOrgInfoMap`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;
  
    // Debug the raw Scratch Org Info array.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_rawScratchOrgInfos:`, this._rawScratchOrgInfos);

    // Iterate over the raw list of orgs to create ScratchOrgInfo objects.
    for (const rawScratchOrgInfo of this._rawScratchOrgInfos) {

      // Only work with orgs that have an ACTIVE status.
      if (rawScratchOrgInfo.status === 'Active') {

        // Create a new ScratchOrgInfo object and add it to the Map using the Username as the key.
        this._scratchOrgInfoMap.set(rawScratchOrgInfo.username, new ScratchOrgInfo(rawScratchOrgInfo));
      }
      else {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${rawScratchOrgInfo.alias}(${rawScratchOrgInfo.username})`, `SCRATCH ORG NOT ACTIVE!`);
      }
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:_scratchOrgInfoMap:`, this._scratchOrgInfoMap);

    // Convert the values from the newly created Scratch Org Info map into an array.
    this._scratchOrgInfos = Array.from(this._scratchOrgInfoMap.values());
    SfdxFalconDebug.obj(`${dbgNsLocal}:_scratchOrgInfos:`, this._scratchOrgInfos);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildStandardOrgInfoMap
   * @returns     {void}
   * @description Takes the raw list of Standard Org Information currently stored
   *              in the `_rawStandardOrgList` member variable and creates a
   *              `StandardOrgInfo` object for each one, then builds a map of
   *              `StandardOrgInfo` objects keyed by the `username` of each
   *              Scratch Org.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildStandardOrgInfoMap():void {

    // Define function-local debug namespace.
    const funcName    = `buildStandardOrgInfoMap`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Debug the raw Standard Org Info array.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_rawStandardOrgInfos:`, this._rawStandardOrgInfos);

    // Iterate over the raw list of orgs to create StandardOrgInfo objects.
    for (const rawStandardOrgInfo of this._rawStandardOrgInfos) {

      // Only work with orgs that have a CONNECTED status.
      if (rawStandardOrgInfo.connectedStatus === 'Connected') {

        // Create a new StandardOrgInfo object and add it to the Map using the Username as the key.
        this._standardOrgInfoMap.set(rawStandardOrgInfo.username, new StandardOrgInfo({
          alias:            rawStandardOrgInfo.alias,
          username:         rawStandardOrgInfo.username,
          orgId:            rawStandardOrgInfo.orgId,
          connectedStatus:  rawStandardOrgInfo.connectedStatus,
          isDevHub:         rawStandardOrgInfo.isDevHub
        }));
      }
      else {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${rawStandardOrgInfo.alias}(${rawStandardOrgInfo.username})`, `ORG NOT CONNECTED!`);
      }
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfoMap:`, this._standardOrgInfoMap);

    // Convert the values from the newly created Standard Org Info map into an array.
    this._standardOrgInfos = Array.from(this._standardOrgInfoMap.values());
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfos:`, this._standardOrgInfos);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createInitializationTasks
   * @param       {boolean} runSilent Required.
   * @param       {boolean} runVerbose  Required.
   * @returns     {void}
   * @description Builds a `ListrObject` with the set of specific sub-tasks that
   *              are needed in order to initialize the `SfdxEnvironment` per
   *              the stated requirements of the logic that called
   *              `SfdxEnvironment.initialize()`. Note that this method only
   *              CREATES the `ListrObject`. It does not call `run()` on them.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createInitializationTasks():void {

    // Define function-local and external debug namespaces.
    const funcName    = `createInitializationTasks`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:sfdxEnvInit`;

    // Initialize an External Context that will be shared by all tasks.
    const extCtx:ExternalContext = {
      dbgNs:        dbgNsExt,
      parentResult: this._initializationResult
    };
    SfdxFalconDebug.obj(`${dbgNsLocal}:extCtx:`, extCtx);

    // Determine if Initialization should happen or not.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_envReqs:`, this._envReqs);
    const doSfdxEnvInit =   this._envReqs.standardOrgs     === true
                        ||  this._envReqs.scratchOrgs      === true
                        ||  this._envReqs.devHubOrgs       === true
                        ||  this._envReqs.envHubOrgs       === true
                        ||  this._envReqs.managedPkgOrgs   === true
                        ||  this._envReqs.unmanagedPkgOrgs === true;
    SfdxFalconDebug.str(`${dbgNsLocal}:doSfdxEnvInit:`, `${doSfdxEnvInit}`);

    //─────────────────────────────────────────────────────────────────────────┐
    // Define the "Scan Connected Orgs" task.
    //─────────────────────────────────────────────────────────────────────────┘
    const scanConnectedOrgs = new SfdxFalconTask({
      extCtx:     extCtx,
      title:      `Scanning Connected Orgs`,
      showTimer:  false,
      enabled:  () => doSfdxEnvInit,
      task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
        const dbgNsTask = `${dbgNsExt}:scanConnectedOrgs`;
        await SfdxUtil.scanConnectedOrgs()
        .then(orgScanResult => {
          SfdxFalconDebug.obj(`${dbgNsTask}:orgScanResult:`, orgScanResult);

          // Extract a list of Standard (ie. non-scratch) orgs from the successResult.
          if (TypeValidator.isNotNullInvalidObject(orgScanResult.detail)) {
            if ((orgScanResult.detail as SfdxUtil.SfdxUtilityResultDetail).stdOutParsed) {
              this._rawStandardOrgInfos = (orgScanResult.detail as SfdxUtil.SfdxUtilityResultDetail).stdOutParsed['result']['nonScratchOrgs'];
            }
          }

          // Extract a list of Scratch (ie. non-scratch) orgs from the successResult.
          if (TypeValidator.isNotNullInvalidObject(orgScanResult.detail)) {
            if ((orgScanResult.detail as SfdxUtil.SfdxUtilityResultDetail).stdOutParsed) {
              this._rawScratchOrgInfos = (orgScanResult.detail as SfdxUtil.SfdxUtilityResultDetail).stdOutParsed['result']['scratchOrgs'];
            }
          }

          // Make sure that there is at least ONE connnected Standard or Scratch org
          if (TypeValidator.isEmptyNullInvalidArray(this._rawStandardOrgInfos) && TypeValidator.isEmptyNullInvalidArray(this._rawScratchOrgInfos)) {
            throw new SfdxFalconError( `No orgs have been authenticated to the Salesforce CLI. `
                                     + `Please run one of the force:auth commands to connect to an org to the CLI.`
                                     , `NoConnectedOrgs`
                                     , `${dbgNsTask}`);
          }

          try {
            // Build maps of Standard and Scratch org infos based on the raw lists.
            this.buildStandardOrgInfoMap();
            this.buildScratchOrgInfoMap();

            // Build Standard, Scratch, and ALL Org Choices.
            this.buildStandardOrgChoices();
            this.buildScratchOrgChoices();
            this.buildAllOrgChoices();
          }
          catch (error) {
            throw new SfdxFalconError ( `Org scan was successful but there was an error during initialization.`
                                      + `${error.message ? ` ${error.message}` : ``}`
                                      , `InitializationError`
                                      , `${dbgNsTask}`
                                      , error);
          }
        })
        .catch(orgScanFailure => {

          // We get here if no connections were found or if there was an initialization error.
          SfdxFalconDebug.obj(`${dbgNsTask}:orgScanFailure:`, orgScanFailure);
          throw orgScanFailure;
        });
      }
    });

    //─────────────────────────────────────────────────────────────────────────┐
    // Define the "Identify Dev Hubs" task.
    //─────────────────────────────────────────────────────────────────────────┘
    const identifyDevHubs = new SfdxFalconTask({
      extCtx:     extCtx,
      title:      `Identifying DevHub Orgs`,
      showTimer:  false,
      enabled:  () => this._envReqs.devHubOrgs,
      task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
        const dbgNsTask = `${dbgNsExt}:identifyDevHubs`;
        await this.identifyDevHubOrgs()
        .then(() => {
          SfdxFalconDebug.obj(`${dbgNsTask}:_devHubOrgInfos:`, this._devHubOrgInfos);
          this.buildDevHubChoices();
        })
        .catch(error => {
          // We normally should NOT get here.
          SfdxFalconDebug.obj(`${dbgNsTask}:error:`, error);
          throw error;
        });
      }
    });

    //─────────────────────────────────────────────────────────────────────────┐
    // Define the "Identify Environment Hubs" task.
    //─────────────────────────────────────────────────────────────────────────┘
    const identifyEnvHubs = new SfdxFalconTask({
      extCtx:     extCtx,
      title:      `Identifying EnvHub Orgs`,
      showTimer:  false,
      enabled:  () => this._envReqs.envHubOrgs,
      task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
        const dbgNsTask = `${dbgNsExt}:identifyEnvHubs`;
        await this.identifyEnvHubOrgs()
        .then(() => {
          SfdxFalconDebug.obj(`${dbgNsTask}:_envHubOrgInfos:`, this._envHubOrgInfos);
          this.buildEnvHubChoices();
        })
        .catch(error => {
          // We normally should NOT get here.
          SfdxFalconDebug.obj(`${dbgNsTask}:error:`, error);
          throw error;
        });
      }
    });

    //─────────────────────────────────────────────────────────────────────────┐
    // Define the "Identify Packaging Orgs" task.
    //─────────────────────────────────────────────────────────────────────────┘
    const identifyPkgOrgs = new SfdxFalconTask({
      extCtx:     extCtx,
      title:      `Identifying Packaging Orgs`,
      showTimer:  false,
      enabled:  () => (this._envReqs.managedPkgOrgs || this._envReqs.unmanagedPkgOrgs),
      task: async (_taskCtx, _taskObj, _taskStatus, _extCtx) => {
        const dbgNsTask = `${dbgNsExt}:identifyPkgOrgs`;
        await this.identifyPkgOrgs()
        .then(() => {
          SfdxFalconDebug.obj(`${dbgNsTask}:_pkgOrgInfos:`, this._pkgOrgInfos);
          this.buildPkgOrgChoices();
        })
        .catch(error => {
          // We normally should NOT get here.
          SfdxFalconDebug.obj(`${dbgNsTask}:error:`, error);
          throw error;
        });
      }
    });

    // Now we need to build the actual ListrTask object.
    this._initializationTasks = new Listr(
      [
        {
          // PARENT_TASK: Local SFDX Configuration
          title: 'Inspecting Local SFDX Configuration',
          enabled:() => doSfdxEnvInit,
          task: () => {
            return new Listr(
              [
                scanConnectedOrgs.build(),
                identifyDevHubs.build(),
                identifyEnvHubs.build(),
                identifyPkgOrgs.build()
              ],
              // SUBTASK OPTIONS: (SFDX Config Tasks)
              {
                concurrent:   false,
                // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
                collapse:     false,
                showSubtasks: false,
                exitOnError:  true,
                renderer:     ListrUtil.chooseListrRenderer(`${this._silentTasks ? `silent` : ``}`)
              }
            );
          }
        }
      ],
      {
        // PARENT_TASK OPTIONS: (Local SFDX Configuration)
        concurrent:   false,
        // @ts-ignore -- Listr doesn't correctly recognize "collapse" as a valid option.
        collapse:     false,
        showSubtasks: this._verboseTasks,
        exitOnError:  true,
        renderer:     ListrUtil.chooseListrRenderer(`${this._silentTasks ? `silent` : ``}`)
      }
    );

    SfdxFalconDebug.msg(`${dbgNsLocal}:status:`, `Creation of Initialization Tasks is complete`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    generateOrgChoice
   * @param       {StandardOrgInfo|ScratchOrgInfo}  orgInfo Required. The
   *              Standard or Scratch Org Info that will be used as the basis
   *              of an Org Alias Choice.
   * @param       {number}  longestAlias  Required.
   * @param       {number}  longestUsername Required.
   * @returns     {InquirerChoice}
   * @description Given either a Standard or Scratch Org Info object, the length
   *              of the longest-expected Alias and the longest-expected
   *              username, returns a Yeoman Choice that will be formatted with
   *              appropriate padding to make multiple choices look aligned
   *              when shown to the user.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private generateOrgChoice(orgInfo:StandardOrgInfo|ScratchOrgInfo, longestAlias:number, longestUsername:number):InquirerChoice {

    // Define function-local debug namespace.
    const funcName    = `generateOrgChoice`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Build an OrgChoice using the YeomanChoice data structure.
    return {
      name:   `${pad(orgInfo.alias, longestAlias)} -- ${pad(orgInfo.username, longestUsername)}${orgInfo['nsPrefix'] ? ' ['+orgInfo['nsPrefix']+']' : ''}`,
      disabled: false,
      value:  orgInfo.username,
      short:  (typeof orgInfo.alias !== 'undefined' && orgInfo.alias !== '')
              ? `${orgInfo.alias} (${orgInfo.username})${orgInfo['nsPrefix'] ? ' ['+orgInfo['nsPrefix']+']' : ''}`  // Use Alias (Username)
              : orgInfo.username + (orgInfo['nsPrefix'] ? '['+orgInfo['nsPrefix']+']' : '')                         // Just use Username
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    generateOrgChoices
   * @param       {StandardOrgInfo[]|ScratchOrgInfo[]}  orgInfos  Required.
   * @returns     {InquirerChoice[]}  Array of `InquirerChoice` objects based
   *              on the provided array of `StandardOrgInfo` or `ScratchOrgInfo`
   *              objects.
   * @description Given an array of `StandardOrgInfo` or `ScratchOrgInfo`
   *              objects, builds a fully formed array of `InquirerChoice`
   *              objects in order to display a list of choices to the user.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private generateOrgChoices(orgInfos:StandardOrgInfo[]|ScratchOrgInfo[]):InquirerChoice[] {

    // Define function-local debug namespace.
    const funcName    = `generateOrgChoices`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnNullInvalidArray(orgInfos, `${dbgNsLocal}`, `orgInfos`);

    // Create local var to build the Inquirer Choice array.
    const orgChoices = [] as InquirerChoice[];

    // Calculate the length of the longest Alias
    let longestAlias = 0;
    for (const orgInfo of orgInfos) {
      if (typeof orgInfo.alias !== 'undefined') {
        longestAlias = Math.max(orgInfo.alias.length, longestAlias);
      }
    }

    // Calculate the length of the longest Username.
    let longestUsername = 0;
    for (const orgInfo of orgInfos) {
      if (typeof orgInfo.username !== 'undefined') {
        longestUsername = Math.max(orgInfo.username.length, longestUsername);
      }
    }

    // Iterate over the array of Org Infos and call generateOrgChoice()
    // and push each one onto the orgAliasChoices array.
    for (const orgInfo of orgInfos) {
      orgChoices.push(this.generateOrgChoice(orgInfo, longestAlias, longestUsername));
    }

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNsLocal}:orgChoices:`, orgChoices);

    // All done.
    return orgChoices;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      identifyDevHubOrgs
   * @returns     {Promise<void>}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to DevHub Orgs, then places them into
   *              the `_devHubOrgInfos` member variable.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async identifyDevHubOrgs():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `identifyDevHubOrgs`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;
  
    // Debug the Standard Org Info map.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfoMap:`, this._standardOrgInfoMap);

    // Iterate over all Standard Org Infos and identify the Developer Hub Orgs.
    for (const standardOrgInfo of this._standardOrgInfoMap.values()) {
      if (standardOrgInfo.isDevHub) {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `DEVELOPER HUB FOUND: `);
        this._devHubOrgInfos.push(standardOrgInfo);
      }
      else {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `NOT A DEVELOPER HUB: `);
      }
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:_devHubOrgInfos:`, this._devHubOrgInfos);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      identifyEnvHubOrgs
   * @returns     {Promise<void>}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to Environment Hub Orgs, then places
   *              them into the `_envHubOrgInfos` member variable.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async identifyEnvHubOrgs():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `identifyEnvHubOrgs`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Debug the Standard Org Info map.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfoMap:`, this._standardOrgInfoMap);

    // Iterate over all Standard Org Infos and identify Environment Hub Orgs.
    for (const standardOrgInfo of this._standardOrgInfoMap.values()) {
      if (await standardOrgInfo.determineEnvHubStatus()) {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `ENVIRONMENT HUB FOUND: `);
        this._envHubOrgInfos.push(standardOrgInfo);
      }
      else {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `NOT AN ENVIRONMENT HUB: `);
      }
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:_envHubOrgInfos:`, this._envHubOrgInfos);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      identifyPkgOrgs
   * @returns     {Promise<void>}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to Packaging Orgs, then places
   *              them into the `_pkgOrgInfos` member variable.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async identifyPkgOrgs():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `identifyPkgOrgs`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Debug the Standard Org Info map.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_standardOrgInfoMap:`, this._standardOrgInfoMap);

    // Iterate over the Org Info list and identify Packaging Orgs.
    for (const standardOrgInfo of this._standardOrgInfoMap.values()) {
      if (await standardOrgInfo.determinePkgOrgStatus()) {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `PACKAGING ORG FOUND: `);
        this._pkgOrgInfos.push(standardOrgInfo);

        // Further categorize this org as either a MANAGED or UNMANAGED packaging org.
        if (standardOrgInfo.nsPrefix) {
          this._managedPkgOrgInfos.push(standardOrgInfo);
          SfdxFalconDebug.str(`${dbgNsLocal}:IsManagedPackageOrg:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `MANAGED PACKAGING ORG FOUND: `);
        }
        else {
          this._unmanagedPkgOrgInfos.push(standardOrgInfo);
          SfdxFalconDebug.str(`${dbgNsLocal}:IsUnmanagedPackageOrg:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `UNMANAGED PACKAGING ORG FOUND: `);
        }
      }
      else {
        SfdxFalconDebug.str(`${dbgNsLocal}:AliasUsername:`, `${standardOrgInfo.alias}(${standardOrgInfo.username})`, `NOT A PACKAGING ORG: `);
      }
    }
    SfdxFalconDebug.obj(`${dbgNsLocal}:_pkgOrgInfos:`, this._pkgOrgInfos);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      runInitializationTasks
   * @returns     {void}
   * @description Runs the `Listr` tasks that were previously created by a call
   *              to `createInitializationTasks()`.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async runInitializationTasks():Promise<void> {

    // Define function-local debug namespace.
    const funcName    = `runInitializationTasks`;
    const dbgNsLocal  = `${this._dbgNs}:${funcName}`;

    // Make sure that there's a Listr object to actually run.
    if ((this._initializationTasks instanceof Listr) !== true) {
      throw new SfdxFalconError ( `The 'buildInitializationTasks()' method must be called before the 'runInitializationTasks()' method.`
                                , `MissingInitialzationTasks`
                                , `${dbgNsLocal}`);
    }

    // Run the tasks.
    SfdxFalconDebug.msg(`${dbgNsLocal}:status:`, `About to run Initialization Tasks`);
    const listrContext = await this._initializationTasks.run();
    SfdxFalconDebug.obj(`${dbgNsLocal}:listrContext:`, listrContext);
  }
}


