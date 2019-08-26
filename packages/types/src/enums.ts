//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/types/enums.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Collection of ENUMs used by the SFDX-Falcon Library.
 * @description   Collection of ENUMs used by the SFDX-Falcon Library.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
if (true) {} // NoOp statement. Stops JSDocs from attaching file header comments to the first export, below.

/**
 * Enum. Represents the various CLI log level flag values.
 */
export enum SfdxCliLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO  = 'info',
  WARN  = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Enum. Represents a generic set of commonly used Status values.
 */
export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  WAITING     = 'WAITING',
  WORKING     = 'WORKING',
  COMPLETE    = 'COMPLETE',
  PENDING     = 'PENDING',
  SKIPPED     = 'SKIPPED',
  FAILED      = 'FAILED'
}

/**
 * Enum. Represents the various types/states of a Status Message.
 */
export enum StatusMessageType {
  ERROR   = 'error',
  INFO    = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  FATAL   = 'fatal'
}
