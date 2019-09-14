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
//import  {Aliases}           from  '@salesforce/core';       // Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
//import  {AuthInfo}          from  '@salesforce/core';       // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens. Sets up the refresh flows that jsForce will use to keep tokens active.
//import  {Connection}        from  '@salesforce/core';       // Handles connections and requests to Salesforce Orgs.

// Import SFDX-Falcon Libraries
//import  {AsyncUtil}                 from  '@sfdx-falcon/util';          // Library. Async utility helper functions.
//import  {YeomanUtil}                from  '@sfdx-falcon/util';          // Library. Helper functions and classes related to Yeoman Generators.
import  {JsForceUtil}               from  '@sfdx-falcon/util';          // Library. Helper functions related to JSForce.
import  {TypeValidator}             from  '@sfdx-falcon/validator';     // Library. Helper functions related to Type Validation.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';         // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}           from  '@sfdx-falcon/error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import  {SfdxFalconResult}          from  '@sfdx-falcon/result';        // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".


// Import SFDX-Falcon Types
import  {InquirerChoices}          from  '@sfdx-falcon/types';   // Type. Represents a single "choice" option in an Inquirer multi-choice/multi-select question.
import  {ListrObject}              from  '@sfdx-falcon/types';   // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
import  {MetadataPackage}          from  '@sfdx-falcon/types';   // Interface. Represents a Metadata Package (033). Can be managed or unmanaged.
import  {MetadataPackageVersion}   from  '@sfdx-falcon/types';   // Interface. Represents a Metadata Package Version (04t).
import  {PackageVersionMap}        from  '@sfdx-falcon/types';   // Type. Alias to a Map with string keys and MetadataPackageVersion values.
import  {QueryResult}              from  '@sfdx-falcon/types';   // Type. Alias to the JSForce definition of QueryResult.
import  {RawStandardOrgInfo}       from  '@sfdx-falcon/types';   // Interface. Represents the standard (ie. non-scratch) org data returned by the sfdx force:org:list command.
import  {RawScratchOrgInfo}        from  '@sfdx-falcon/types';   // Interface. Represents the "scratchOrgs" data returned by the sfdx force:org:list --all command.
//import  {SfdxFalconResultType}      from  '@sfdx-falcon/result';  // Enum. Represents the different types of sources where Results might come from.
//import  {ErrorOrResult}             from  '@sfdx-falcon/result';  // Type. Alias to a combination of Error or SfdxFalconResult.

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
  standardOrgs:     boolean;
  /** Requires that Scratch Orgs be processed at initialization. */
  scratchOrgs:      boolean;
  /** Requires that DevHub Orgs be processed at initialization. */
  devHubOrgs:       boolean;
  /** Requires that EnvHub Orgs be processed at initialization. */
  envHubOrgs:       boolean;
  /** Requires that first-generation Managed Package Orgs be processed at initialization. */
  managedPkgOrgs:   boolean;
  /** Requires that first-generation Unmanaged Package Orgs be processed at initialization. */
  unmanagedPkgOrgs: boolean;
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
 * Type. Represents a Salesforce username. Alias for string.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export type UserName = string;

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




    return null;
  }

  // Public accessors
  // TODO: Add accessors as needed
  public abc: string;


  // Private members.
  private _dbgNs:                   string;                       // Debug Namespace that should be used inside this instance.
  private _envReqs:                 SfdxEnvironmentRequirements;  // Initialization requirements for this SFDX Environment.
  private _verboseTasks:            boolean;                      // Determines whether tasks run in verbose mode.
  private _silentTasks:             boolean;                      // Determines whether tasks run in silent mode.

  // Org Lists
  private _rawStandardOrgList:      RawStandardOrgInfo[]; // List of raw org info for all Standard (ie. non-scratch) Orgs currently connected to the user's CLI.
  private _rawScratchOrgList:       RawScratchOrgInfo[];  // List of raw org info for all Scratch Orgs currently connected to the user's CLI.

  // Org Infos
  private _standardOrgInfos:        StandardOrgInfo[];    // List of refined org info for all Standard (ie. non-scratch) Orgs currently connected to the user's CLI.
  private _scratchOrgInfos:         StandardOrgInfo[];    // List of refined org info for all Scratch Orgs currently connected to the user's CLI.
  private _devHubOrgInfos:          StandardOrgInfo[];    // List of refined org info for all DevHub Orgs currently connected to the user's CLI.
  private _envHubOrgInfos:          StandardOrgInfo[];    // List of refined org info for all Environment Hub Orgs currently connected to the user's CLI.
  private _pkgOrgInfos:             StandardOrgInfo[];    // List of refined org info for all Packaging Orgs (managed & unmanaged) currently connected to the user's CLI.
  private _managedPkgOrgInfos:      StandardOrgInfo[];    // List of refined org info for all the Managed Packaging Orgs currently connected to the user's CLI.
  private _unmanagedPkgOrgInfos:    StandardOrgInfo[];    // List of refined org info for all the Unmanaged Packaging Orgs currently connected to the user's CLI.

  // Org Info Maps
  private _standardOrgInfoMap:      Map<UserName, StandardOrgInfo>;
  private _scratchOrgInfoMap:       Map<UserName, ScratchOrgInfo>;

  // Org Choices
  private _standardOrgChoices:      InquirerChoices;  // Array of Inquirer Choices representing ALL Standard (ie. non-scratch) Org aliases/usernames.
  private _scratchOrgChoices:       InquirerChoices;  // Array of Inquirer Choices representing ALL Scratch Org aliases/usernames.
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

    // Initialize Org List Arrays.
    this._rawStandardOrgList      = [];
    this._rawScratchOrgList       = [];

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
   * @method      buildDevHubChoices
   * @returns     {void}
   * @description Takes the list of identified Dev Hubs in `_devHubOrgInfos`
   *              and uses it to create an array of `InquirerChoice` objects
   *              which will be stored in the `_devHubChoices` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildDevHubChoices():void {

    // TODO: Add implementation. See listr-tasks (buildDevHubAliasList) for implementation logic.

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

    // TODO: Add implementation. See listr-tasks (buildEnvHubAliasList) for implementation logic.

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

    // TODO: Add implementation. See listr-tasks (buildPkgOrgAliasList) for implementation logic.

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

    // TODO: Add implementation. See listr-tasks (buildScratchOrgAliasList) for implementation logic.

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

    // TODO: Add implementation. See listr-tasks (buildStandardOrgAliasList) for implementation logic.

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

    // TODO: Add implementation.

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

    // TODO: Add implementation.

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
  private createInitializationTasks(runSilent:boolean, runVerbose:boolean):ListrObject {

    // Define function-local and external debug namespaces.
    const funcName    = `createInitializationTasks`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${extCtx.dbgNs}:${funcName}`;


    // TODO: Add implementation. See list-tasks (sfdxInitTasks) for code.
    return null;

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      identifyDevHubOrgs
   * @returns     {void}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to DevHub Orgs, then places them into
   *              the `_devHubOrgInfos` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private identifyDevHubOrgs():void {

    // TODO: Add implementation.

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      identifyEnvHubOrgs
   * @returns     {void}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to Environment Hub Orgs, then places
   *              them into the `_envHubOrgInfos` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private identifyEnvHubOrgs():void {

    // TODO: Add implementation.

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _identifyPkgOrgs
   * @returns     {void}
   * @description Takes the list of `StandardOrgInfo` objects previously created
   *              by a call to `buildStandardOrgInfoMap()` and finds all the org
   *              connections that point to Packaging Orgs, then places
   *              them into the `_pkgOrgInfos` member variable.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private _identifyPkgOrgs():void {

    // TODO: Add implementation.

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _runInitializationTasks
   * @returns     {void}
   * @description Runs the `Listr` tasks that were previously created by a call
   *              to `createInitializationTasks()`.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async _runInitializationTasks():Promise<void> {

    // TODO: Add implementation.

  }
}
