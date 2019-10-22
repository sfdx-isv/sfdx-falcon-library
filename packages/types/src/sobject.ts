//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/types/src/sobject.ts
 * @summary       All types/interfaces that could not be organized into one of the other buckets.
 * @description   All types/interfaces that could not be organized into one of the other buckets.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
if (true) {} // NoOp statement. Stops JSDocs from attaching file header comments to the first export, below.

/**
 * Type. Represents an SObject Record ID.
 */
export type SObjectRecordId = string;

/**
 * Interface. Represents a baseline SObject.
 */
export interface SObject {
  id?:    string;
  name?:  string;
}

/**
 * Interface. Represents the Salesforce Profile SObject.
 */
export type Profile = SObject;

/**
 * Interface. Represents the Salesforce PermissionSetAssignment SObject.
 */
export interface PermissionSetAssignment extends SObject {
  PermissionSetId:  string;
  AssigneeId:       string;
}

/**
 * Interface. Represents the Salesforce User SObject.
 */
export interface User extends SObject {
  username?: UserName;
}

/**
 * Type. Alias for an array of objects that may have "Id" and "Name" properties.
 */
export type SObjectFindResult = Array<{Id?: string; Name?: string; }>;

/**
 * Type. Represents a Salesforce username. Alias for string.
 */
export type UserName = string;
