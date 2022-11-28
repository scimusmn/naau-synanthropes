/* allow generators and iterators
 *
 * i didn't want to have to rewrite all of this async stuff
 * in a functional style. sorry. :c
 */
/* eslint-disable no-restricted-syntax */

// this import only works with this capitalization, but eslint complains about it
const { SerialPort } = require('SerialPort'); // eslint-disable-line import/no-unresolved
const fs = require('fs');

async function FindPath(vendorId, productId) {
  const list = await SerialPort.list();
  for (const port of list) {
    if (port.vendorId !== undefined && port.productId !== undefined) {
      if (port.vendorId.toLowerCase() === vendorId.toLowerCase()
        && port.productId.toLowerCase() === productId.toLowerCase()) {
        // matching port!!
        return port.path;
      }
    }
  }
  // no matching port found
  throw new Error(`No port found for [${vendorId}:${productId}]`);
}

async function TouchBoard() {
  const path = await FindPath('2a6e', '8003');
  const board = new SerialPort({ path, baudRate: 9600 });

  // upload touch/release thresholds
  const thresholdsBuffer = fs.readFileSync('thresholds.json');
  const thresholds = JSON.parse(thresholdsBuffer);
  for (const animal of Object.keys(thresholds)) {
    board.write(`{${animal}-tths:${thresholds[animal].touch}}`);
    board.write(`{${animal}-rths:${thresholds[animal].release}}`);
  }

  board.write('{set-running:1}');

  return board;
}

module.exports = TouchBoard;
