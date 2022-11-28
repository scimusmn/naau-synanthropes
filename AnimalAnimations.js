class AnimalAnimation {
  constructor(obj) {
    this.loopAddress = obj.loop;
    this.touchAddress = obj.touch;
    this.animationAddress = obj.anim;
    this.timeout = obj.timeout;
  }

  Loop(client, cb) {
    if (!this.loopAddress) return;
    client.send(this.loopAddress, 1, () => cb());
  }

  Play(client, cb) {
    client.send(this.touchAddress, 1, () => {});
    client.send(this.animationAddress, 1, () => cb(this.timeout));
  }
}

const { SPARROW_LOOP, SPARROW_TOUCH, SPARROW_ANIM, SPARROW_TIMEOUT } = process.env;
exports.SparrowAnimation = new AnimalAnimation({
  loop: SPARROW_LOOP,
  touch: SPARROW_TOUCH,
  anim: SPARROW_ANIM,
  timeout: SPARROW_TIMEOUT,
});

const { RAT_LOOP, RAT_TOUCH, RAT_ANIM, RAT_TIMEOUT } = process.env;
exports.RatAnimation = new AnimalAnimation({
  loop: RAT_LOOP,
  touch: RAT_TOUCH,
  anim: RAT_ANIM,
  timeout: RAT_TIMEOUT,
});

const { RACCOON_LOOP, RACCOON_TOUCH, RACCOON_ANIM, RACCOON_TIMEOUT } = process.env;
exports.RaccoonAnimation = new AnimalAnimation({
  loop: RACCOON_LOOP,
  touch: RACCOON_TOUCH,
  anim: RACCOON_ANIM,
  timeout: RACCOON_TIMEOUT,
});

const { PIGEON_LOOP, PIGEON_TOUCH, PIGEON_ANIM, PIGEON_TIMEOUT } = process.env;
exports.PigeonAnimation = new AnimalAnimation({
  loop: PIGEON_LOOP,
  touch: PIGEON_TOUCH,
  anim: PIGEON_ANIM,
  timeout: PIGEON_TIMEOUT,
});

const { FALCON_LOOP, FALCON_TOUCH, FALCON_ANIM, FALCON_TIMEOUT } = process.env;
exports.FalconAnimation = new AnimalAnimation({
  loop: FALCON_LOOP,
  touch: FALCON_TOUCH,
  anim: FALCON_ANIM,
  timeout: FALCON_TIMEOUT,
});
