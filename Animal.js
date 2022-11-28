// this works fine but eslint complains for some reason??
const Osc = require('node-osc'); // eslint-disable-line import/no-unresolved

const { OSC_ADDRESS, OSC_PORT } = process.env;
const Resolume = new Osc.Client(OSC_ADDRESS, OSC_PORT);

const {
  SparrowAnimation, RatAnimation,
  RaccoonAnimation, PigeonAnimation,
  FalconAnimation,
} = require('./AnimalAnimations');
const Electrode = require('./Electrode');

let allBlocked = false;

class Animal {
  constructor(resolume, animation, index) {
    this.resolume = resolume;
    this.animation = animation;
    this.electrode = new Electrode(
      index,
      () => this.OnTouch(),
    );
    this.blocked = false;
  }

  OnTouch() {
    if ((!this.blocked) && (!allBlocked)) this.Play();
  }

  TriggerLoop() {
    if ((!this.blocked) && (!allBlocked)) this.Loop();
  }

  Update(data) {
    this.electrode.Update(data);
  }

  Play() {
    this.animation.Play(
      this.resolume,
      (time) => {
        this.blocked = true;
        allBlocked = true;
        setTimeout(() => { this.blocked = false; }, 1000 * time);
        setTimeout(() => { allBlocked = false; }, 3000);
      },
    );
  }

  Loop() {
    this.animation.Loop(this.resolume, () => {});
  }
}

module.exports.Sparrow = new Animal(Resolume, SparrowAnimation, 5);
module.exports.Rat = new Animal(Resolume, RatAnimation, 1);
module.exports.Raccoon = new Animal(Resolume, RaccoonAnimation, 2);
module.exports.Pigeon = new Animal(Resolume, PigeonAnimation, 4);
module.exports.Falcon = new Animal(Resolume, FalconAnimation, 3);
