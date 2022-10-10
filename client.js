const { Client } = require('node-osc');
const { RaccoonAnimation } = require('./AnimalAnimations.js');

animation = RaccoonAnimation;

const client = new Client('127.0.0.1', 7000);
animation.Loop(client, () => console.log('looped'));

setTimeout(() => {
	animation.Play(client, (time) => {
		console.log(time);
		client.close()
	})}, 
	1000
);
