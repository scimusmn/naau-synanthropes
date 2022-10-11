const Osc = require('node-osc');
const resolume = new Osc.Client('127.0.0.1', 7000);


const {
        SparrowAnimation, RatAnimation,
        RaccoonAnimation, PigeonAnimation,
        FalconAnimation,
} = require('./AnimalAnimations.js');
const Electrode = require('./Electrode.js');


class Animal {
	constructor(resolume, animation, index) {
		this.resolume = resolume;
		this.animation = animation;
		this.electrode = new Electrode(
			index,
			() => this.OnTouch()
		);
		this.blocked = false;
	}


	OnTouch() {
		if (!this.blocked) this.Play();
	}


	TriggerLoop() {
		if (!this.blocked) this.Loop();
	}
	

	Update(data) {
		this.electrode.Update(data);
	}


	Play() {
		this.animation.Play(
			this.resolume,
			time => {
				this.blocked = true;
				setTimeout(() => this.blocked = false, 1000 * time);
			}
		);
	}


	Loop() {
		this.animation.Loop(this.resolume, () => {});
	}
	
}


module.exports.Sparrow = new Animal(resolume, SparrowAnimation, 5);
module.exports.Rat     = new Animal(resolume, RatAnimation, 1);
module.exports.Raccoon = new Animal(resolume, RaccoonAnimation, 2);
module.exports.Pigeon  = new Animal(resolume, PigeonAnimation, 4);
module.exports.Falcon  = new Animal(resolume, FalconAnimation, 3);
