'use strict';


class Electrode {
	constructor(index, callback) {
		this.index = index;
		this.callback = callback;
		this.touched = false;
	}


	Update(data) {
		const frame = data[this.index];
		if (frame.touch === '1') {
			if (this.touched == false) {
				console.log(`${this.index} touched`);
				this.callback();
			}
			this.touched = true;
		}
		else if (frame.touch === '0') {
			this.touched = false;
		}
	}
}


module.exports = Electrode;
