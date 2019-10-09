//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          packages/util/src/banner.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Utility Module. Lets the caller create a "banner" as CLI output.
 * @description   Utility Module. Lets the caller create a "banner" as CLI output.
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
import  ansiRegex   = require('ansi-regex');
import  ansiStyles  = require('ansi-styles');
import  chalk       from 'chalk';
import  cliBoxes    = require('cli-boxes');
import  pad         = require('pad');
import  stringWidth = require('string-width');
import  stripAnsi   from 'strip-ansi';
import  wrap        = require('wrap-ansi');

// Import SFDX-Falcon Libraries
import  {TypeValidator} from  '@sfdx-falcon/validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import SFDX-Falcon Types
import  {JsonMap}       from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.

//const chalk = require('chalk');
//const pad = require('pad');
//const wrap = require('wrap-ansi');
//const stringWidth = require('string-width');
//const stripAnsi = require('strip-ansi');
//const ansiStyles = require('ansi-styles');
//const ansiRegex = require('ansi-regex')();
//const cliBoxes = require('cli-boxes');

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

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildBanner
 * @param       {string}  message Required. Message to show inside of the banner.
 * @param       {string}  [opts]  Optional. Options that determine how the banner is built.
 * @returns     {string}  String that contains terminal-ready output for showing the constructed
 *              banner inside of a CLI.
 * @description Given a string with a message and optional settings, builds the ANSI code-enabled
 *              string that can be sent to `console.log()` in order to render a stylized banner.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildBanner(message:string, opts:JsonMap={}):string {

  // Set a default message if one was not provided.
  message = (message || 'SFDX-Falcon Library').trim();

  // Make sure options is an object.
  if (TypeValidator.isNullInvalidObject(opts)) {
    opts = {};
  }

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
  const defaultMaxLen = 24;
  const maxWordLength = stripAnsi(message).toLowerCase().split(' ').sort()[0].length;
  const maxLength     = TypeValidator.isNullInvalidNumber(opts.maxLength)
                      ? ((maxWordLength < defaultMaxLen)   ? defaultMaxLen   : maxWordLength) as number
                      : ((maxWordLength < opts.maxLength)  ? opts.maxLength  : maxWordLength) as number;

  // ???
  const defaultFrameWidth = 28;
  const horizPadding  = 1;
//  const vertPadding   = 1;
  const styledIndexes = {};
  let completedString = '';
  let topOffset = 4;

  // Number of characters in the logo column                            → `    /___A___\   /`
  const LOGO_WIDTH = 17;

  // Number of characters in the default top frame of the text box → `╭──────────────────────────╮`
  const FRAME_WIDTH = (maxLength > (defaultFrameWidth - 2 - (2*horizPadding)))
                        ? maxLength + 2 + (2*horizPadding)
                        : defaultFrameWidth;

  // Total number of characters across an entire line
  const TOTAL_CHARACTERS_PER_LINE = LOGO_WIDTH + FRAME_WIDTH;

  // The speech bubble will overflow the Yeoman character if the message is too long.
  const MAX_MESSAGE_LINES_BEFORE_OVERFLOW = 7;

  // ???
  const regExNewLine = new RegExp(`\\s{${maxLength}}`);
  const borderHorizontal = border.horizontal.repeat(maxLength + 2);

  const frame = {
    top: border.topLeft + borderHorizontal + border.topRight,
    side: ansiStyles.reset.open + border.vertical + ansiStyles.reset.open,
    bottom: ansiStyles.reset.open + border.bottomLeft + borderHorizontal + border.bottomRight
  };

  // TODO: What is actually happening here?
  message.replace(ansiRegex(), (match, offset) => {
    Object.keys(styledIndexes).forEach(key => {
      offset -= styledIndexes[key].length;
    });

    return styledIndexes[offset] = styledIndexes[offset] ? styledIndexes[offset] + match : match;
  });

  const strippedMessage = stripAnsi(message);
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

      for (let i = 0; i < spacesIndex.length; i++) {
        const char = completedString[spacesIndex[i] - offset];
        if (char) {
          if (char !== ' ') {
            offset += 1;
          }
        } else {
          break;
        }
      }

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

      const paddedString = pad({
        length: stringWidth(str),
        valueOf() {
          return ansiStyles.reset.open + str + ansiStyles.reset.open;
        }
      }, maxLength);

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

          frame.top = pad(TOTAL_CHARACTERS_PER_LINE, frame.top);
        }

        greeting[topOffset - 1] += frame.top;
      }

      greeting[index + topOffset] =
        (greeting[index + topOffset] || pad(leftOffset, '')) +
        frame.side + ' ' + paddedString + ' ' + frame.side;

      if (array.length === index + 1) {
        greeting[index + topOffset + 1] =
          (greeting[index + topOffset + 1] || pad(leftOffset, '')) +
          frame.bottom;
      }

      return greeting;
    }, defaultGreeting.split(/\n/))
    .join('\n') + '\n';
}

