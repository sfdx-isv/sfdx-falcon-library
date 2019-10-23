//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/util/src/listr.ts
 * @summary       Utility Module. Exposes functionality specific to the Listr task runner.
 * @description   Utility functions related to the Listr task runner. Does not contain any Tasks
 *                or Task Bundles.  For those, see `@sfdx-falcon/builder-library`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  FalconUpdateRenderer  = require('falcon-listr-update-renderer');  // Custom SFDX-Falcon renderer for Listr.
import  {ListrRendererValue}    from    'listr';                          // Type. Defines the possible values for a Listr Renderer.
import  SilentRenderer        = require('listr-silent-renderer');         // Specialized Listr Renderer that suppresses all output, other than errors.

// Import SFDX-Falcon Libraries
import  {TypeValidator}         from  '@sfdx-falcon/validator'; // Library. Helper functions related to Type Validation.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}       from  '@sfdx-falcon/debug';     // Class. Specialized debug provider for SFDX-Falcon code.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:util:listr';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    chooseListrRenderer
 * @param       {string}  [preference=''] Optional. Indicates the caller's preference for a specific
 *              renderer. Valid choices are `custom`, `verbose`, and `silent`. Usually this will be
 *              used to force the `verbose` renderer during dev/test or to force the `silent`
 *              renderer for unattended workloads.
 * @returns     {ListrRendererValue<unknown>} Constructor for a custom Listr Renderer or a string
 *              string designating one of the default renderers.
 * @description Returns either a custom Listr Renderer or a string designating the default "verbose"
 *              renderer depending on whether or not the user specified any Debug Namespaces when
 *              the currently running command was initiated.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function chooseListrRenderer(preference:string=''):ListrRendererValue<unknown> {

  // Define function-local and external debug namespaces.
  const funcName    = `chooseListrRenderer`;
  const dbgNsLocal  = `${dbgNs}:${funcName}`;

  // Reflect incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Make sure the preference variable is valid.
  if (TypeValidator.isNullInvalidString(preference)) {
    preference = '';
  }

  // Choose the right renderer.
  switch (preference.toLowerCase()) {
    case 'custom':
      return FalconUpdateRenderer;
    case 'verbose':
      return 'verbose';
    case 'silent':
      return SilentRenderer;
    default:
      if (SfdxFalconDebug.enabledDebugNamespaceCount === 0) {
        return FalconUpdateRenderer;
      }
      else {
        return 'verbose';
      }
  }
}
