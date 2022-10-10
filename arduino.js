'use strict';

const { SerialPort } = require('serialport');
const Parser = require('./Parser.js');

class Arduino {
  constructor(options = {}) {
    const { vendorId, productId, port, log } = options;
    this.vendorId = vendorId;
    this.productId = productId;
    this.path = port;

    this.dataCallbacks = {};
  }

  static FindPath(vendorId, productId) {
    return SerialPort.list().then(list => {
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
    });
  }

  static OpenPath(path, baudRate) {
  	console.log(path);
    const port = new SerialPort({ path, baudRate });
    return new Promise(resolve => {
      port.on('open', () => resolve(port));
    });
  }

  open(baudRate = 115200) {
    const openPort = (port, resolve) => {
      this.port = port;
      this.parser = port.pipe(new Parser());
      this.parser.on('data', data => this._onData(data));
      resolve();
    };

    return new Promise((resolve, reject) => {
      if (this.path !== undefined) {
        // prefer to open with explicit port name
        Arduino.OpenPath(this.path, baudRate).then(port => openPort(port, resolve));
      } else if (this.vendorId !== undefined && this.productId !== undefined) {
        // fallback to VID/PID
        console.log(Arduino.FindPath(this.vendorId, this.productId));
        Arduino.FindPath(this.vendorId, this.productId)
          .then(path => Arduino.OpenPath(path, baudRate))
          .then(port => openPort(port, resolve))
          .catch(err => reject(err));
      } else {
        // reject with no path or VID/PID set
        reject('Attempted to open port with no path or VID/PID set');
      }
    });
  }

  _onData(data) {
  	console.log(data);
  }

  send(key, value) {
    if (this.log)
      console.log(`> {${key}:${value}}`);
    this.port.write(`{${key}:${value}}`);
  }
}

/* ~~~~~~~~~~~~~~~~ arduino types ~~~~~~~~~~~~~~~~ */

class MetroMini extends Arduino {
  constructor() {
    super({ vendorId: '10c4', productId: 'ea60' });
  }
}

class Mega extends Arduino {
  constructor() {
    super({ vendorId: '2341', productId: '0042' });
  }
}

Arduino.MetroMini = MetroMini;
Arduino.Mega = Mega;

/* ~~~~~~~~~~~~~~~~ export ~~~~~~~~~~~~~~~~ */

module.exports = Arduino;
