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

exports.SparrowAnimation = new AnimalAnimation({
  loop: '/composition/layers/10/clips/2/connect',
  touch: '/composition/layers/9/clips/1/connect',
  anim: '/composition/layers/10/clips/1/connect',
  timeout: 16.267,
});

exports.RatAnimation = new AnimalAnimation({
  loop: null,
  touch: '/composition/layers/7/clips/1/connect',
  anim: '/composition/layers/8/clips/1/connect',
  timeout: 7.341,
});

exports.RaccoonAnimation = new AnimalAnimation({
  loop: '/composition/layers/6/clips/2/connect',
  touch: '/composition/layers/5/clips/1/connect',
  anim: '/composition/layers/6/clips/1/connect',
  timeout: 13.167,
});

exports.PigeonAnimation = new AnimalAnimation({
  loop: '/composition/layers/4/clips/2/connect',
  touch: '/composition/layers/3/clips/1/connect',
  anim: '/composition/layers/4/clips/1/connect',
  timeout: 5.9,
});

exports.FalconAnimation = new AnimalAnimation({
  loop: '/composition/layers/2/clips/2/connect',
  touch: '/composition/layers/1/clips/1/connect',
  anim: '/composition/layers/2/clips/1/connect',
  timeout: 5.672,
});
