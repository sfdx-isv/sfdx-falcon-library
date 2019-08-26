//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/types/core.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Fundamental types that for the core of the larger SFDX-Falcon type library.
 * @description   Fundamental types that for the core of the larger SFDX-Falcon type library.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import  {JsonMap}             from  '@salesforce/ts-types';

// Import Internal Modules/Types
import  {StatusMessageType}   from  './enum';

/**
 * @module types
 */

/**
 * Type. Represents the constructor for a Class, ie. something that can be the right operand of the instanceof operator.
 */
export type ClassConstructor = any;  // tslint:disable-line: no-any

/**
 * Interface. Represents options that determine how a generic interval operates.
 */
export interface IntervalOptions extends JsonMap {
  /** The initial interval, in seconds. */
  initial?:     number;
  /** The amount to increment the interval by, in seconds, each time it completes. */
  incrementBy?: number;
  /** The maximum value, in seconds, that the interval can grow to. */
  maximum?:     number;
  /** The number of seconds before the interval-based operation times-out */
  timeout?:     number;
}

/**
 * Interface. Represents a "state aware" message. Contains a title, a message, and a type.
 */
export interface StatusMessage extends JsonMap {
  /** Required. The title of the status message. */
  title:    string;
  /** Required. The text of the status message. */
  message:  string;
  /** Required. The type of the status message. */
  type:     StatusMessageType;
}

/**
 * Interface. Allows for specification of a message string and chalk-specific styling information.
 */
export interface StyledMessage extends JsonMap {
  /** Required. The text of the desired message. */
  message:  string;
  /** Required. Chalk styles to be applied to the message. Uses the "tagged template literal" format. */
  styling:  string;
}
