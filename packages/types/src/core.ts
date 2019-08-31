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
import  {AnyArray}            from  '@salesforce/ts-types';
import  {AnyArrayLike}        from  '@salesforce/ts-types';
import  {AnyConstructor}      from  '@salesforce/ts-types';
import  {AnyFunction}         from  '@salesforce/ts-types';
import  {AnyJson}             from  '@salesforce/ts-types';
import  {Dictionary}          from  '@salesforce/ts-types';
import  {JsonArray}           from  '@salesforce/ts-types';
import  {JsonCollection}      from  '@salesforce/ts-types';
import  {JsonMap}             from  '@salesforce/ts-types';
import  {JsonPrimitive}       from  '@salesforce/ts-types';
import  {KeyOf}               from  '@salesforce/ts-types';
import  {KeyValue}            from  '@salesforce/ts-types';
import  {Many}                from  '@salesforce/ts-types';
import  {Nullable}            from  '@salesforce/ts-types';
import  {Optional}            from  '@salesforce/ts-types';

// Import Internal Modules/Types
import  {StatusMessageType}   from  './enum';

/**
 * @module types
 */

/**
 * Interface. An alias for an array of `T` elements, where `T` defaults to `unknown`.
 */
export interface AnyArray<T=unknown> extends AnyArray<T> {}

/**
 * Interface. Any object with both a numeric index signature with values of type `T` and a numeric `length` property. `T` defaults to `unknown` if unspecified.
 */
export interface AnyArrayLike<T=unknown> extends AnyArrayLike<T> {}

/**
 * Type. A constructor for any type `T`. `T` defaults to `object` when not explicitly supplied.
 */
export type AnyConstructor<T=object> = AnyConstructor<T>;

/**
 * Type. Any `function` returning type `T`. `T` defaults to `unknown` when not explicitly supplied.
 */
export type AnyFunction<T = unknown> = AnyFunction<T>;

/**
 * Type. Any valid JSON value.
 */
export type AnyJson = AnyJson;

/**
 * Type. Represents the constructor for a Class, ie. something that can be the right operand of the instanceof operator.
 */
//export type ClassConstructor = any;  // tslint:disable-line: no-any

/**
 * Interface. An object with arbitrary string-indexed values of an optional generic type `Optional<T>`. `T` defaults to `unknown` when not explicitly supplied.
 */
export interface Dictionary<T=unknown> extends Dictionary<T> {}

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
 * Type An alias for the commonly needed `Extract<keyof T, string>`.
 */
export type KeyOf<T> = KeyOf<T>;

/**
 * Type. An alias for a tuple of type `[string, T]' for a given generic type `T`. `T` defaults to `unknown` if not otherwise defined.
 */
export type KeyValue<T=unknown> = KeyValue<T>;

/**
 * Interface. Any JSON-compatible array.
 */
export interface JsonArray extends JsonArray {} // tslint:disable-line: no-empty-interface

/**
 * Type. Any valid JSON collection value.
 */
export type JsonCollection = JsonCollection;

/**
 * Type. Any valid JSON primitive value.
 */
export type JsonPrimitive = JsonPrimitive;

/**
 * Interface. Any JSON-compatible object.
 */
export interface JsonMap extends JsonMap {} // tslint:disable-line: no-empty-interface

/**
 * Type. A union type for either the parameterized type `T` or an array of `T`.
 */
export type Many<T> = Many<T>;

/**
 * Type. A union type for either the parameterized type `T`, `null`, or `undefined` -- the opposite of the `NonNullable` builtin conditional type.
 */
export type Nullable<T> = Nullable<T>;

/**
 * Type. A union type for either the parameterized type `T` or `undefined` -- the opposite of `NonOptional`.
 */
export type Optional<T> = Optional<T>;

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
