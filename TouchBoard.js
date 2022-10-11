const { SerialPort } = require('SerialPort');
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
	throw(`No port found for [${vendorId}:${productId}]`);
}


async function TouchBoard() {
	const path = await FindPath('2a6e', '8003');
	const board = new SerialPort({ path, baudRate: 9600 });

	// upload touch/release thresholds
	const thresholdsBuffer = fs.readFileSync('thresholds.json');
	const thresholds = JSON.parse(thresholdsBuffer);
	for (let animal of Object.keys(thresholds)) {
		board.write(`{${animal}-tths:${thresholds[animal].touch}}`)
		board.write(`{${animal}-rths:${thresholds[animal].release}}`)
	}
	
	board.write('{set-running:1}');

	return board;
}

module.exports = TouchBoard;
