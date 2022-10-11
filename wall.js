const Osc = require('node-osc');

const TouchBoard = require('./TouchBoard.js');
const Parser = require('./Parser.js');

const { Sparrow, Rat, Raccoon, Pigeon, Falcon } = require('./Animal.js');


function RandomChoice(items) {
	return items[Math.floor(Math.random() * items.length)];
}


function TriggerLoop() {
	const choice = RandomChoice(
		[ Sparrow, Rat, Raccoon, Pigeon, Falcon ]
	);
	choice.TriggerLoop();
	const time = 1 + (2*Math.random());
	setTimeout(TriggerLoop, 1000 * time);
}


async function main() {
	const touchBoard = await TouchBoard();
	const parser = touchBoard.pipe(new Parser());
	
	parser.on('data', (data) => {
		console.log(data);
		Sparrow.Update(data);
		Rat.Update(data);
		Raccoon.Update(data);
		Pigeon.Update(data);
		Falcon.Update(data);
	});

	TriggerLoop();
}


main();
