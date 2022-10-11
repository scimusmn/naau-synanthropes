'use strict';

const { Transform } = require('stream');


function ParseChannels(str) {
	const fdatLine = str.match(/FDAT: (.*)/);
	const bvalLine = str.match(/BVAL: (.*)/);
	const diffLine = str.match(/DIFF: (.*)/);
	const touchLine = str.match(/TOUCH: (.*)/);

	const valuesRegex = 
		/(\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+) (\-?\d+)/
	const fdatValues = fdatLine[0].match(valuesRegex);
	const bvalValues = bvalLine[0].match(valuesRegex);
	const diffValues = diffLine[0].match(valuesRegex);
	const touchValues = touchLine[0].match(valuesRegex);

	const channels = [];
	for (let i=0; i<fdatValues.length - 1; i++) {
		const obj = {
			fdat: fdatValues[i+1],
			bval: bvalValues[i+1],
			diff: diffValues[i+1],
			touch: touchValues[i+1],
		};
		// console.log(obj);
		channels.push(obj);
	}

	return channels;
}



const frameRegex = /RTHS:[\s\S]*?TTHS:/gm;

class ElectrodeParser extends Transform {
	constructor(options) {
		super({ objectMode: true });
		this.buffer = Buffer.alloc(0);
	}

	static EatFrame(buf) {
		const str = buf.toString();
		const match = str.match(frameRegex);
		if (match == null)
			// no frame detected, leave buffer unmodified
			return [null, buf];
		// strip buffer up to and including the packet
		if (match.index === undefined)
			match.index = 0;
		buf = buf.slice(match.index + match[0].length);
		
		const channels = ParseChannels(match[0]);
		return [channels, buf];
	}

	_transform(chunk, encoding, cb) {
		let data = Buffer.concat([this.buffer, chunk]);
		let channels;
		[channels, data] = ElectrodeParser.EatFrame(data);
		while(channels != null) {
			this.push(channels);
			[channels, data] = ElectrodeParser.EatFrame(data);
		}
		this.buffer = data;
		cb();
	}
}


module.exports = ElectrodeParser;
