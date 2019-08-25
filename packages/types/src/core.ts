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
import  {JsonMap} from  '@salesforce/ts-types'; // Why?

/**
 * @module types
 */


/**
 * Type. Represents the constructor for a Class, ie. something that can be the right operand of the instanceof operator.
 */
export type ClassConstructor = any;  // tslint:disable-line: no-any

/**
 * Interface. Allows for specification of a message string and chalk-specific styling information.
 */
export interface StyledMessage extends JsonMap {
  /** Required. The text of the desired message. */
  message:  string;
  /** Required. Chalk styles to be applied to the message. Uses the "tagged template literal" format. */
  styling:  string;
}

