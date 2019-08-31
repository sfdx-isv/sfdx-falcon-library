//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/util/src/zip.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Libray of Zip (archive) related helper functions.
 * @description   Libray of Zip (archive) related helper functions.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
const unzipper  = require('unzipper');
const fs        = require('fs');

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug} from  '@sfdx-falcon/debug'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError} from  '@sfdx-falcon/error'; // Class. Specialized Error object. Wraps SfdxError.

// Import Internal Modules
import  {waitASecond}     from  './async';            // Function. Simple helper function that can be used to introduce a delay when called inside async functions using the "await" keyword.

// Set the File Local Debug Namespace
const dbgNs     = 'UTILITY:zip:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    extract
 * @param       {string}  zipFile Required. Zip file to be extracted.
 * @param       {string}  zipExtractTarget  Required. Target directory for the extraction.
 * @returns     {Promise<void>}
 * @description Given the path to a Zip File and a target, extracts files from a zip file and places
 *              the extracted files in the target location.
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function extract(zipFile:string, zipExtractTarget:string):Promise<void> {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}extract:arguments:`, arguments, `arguments: `);

  // Introduce a small delay to ensure that the user sees status messages when used by a Listr Task.
  await waitASecond(3);

  // Wrap the Extract() stream in a promise and resolve once the "close" event fires.
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(zipFile);
    readStream
      .on('error', error => {
        readStream.destroy();
        reject(new SfdxFalconError( `Extraction failed. ${error.message ? error.message : 'Cause of failure is unknown.'}`
                                  , `ExtractionError`
                                  , `${dbgNs}extract`
                                  , error));
      })
      .pipe(unzipper.Extract({path: zipExtractTarget}))
        .on('close', () => {
          resolve();
        })
        .on('error', error => {
          reject(new SfdxFalconError( `Extraction failed. ${error.message ? error.message : 'Cause of failure is unknown.'}`
                                    , `ExtractionError`
                                    , `${dbgNs}extract`
                                    , error));
    });
  });
}
