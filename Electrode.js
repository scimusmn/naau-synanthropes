'use strict';


class Electrode {
	constructor(index, callback) {
		this.index = index;
		this.callback = callback;
		this.touched = false;
		this.blocked = false;
	}


	Update(data) {
		const frame = data[this.index];
		if (frame.touch === '1') {
			if (this.touched == false && !this.blocked) {
				console.log(`${this.index} touched`);
				this.callback();
			}
			this.touched = true;
		}
		else if (frame.touch === '0') {
			this.touched = false;
		}
	}


	Block(time) {
		this.blocked = true;
		setTimeout(() => this.blocked = false, time * 1000);
	}
}


module.exports = Electrode;
