//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/debug/src/debug.ts
 * @summary       Provides custom, namespaced-based debugging/logging services.
 * @description   Provides custom, namespaced-based debugging/logging services.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
const debug = require('debug');
const chalk = require('chalk');
const util  = require('util');

/** Type. Alias to any, mainly so the intent is obvious when this is used. */
type DebugFunc = any; // tslint:disable-line: no-any

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SfdxFalconDebug
 * @summary     Provides custom "debugging" services (ie. debug-style info to console.log()).
 * @description Provides custom "debugging" services (ie. debug-style info to console.log()).
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SfdxFalconDebug {
  
  // Public members
  public static lineBreaks: number  = 2;
  public static debugDepth: number  = 2;

  // Public getters
  public static get enabledDebugNamespaceCount():number {
    return SfdxFalconDebug.enabledDebugNamespaces.size;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkEnabled
   * @param       {string}  namespace Required. The "namespace" of a debug object.
   * @returns     {boolean} Returns TRUE if the namespace has been enabled.
   * @description Given a "namespace", check the internal map of "enabled"
   *              namespaces and return true if a match is found.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static checkEnabled(namespace:string):boolean {

    // Split the provided namespace into sections on ":"
    const namespaceGroups = namespace.split(':');
    let namespaceToTest = '';

    // Check the namespace from top level to last level.
    for (const namespaceGroup of namespaceGroups) {
      namespaceToTest += namespaceGroup;
      if (SfdxFalconDebug.enabledDebugNamespaces.get(namespaceToTest)) {
        return true;
      }
      namespaceToTest += ':';
    }

    // No single or combined groupings in the provided namespace match an enabled namespace.
    return false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      enableDebuggers
   * @param       {Array<string>} namespaces  Required. An array of strings,
   *              each representing a namespace that should be enabled.
   * @param       {number}  [debugDepth]  Optional. The number of levels "deep"
   *              that the nested contents of an Object will be rendered during
   *              certain display operations.
   * @returns     {void}
   * @description Given an Array of strings, add an entry in the Enabled Debuggers
   *              map.  This means that when debug code is reached during execution
   *              any enabled debug messages will be displayed to the user.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static enableDebuggers(namespaces:string[], debugDepth:number=2):void {
    for (const namespace of namespaces) {
      SfdxFalconDebug.enabledDebugNamespaces.set(namespace, true);
    }
    SfdxFalconDebug.debugDepth = debugDepth;
    if (SfdxFalconDebug.enabledDebugNamespaces.size > 0) {
      console.log(chalk`\n{blue The Following Debug Namesapces are Enabled (Debug Depth = ${debugDepth.toString()}):}\n%O\n`, namespaces);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      debugMessage
   * @param       {string}  namespace Required.
   * @param       {string}  message  Required.
   * @returns     {void}
   * @description Given a debug namespace and a string containing a message,
   *              outputs that message to the console.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static debugMessage(namespace:string, message:string):void {
    const debugFunc = SfdxFalconDebug.getDebugger(namespace);
    debugFunc ( `${SfdxFalconDebug.printLineBreaks('-\n')}`
              + `${chalk.yellow(message)}`
              + `${SfdxFalconDebug.printLineBreaks('\n-')}`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      debugObject
   * @param       {string}  namespace Required.
   * @param       {object}  objToDebug  Required.
   * @param       {string}  [strLead] Optional
   * @param       {string}  [strTail] Optional
   * @returns     {void}
   * @description Given a debug namespace, an object to debug, and optionally
   *              leading and trailing strings to included in the output, sends
   *              the debug output to the console.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static debugObject(namespace:string, objToDebug:object, strLead:string = '', strTail:string = ''):void {
    const debugFunc = SfdxFalconDebug.getDebugger(namespace);
    debugFunc ( `${SfdxFalconDebug.printLineBreaks('-\n')}`
              + (strLead ? `${chalk.yellow(strLead)}\n` : ``)
              + `${util.inspect(objToDebug, {depth:8, colors:true})}`
              + (strTail ? `\n${chalk.yellow(strTail)}` : ``)
              + `${SfdxFalconDebug.printLineBreaks('\n-')}`
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      debugString
   * @param       {string}  namespace Required.
   * @param       {string}  strToDebug  Required.
   * @param       {string}  [strLead] Optional
   * @param       {string}  [strTail] Optional
   * @returns     {void}
   * @description Given a debug namespace, a string to debug, and optionally
   *              leading and trailing strings to included in the output, sends
   *              the debug output to the console.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static debugString(namespace:string, strToDebug:string, strLead:string = '', strTail:string = ''):void {
    const debugFunc = SfdxFalconDebug.getDebugger(namespace);
    debugFunc ( `${SfdxFalconDebug.printLineBreaks('-\n')}`
              + (strLead ? `${chalk.blue(strLead)} ` : ``)
              + `${strToDebug} `
              + (strTail ? ` ${chalk.blue(strTail)}` : ``)
              + `${SfdxFalconDebug.printLineBreaks('\n-')}`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      disableDebuggers
   * @param       {string[]} namespaces  Required.
   * @returns     {void}
   * @description Given an array of debug namespaces, iterates over each and
   *              sets them to FALSE in the Enabled Debugger Namespace map.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static disableDebuggers(namespaces:string[]):void {
    for (const namespace of namespaces) {
      SfdxFalconDebug.enabledDebugNamespaces.set(namespace, false);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getDebugger
   * @param       {string}  namespace Required
   * @returns     {DebugFunc} Returns the debugger with the appropriate namespace.
   * @description Given a debug namespace (eg. "UTILITY:sfdx:executeCommand:"),
   *              attempts to find a match for an existing Debugger object. If
   *              one can't be found, creates a new Debugger, enables it, then
   *              returns it to the caller.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getDebugger(namespace:string):DebugFunc {
    if (SfdxFalconDebug.debuggers.has(namespace)) {
      return SfdxFalconDebug.debuggers.get(namespace);
    }
    else {
      const newDebugger = debug(namespace);
      newDebugger.enabled = true;
      SfdxFalconDebug.debuggers.set(namespace, newDebugger);
      return newDebugger;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      msg
   * @param       {string}  namespace Required.
   * @param       {string}  message  Required.
   * @returns     {void}
   * @description Given a debug namespace and a string containing a message,
   *              outputs that message to the console but ONLY if the specified
   *              namespace was enabled by the user via the --falcondebug flag.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static msg(namespace:string, message:string):void {
    if (SfdxFalconDebug.checkEnabled(namespace)) {
      SfdxFalconDebug.debugMessage(namespace, message);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      obj
   * @param       {string}  namespace Required.
   * @param       {object}  objToDebug  Required.
   * @param       {string}  [strLead] Optional
   * @param       {string}  [strTail] Optional
   * @returns     {void}
   * @description Given a debug namespace, an object to debug, and optionally
   *              leading and trailing strings to included in the output, sends
   *              the debug output to the console but ONLY if the specified
   *              namespace was enabled by the user via the --falcondebug flag.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static obj(namespace:string, objToDebug:object, strLead:string = '', strTail:string = ''):void {
    if (SfdxFalconDebug.checkEnabled(namespace)) {
      SfdxFalconDebug.debugObject(namespace, objToDebug, strLead, strTail);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      str
   * @param       {string}  namespace Required.
   * @param       {string}  strToDebug  Required.
   * @param       {string}  [strLead] Optional
   * @param       {string}  [strTail] Optional
   * @returns     {void}
   * @description Given a debug namespace, a string to debug, and optionally
   *              leading and trailing strings to included in the output, sends
   *              the debug output to the console but ONLY if the specified
   *              namespace was enabled by the user via the --falcondebug flag.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static str(namespace:string, strToDebug:string, strLead:string = '', strTail:string = ''):void {
    if (SfdxFalconDebug.checkEnabled(namespace)) {
      SfdxFalconDebug.debugString(namespace, strToDebug, strLead, strTail);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      toConsole
   * @param       {string}  message Required. Message to send to console.log().
   * @param       {number}  [lineBreaks]  Optional. The number of line breaks
   *              to insert before and after the message.
   * @description Sends a message to console.log that's pre and post-pended
   *              with newline breaks to help the output be easy to see.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static toConsole(message:string, lineBreaks?:number):void {
    console.log(
      `${SfdxFalconDebug.printLineBreaks('-\n', lineBreaks)}` +
      `${chalk.yellow(message)}` +
      `${SfdxFalconDebug.printLineBreaks('\n-', lineBreaks)}`
    );
  }

  // Private members
  private static debuggers:               Map<string, DebugFunc>  = new Map();
  private static enabledDebugNamespaces:  Map<string, boolean>    = new Map<string, boolean>();

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      printLineBreaks
   * @param       {string}  breakPattern  Required. The string that will be used
   *              to create the line breaks. This must contain a `/n` (newline)
   *              character or no line breaks will occur.
   * @param       {number}  [lineBreaks]  Optional. The number of line breaks
   *              to insert. If not provided, the Global Static value will be
   *              used.
   * @description Returns a string containing the number of newline chars as
   *              specified in the lineBreaks public static member variable.
   * @private @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private static printLineBreaks(breakPattern:string, lineBreaks?:number):string {
    if (typeof breakPattern !== 'string' || breakPattern === null || breakPattern === '') {
      breakPattern = '\n';
    }
    if (isNaN(lineBreaks)) {
      lineBreaks = SfdxFalconDebug.lineBreaks;
    }
    return breakPattern.repeat(lineBreaks);
  }
}
