//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/validator/src/type.ts
 * @summary       Type validation library. Useful for validating incoming arguments inside functions.
 * @description   Exports basic validation functions for ensuring a variable has the expected type
 *                and/or meets certain basic requirements like not empty, not `null`, etc.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import * as fse             from  'fs-extra';             // Extended set of File System utils.
import  {isEmpty}           from  'lodash';               // Useful function for detecting empty objects.

// Import SFDX-Falcon Library Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug';   // Class. Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}   from  '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Library Types
import  {AnyConstructor}    from  '@sfdx-falcon/types';   // Type. A constructor for any type T. T defaults to object when not explicitly supplied.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:validator:type';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, `null`, or invalid `array`
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, `null`, or invalid `array` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidArray(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null, non-empty array${Array.isArray(arg) !== true ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidObject
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, `null`, or invalid `object`
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, `null`, or invalid `object` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidObject(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null, non-empty object${typeof arg !== 'object' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgEmptyNullInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an empty, `null`, or invalid `string`
 *              was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an empty, `null`, or invalid `string` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgEmptyNullInvalidString(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null, non-empty string${typeof arg !== 'string' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `array` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `array` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidArray(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be an array but got type '${typeof arg}' instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidBoolean
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `boolean` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `boolean` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidBoolean(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a boolean but got type '${typeof arg}' instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidFunction
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `function` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `function` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidFunction(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a function but got type '${typeof arg}' instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidInstance
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument was tested against.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an `object` that is not an
 *              `instance of` the expected class.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an `object` that is not an `instance of` the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidInstance(arg:unknown, classConstructor:AnyConstructor, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  // Figure out the name of the Expected Instance.
  let expectedInstanceOf = 'unknown';
  if (typeof classConstructor !== 'undefined' && classConstructor !== null) {
    if (classConstructor.constructor) {
      expectedInstanceOf = classConstructor.constructor.name;
    }
  }
  // Figure out the name of the Actual Instance.
  let actualInstanceOf = '';
  if (typeof arg !== 'undefined' && arg !== null) {
    if (typeof arg === 'object' && arg.constructor) {
      actualInstanceOf = arg.constructor.name;
    }
    else {
      actualInstanceOf = `${typeof arg}`;
    }
  }
  // Build and return the Error Message.
  return `Expected ${argName} to be an instance of '${expectedInstanceOf}'`
       + (actualInstanceOf ? ` but got an instance of '${actualInstanceOf}' instead` : ``)
       + `.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidNumber
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `number` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `number` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidNumber(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a valid number${typeof arg !== 'number' ? ` but got type '${typeof arg}' instead` : `${isNaN(arg) ? ` but got 'NaN' instead` : ``}` }.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidObject
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `object` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `object` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidObject(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be an object but got type '${typeof arg}' instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting an invalid `string` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting an invalid `string` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgInvalidString(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a string but got type '${typeof arg}' instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNonReadablePath
 * @param       {string}  path  Required. The path involved in the Error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a non-readable path was provided.
 * @description Given a path and the name of an argument associated with that path, returns a
 *              standardized error message reporting a non-existant or inaccessible path.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNonReadablePath(path:string, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = '';
  }
  return  ( argName ? `Expected ${argName} to reference a readable path, but ` : `` )
          + `'${path}' does not exist or is not accessible by the currently running user.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidArray
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `array` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `array` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidArray(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null array${Array.isArray(arg) !== true ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidBoolean
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `boolean` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `boolean` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidBoolean(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null boolean${typeof arg !== 'boolean' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidFunction
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `function` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `function` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidFunction(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null function${typeof arg !== 'function' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidInstance
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument was tested against.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` object or an `object` that
 *              is not an `instance of` the expected class.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` object or an `object` that is not an `instance of` the
 *              expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidInstance(arg:unknown, classConstructor:AnyConstructor, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  // Figure out the name of the Expected Instance.
  let expectedInstanceOf = 'unknown';
  if (typeof classConstructor !== 'undefined' && classConstructor !== null) {
    if (classConstructor.prototype && classConstructor.prototype.constructor) {
      expectedInstanceOf = classConstructor.prototype.constructor.name;
    }
  }
  // Figure out the name of the Actual Instance.
  let actualInstanceOf = '';
  if (typeof arg !== 'undefined' && arg !== null) {
    if (typeof arg === 'object' && arg.constructor) {
      actualInstanceOf = arg.constructor.name;
    }
    else {
      actualInstanceOf = `${typeof arg}`;
    }
  }
  // Build and return the Error Message.
  return `Expected ${argName} to be a non-null instance of '${expectedInstanceOf}'` +
         (actualInstanceOf ? ` but got an instance of '${actualInstanceOf}' instead` : ``) +
         `.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidNumber
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `number` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `number` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidNumber(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a valid, non-null, number${typeof arg !== 'number' ? ` but got type '${typeof arg}' instead` : `${isNaN(arg) ? ` but got 'NaN' instead` : ``}` }.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidObject
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `object` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `object` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidObject(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null object${typeof arg !== 'object' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullInvalidString
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or invalid `string` was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting a `null` or invalid `string` was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullInvalidString(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null string${typeof arg !== 'string' ? ` but got type '${typeof arg}' instead.` : `.`}`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    errMsgNullUndefined
 * @param       {unknown} arg Required. The argument involved in the error.
 * @param       {string}  argName Required. The variable name of the argument involved in the error.
 * @returns     {string}  A standardized error message reporting a `null` or `undefined` value was provided.
 * @description Given an argument and the name of that argument, returns a standardized error
 *              message reporting that a `null` or `undefined` value was provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function errMsgNullUndefined(arg:unknown, argName:string):string {
  if (isEmptyNullInvalidString(argName)) {
    argName = 'the argument';
  }
  return `Expected ${argName} to be a non-null, defined type but got ${typeof arg === 'undefined' ? `'undefined'` : `a null value`} instead.`;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `array`, or is a null or empty `array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidArray(variable:unknown):boolean {
  return (Array.isArray(variable) !== true || variable === null || (variable as []).length < 1);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `string`, or is a null or empty `string`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidString(variable:unknown):boolean {
  return (typeof variable !== 'string' || variable === null || variable === '');
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isEmptyNullInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `object`, or is a null or empty `object`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isEmptyNullInvalidObject(variable:unknown):boolean {
  return (typeof variable !== 'object' || variable === null || isEmpty(variable));
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `array`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidArray(variable:unknown):boolean {
  return (Array.isArray(variable) !== true);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `boolean`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidBoolean(variable:unknown):boolean {
  return (typeof variable !== 'boolean');
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `function`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidFunction(variable:unknown):boolean {
  return (typeof variable !== 'function');
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `instance of` a the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidInstance(variable:unknown, classConstructor:AnyConstructor):boolean {
  return (typeof variable !== 'object' || ((variable instanceof classConstructor) !== true));
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidNumber
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `number`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidNumber(variable:unknown):boolean {
  return (typeof variable !== 'number' || isNaN(variable));
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `object`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidObject(variable:unknown):boolean {
  return (typeof variable !== 'object');
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `string`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isInvalidString(variable:unknown):boolean {
  return (typeof variable !== 'string');
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an array, or if it is null.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidArray(variable:unknown):boolean {
  return (Array.isArray(variable) !== true || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `boolean`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidBoolean(variable:unknown):boolean {
  return (typeof variable !== 'boolean' || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `function`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidFunction(variable:unknown):boolean {
  return (typeof variable !== 'function' || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks if the given variable is `null` or is NOT an `instance of` the expected class.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidInstance(variable:unknown, classConstructor:AnyConstructor):boolean {
  return (typeof variable !== 'object' || variable === null || ((variable instanceof classConstructor) !== true));
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidNumber
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `number`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidNumber(variable:unknown):boolean {
  return (typeof variable !== 'number' || isNaN(variable) || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT an `object`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidObject(variable:unknown):boolean {
  return (typeof variable !== 'object' || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is NOT a `string`, or if it is `null`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullInvalidString(variable:unknown):boolean {
  return (typeof variable !== 'string' || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNullUndefined
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks if the given variable is `null` or `undefined`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNullUndefined(variable:unknown):boolean {
  return (typeof variable === 'undefined' || variable === null);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isReadablePath
 * @param       {string}  path  Required. Path that will be checked for readability.
 * @returns     {boolean}
 * @description Checks if the given path exists AND is readable by the currently running user.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isReadablePath(path:string):boolean {
  try {
    fse.accessSync(path, fse.constants.R_OK);
  }
  catch (accessError) {
    return false;
  }
  return true;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isEmptyNullInvalidArray()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidArray(variable:unknown):boolean {
  return !isEmptyNullInvalidArray(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isEmptyNullInvalidString()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidString(variable:unknown):boolean {
  return !isEmptyNullInvalidString(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotEmptyNullInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isEmptyNullInvalidObject()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotEmptyNullInvalidObject(variable:unknown):boolean {
  return !isEmptyNullInvalidObject(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidArray()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidArray(variable:unknown):boolean {
  return !isInvalidArray(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidBoolean()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidBoolean(variable:unknown):boolean {
  return !isInvalidBoolean(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidFunction()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidFunction(variable:unknown):boolean {
  return !isInvalidFunction(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidInstance()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidInstance(variable:unknown, classConstructor:AnyConstructor):boolean {
  return !isInvalidInstance(variable, classConstructor);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidNumber
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidNumber()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidNumber(variable:unknown):boolean {
  return !isInvalidNumber(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidObject()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidObject(variable:unknown):boolean {
  return !isInvalidObject(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isInvalidString()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotInvalidString(variable:unknown):boolean {
  return !isInvalidString(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidArray
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidArray()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidArray(variable:unknown):boolean {
  return !isNullInvalidArray(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidBoolean
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidBoolean()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidBoolean(variable:unknown):boolean {
  return !isNullInvalidBoolean(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidFunction
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidFunction()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidFunction(variable:unknown):boolean {
  return !isNullInvalidFunction(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidInstance
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the variable will be tested against.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidInstance()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidInstance(variable:unknown, classConstructor:AnyConstructor):boolean {
  return !isNullInvalidInstance(variable, classConstructor);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidNumber
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidNumber()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidNumber(variable:unknown):boolean {
  return !isNullInvalidNumber(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidObject
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidObject()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidObject(variable:unknown):boolean {
  return !isNullInvalidObject(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullInvalidString
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullInvalidString()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullInvalidString(variable:unknown):boolean {
  return !isNullInvalidString(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotNullUndefined
 * @param       {unknown} variable  Required. The variable whose type will be validated.
 * @returns     {boolean}
 * @description Checks for the inverse of `isNullUndefined()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotNullUndefined(variable:unknown):boolean {
  return !isNullUndefined(variable);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    isNotReadablePath
 * @param       {string}  path  Required. Path that will be checked for readability.
 * @returns     {boolean}
 * @description Checks for the inverse of `isReadablePath()`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function isNotReadablePath(path:string):boolean {
  return !isReadablePath(path);
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidArray
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null, non-empty `array`. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidArray(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isEmptyNullInvalidArray(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgEmptyNullInvalidArray(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidObject
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null, non-empty `object`. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidObject(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isEmptyNullInvalidObject(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgEmptyNullInvalidObject(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnEmptyNullInvalidString
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null, non-empty `string`. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnEmptyNullInvalidString(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isEmptyNullInvalidString(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgEmptyNullInvalidString(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidArray
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is an
 *              `array`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidArray(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidArray(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidArray(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidBoolean
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              `boolean`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidBoolean(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidBoolean(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidBoolean(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidFunction
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              `function`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidFunction(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidFunction(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidFunction(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidInstance
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument will be tested against.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is an
 *              object that's an `instance of` the specified class. Uses the debug namespace of the
 *              external caller as the base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidInstance(arg:unknown, classConstructor:AnyConstructor, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidInstance(arg, classConstructor))  {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidInstance(arg, classConstructor, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidNumber
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              `number`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidNumber(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidNumber(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidNumber(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidObject
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is an
 *              `object`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidObject(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidObject(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidObject(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnInvalidString
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              `string`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnInvalidString(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isInvalidString(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgInvalidString(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidArray
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `array`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidArray(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidArray(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidArray(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidBoolean
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `boolean`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidBoolean(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidBoolean(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidBoolean(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidFunction
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `function`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidFunction(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidFunction(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidFunction(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidInstance
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {AnyConstructor}  classConstructor  Required. Constructor function of the object
 *              that the argument will be tested against.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `object` that's an `instance of` the specified class. Uses the debug namespace
 *              of the external caller as the base of the "source" string used by the thrown
 *              `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidInstance(arg:unknown, classConstructor:AnyConstructor, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidInstance(arg, classConstructor))  {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidInstance(arg, classConstructor, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidNumber
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `number`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidNumber(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidNumber(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidNumber(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidObject
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `object`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidObject(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidObject(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidObject(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullInvalidString
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              non-null `string`. Uses the debug namespace of the external caller as the base of
 *              the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullInvalidString(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullInvalidString(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNullInvalidString(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNullUndefined
 * @param       {unknown} arg       Required. The argument whose type will be validated.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given an argument of `unknown` type, attempts to validate that the argument is a
 *              not `null` nor `undefined`. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNullUndefined(arg:unknown, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNullUndefined(arg)) {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg    : errMsgNullUndefined(arg, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName   : `TypeError`)
                             , `${dbgNsExt}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    throwOnNonReadablePath
 * @param       {string}  path      Required. Path that will be checked for readability.
 * @param       {string}  dbgNsExt  Required. The debug namespace of the external caller.
 * @param       {string}  argName   Required. The variable name of the argument being validated.
 * @param       {string}  [errMsg]  Optional. Overrides the standard error message.
 * @param       {string}  [errName] Optional. Overrides the standard error name.
 * @returns     {void}
 * @description Given a `string` containing a filesystem path, attempts to validate that the path is
 *              readable by the running user. Uses the debug namespace of the external caller as the
 *              base of the "source" string used by the thrown `SfdxFalconError`.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function throwOnNonReadablePath(path:string, dbgNsExt:string, argName:string, errMsg?:string, errName?:string):void {
  if (isNotReadablePath(path))  {
    throw new SfdxFalconError( (isNotEmptyNullInvalidString(errMsg)   ? errMsg   : errMsgNonReadablePath(path, argName))
                             , (isNotEmptyNullInvalidString(errName)  ? errName  : `PathError`)
                             , `${dbgNsExt}`);
  }
}
