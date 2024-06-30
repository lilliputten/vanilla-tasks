/**
 * @desc Provide config variables to js code.
 * @changed 2024.05.23, 21:40
 */

const fs = require('node:fs');
const path = require('path');

const scriptPath = path.resolve(__dirname);

const configFileName = path.resolve(scriptPath, 'config.sh');

/** Timezone for timestamps (GMT, Europe/Moscow, Asia/Bangkok, Asia/Tashkent, etc)
 * NOTE: See orioginal data in 'config.sh'
 */
let timeZone = 'GMT';

try {
  // Read shell config file
  const text = fs.readFileSync(configFileName, 'utf8');
  // Extract `TIMEZONE` variable
  const found = text.match(/^TIMEZONE\s*=\s*"(\S*)"/m)
  // Update timezone if found
  if (found && found[1]) {
    timeZone = found[1];
    console.log('Found timezone:', timeZone);
  }
} catch (err) {
  console.error(err);
}

module.exports = {
  timeZone,
};
