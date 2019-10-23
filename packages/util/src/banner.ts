//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/util/src/banner.ts
 * @summary       Utility Module. Lets the caller create a "banner" as CLI output.
 * @description   Utility Module. Lets the caller create a "banner" as CLI output.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  ansiRegex         = require('ansi-regex');
import  ansiStyles        = require('ansi-styles');
import  boxen             = require('boxen');
import  {BorderStyle}     from 'boxen';
import  chalk             from 'chalk';
import  cliBoxes          = require('cli-boxes');
import  pad               = require('pad-component');
import  stringWidth       = require('string-width');
import  stripAnsi         from 'strip-ansi';
import  wrap              = require('wrap-ansi');

// Import SFDX-Falcon Libraries
import  {TypeValidator}   from  '@sfdx-falcon/validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug} from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).

// Import SFDX-Falcon Types
import  {JsonMap}         from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:util:banner';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    falconSay
 * @param       {string}  message Required. Message to show inside of the FalconSay banner.
 * @param       {string}  [opts]  Optional. Options that determine how the FalconSay banner is built.
 * @returns     {string}  String that contains terminal-ready output for showing the constructed
 *              banner inside of a CLI.
 * @description Given a string with a message and optional settings, builds the ANSI code-enabled
 *              string that can be sent to `console.log()` in order to render a stylized banner
 *              with a logo and message.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function falconSay(message:string, opts:JsonMap={}):string {

  // Set a default message if one was not provided.
  const originalMessage = (message || 'SFDX-Falcon Library').trim();

  // Make sure options is an object.
  if (TypeValidator.isNullInvalidObject(opts)) {
    opts = {};
  }

  const border = cliBoxes.round;
  const leftOffset = 17;
  const defaultGreeting =
    '\n     _-----_     ' +
    '\n    |       |    ' +
    '\n    |' + chalk.red('--(o)--') + '|    ' +
    '\n   `---------´   ' +
    '\n    ' + chalk.yellow('(') + ' _' + chalk.yellow('´U`') + '_ ' + chalk.yellow(')') + '    ' +
    '\n    /___A___\\   /' +
    '\n     ' + chalk.yellow('|  ~  |') + '     ' +
    '\n   __' + chalk.yellow('\'.___.\'') + '__   ' +
    '\n ´   ' + chalk.red('`  |') + '° ' + chalk.red('´ Y') + ' ` ';
  
  // console.log(`Original Message (RAW):\n%O`, {rawString: originalMessage});
  // console.log(`Original Message (STYLED):\n${originalMessage}`);

  /*
   * Things to keep in mind.
   * 1. escape sequences like `\n` and `\u001b` are interpreted as ONE character of length.
   *    Example: The string `123456789*123456789*123456789*` is represented in code with
   *    30 chars, and has a length of 30.
   *
   *    Example 2: The string `123456789*\n123456789*\n123456789*` is represented in code with
   *    34 chars, but only has a length of 32. Each newline `\n` escape code results in one char
   *    of extra length.
   *
   *    Example 3: The string `123456789*\u001b[34m123456789*\u001b[39m123456789*` is represented
   *    in code with 50 chars, but only has a length of 40. Each ANSI code results in five chars
   *    of extra length.
   */

  /*
   * What you're about to see may confuse you. And rightfully so. Here's an
   * explanation.
   *
   * When yosay is given a string, we create a duplicate with the ansi styling
   * sucked out. This way, the true length of the string is read by `pad` and
   * `wrap`, so they can correctly do their job without getting tripped up by
   * the "invisible" ansi. Along with the duplicated, non-ansi string, we store
   * the character position of where the ansi was, so that when we go back over
   * each line that will be printed out in the message box, we check the
   * character position to see if it needs any styling, then re-insert it if
   * necessary.
   *
   * Better implementations welcome :)
   */

  // Determine the length of the largest single word in the message. If the
  // Max Word Length is LESS THAN the max length being requested by the caller
  // use the caller's choice for Max Length. Otherwise use the Max Word Length.
  const borderWidth   = 1;
  const horizPadding  = 1;
  const defaultMaxLen = 30;
  const maxWordLength = stripAnsi(originalMessage).toLowerCase().split(/\s|\n/).sort()[0].length;
  const maxLength     = TypeValidator.isNullInvalidNumber(opts.maxLength)
                      ? (((maxWordLength < defaultMaxLen)   ? defaultMaxLen   : maxWordLength) as number) + horizPadding
                      : (((maxWordLength < opts.maxLength)  ? opts.maxLength  : maxWordLength) as number) + horizPadding;
  const regExNewLine  = new RegExp(`\\s{${maxLength}}`);
  const styledIndexes = {};
  let completedString = '';
  let topOffset       = 4;

  // Number of characters in the logo column                            → `    /___A___\   /`
  const LOGO_WIDTH = 17;

  // Number of lines in the logo
  const LOGO_HEIGHT = 9;

  // Number of characters in the default top frame of the text box → `╭──────────────────────────╮`
  const FRAME_WIDTH = maxLength + (2 * borderWidth) + (2 * horizPadding);

  // Total number of characters across an entire line
  const TOTAL_CHARACTERS_PER_LINE = LOGO_WIDTH + FRAME_WIDTH;

  //console.log(`defaultMaxLen: ${defaultMaxLen}`);
  //console.log(`maxWordLength: ${maxWordLength}`);
  //console.log(`maxLength: ${maxLength}`);
  //console.log(`originalMessage.length: ${originalMessage.length}`);
  //console.log(`LOGO_WIDTH: ${LOGO_WIDTH}`);
  //console.log(`FRAME_WIDTH: ${FRAME_WIDTH}`);
  //console.log(`TOTAL_CHARACTERS_PER_LINE: ${TOTAL_CHARACTERS_PER_LINE}\n\n`);

  // The speech bubble will overflow the Yeoman character if the message is too long.
  const MAX_MESSAGE_LINES_BEFORE_OVERFLOW = LOGO_HEIGHT - 2;

  // Create the horizontal border for the message frame.
  const borderHorizontal = border.horizontal.repeat(maxLength + 2);

  // Create the top, left, and bottom borders of the message frame.
  const messageFrame = {
    top: border.topLeft + borderHorizontal + border.topRight,
    side: ansiStyles.reset.open + border.vertical + ansiStyles.reset.open,
    bottom: ansiStyles.reset.open + border.bottomLeft + borderHorizontal + border.bottomRight
  };

  // Search the message string for all occurances of ANSI codes.
  // For each ANSI code found, store that code in the Styled Indexes object
  // using the string offset (ie. the character index where the match was found)
  // as the object property key where the ANSI code that was found will be
  // saved.
  originalMessage.replace(ansiRegex(), (match, offset) => {

    // Start by figuring out the total length of all ANSI codes captured so far.
    let ansiCodesTotalLength = 0;
    Object.keys(styledIndexes).forEach(key => {
      ansiCodesTotalLength += styledIndexes[key].length;
    });

    const adustedOffset = offset - ansiCodesTotalLength;
    //console.log(`Match found at offset ${offset} (adjusted offset ${adustedOffset}): %O`, {rawString: match, rawStringLen: match.length});

    // Add the latest ANSI code to the Styled Index object map.
    styledIndexes[adustedOffset] = styledIndexes[adustedOffset] ? styledIndexes[adustedOffset] + match : match;
    //const ansiStyleCode = styledIndexes[adustedOffset] = styledIndexes[adustedOffset] ? styledIndexes[adustedOffset] + match : match;
    //console.log(`ansiStyleCode (offset=${offset}):\n%O`, {rawString: ansiStyleCode});

    return null;
  });

  const strippedMessage = stripAnsi(originalMessage);
  const spacesIndex = [];

  strippedMessage.split(' ').reduce((accu, cur) => {
    spacesIndex.push(accu + cur.length);
    return spacesIndex[spacesIndex.length - 1] + 1;
  }, 0);

  return wrap(strippedMessage, maxLength, {hard: true})
    .split(/\n/)
    .reduce((greeting, str, index, array) => {
      if (!regExNewLine.test(str)) {
        str = str.trim();
      }

      completedString += str;

      let offset = 0;

      for (const spaceIndex of spacesIndex) {
        const char = completedString[spaceIndex - offset];
        if (char) {
          if (char !== ' ') {
            offset += 1;
          }
        } else {
          break;
        }
      }

      console.log(completedString);

      str = completedString
        .substr(completedString.length - str.length)
        .replace(/./g, (char, charIndex) => {
          charIndex += completedString.length - str.length + offset;

          let hasContinuedStyle = 0;
          let continuedStyle;

          Object.keys(styledIndexes).forEach(charOffset => {
            if (charIndex > charOffset) {
              hasContinuedStyle++;
              continuedStyle = styledIndexes[charOffset];
            }

            if (hasContinuedStyle === 1 && charIndex < charOffset) {
              hasContinuedStyle++;
            }
          });

          if (styledIndexes[charIndex]) {
            return styledIndexes[charIndex] + char;
          } else if (hasContinuedStyle >= 2) {
            return continuedStyle + char;
          }

          return char;
        })
        .trim();

      //console.log(`maxLength before pad(): ${maxLength}`);

      const paddedString = pad({
        length: stringWidth(str),
        valueOf: () => {
          return ansiStyles.reset.open + str + ansiStyles.reset.open;
        }
      }, maxLength);

      //console.log(`stringWidth(str): ${stringWidth(str)}`);
      //console.log(`paddedString -->${paddedString}<--`);

      if (index === 0) {
        // Need to adjust the top position of the speech bubble depending on the
        // amount of lines of the message.
        if (array.length === 2) {
          topOffset -= 1;
        }

        if (array.length >= 3) {
          topOffset -= 2;
        }

        // The speech bubble will overflow the Yeoman character if the message
        // is too long. So we vertically center the bubble by adding empty lines
        // on top of the greeting.
        if (array.length > MAX_MESSAGE_LINES_BEFORE_OVERFLOW) {
          const emptyLines = Math.ceil((array.length - MAX_MESSAGE_LINES_BEFORE_OVERFLOW) / 2);

          for (let i = 0; i < emptyLines; i++) {
            greeting.unshift('');
          }

          messageFrame.top = pad.left(messageFrame.top, TOTAL_CHARACTERS_PER_LINE);
        }

        greeting[topOffset - 1] += messageFrame.top;
      }

      greeting[index + topOffset] =
        (greeting[index + topOffset] || pad.left('', leftOffset)) +
        messageFrame.side + ' ' + paddedString + ' ' + messageFrame.side;

      if (array.length === index + 1) {
        greeting[index + topOffset + 1] =
          (greeting[index + topOffset + 1] || pad.left('', leftOffset)) +
          messageFrame.bottom;
      }

      return greeting;
    }, defaultGreeting.split(/\n/))
    .join('\n') + '\n';
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildBanner
 * @param       {string}  message Required. Message to show inside of a rectangular banner.
 * @param       {string}  [opts]  Optional. Options that determine how the banner is built.
 * @returns     {string}  String that contains terminal-ready output for showing the constructed
 *              banner inside of a CLI.
 * @description Given a string with a message and optional settings, builds the ANSI code-enabled
 *              string that can be sent to `console.log()` in order to render a stylized banner
 *              with a logo and message.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildBanner(message:string, opts:boxen.Options={}):string {

  // Set a default message if one was not provided.
  const originalMessage = (message || 'SFDX-Falcon Library').trim();

  // Make sure options is an object.
  if (TypeValidator.isNullInvalidObject(opts)) {
    opts = {};
  }

  // Set the default options, then merge with the caller-supplied opts.
  const resolvedOpts:boxen.Options = {
    borderColor:  'yellow',
    borderStyle:  BorderStyle.Round,
    dimBorder:    false,
    padding: {
      left:   1,
      right:  1,
      top:    0,
      bottom: 0
    },
    margin:       0,
    float:        'left',
    backgroundColor: null,
    align:        'center',
    ...opts
  };

  // Create the banner and return it to the caller.
  return boxen(originalMessage, resolvedOpts);
}
