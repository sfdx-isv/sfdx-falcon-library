//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/util/src/listr.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Utility Module. Exposes functionality specific to the Listr task runner.
 * @description   Utility functions related to the Listr task runner. Does not contain any Tasks
 *                or Task Bundles.  For those, see ???.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  {ListrRendererValue}  from  'listr';                // Type. Defines the possible values for a Listr Renderer.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';   // Class. Specialized debug provider for SFDX-Falcon code.

// Requires
const falconUpdateRenderer  = require('falcon-listr-update-renderer');  // Custom SFDX-Falcon renderer for Listr.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:util:listr:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    chooseListrRenderer
 * @returns     {ListrRendererValue<unknown>} Constructor for a custom Listr Renderer or a string
 *              string designating one of the default renderers.
 * @description Returns either a custom Listr Renderer or a string designating the default "verbose"
 *              renderer depending on whether or not the user specified any Debug Namespaces when
 *              the currently running command was initiated.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function chooseListrRenderer():ListrRendererValue<unknown> {
  if (SfdxFalconDebug.enabledDebugNamespaceCount === 0) {
    return falconUpdateRenderer;
  }
  else {
    return 'verbose';
  }
}
