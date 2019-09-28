//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/validator/src/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Collection of useful validation functions and primitives. Part of the SFDX-Falcon Library.
 * @description   Collection of useful validation functions and primitives. Part of the SFDX-Falcon Library.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
import  * as CoreValidator    from  './core';
import  * as GitValidator     from  './git';
import  * as TypeValidator    from  './type';
import  * as YeomanValidator  from  './yeoman';

/*
export  * from  './type';
export  * from  './core';
export  * from  './git';
export  * from  './yeoman';
//*/

export {
  TypeValidator,
  CoreValidator,
  GitValidator,
  YeomanValidator
};
