const Osc = require('node-osc');

const TouchBoard = require('./TouchBoard.js');
const Parser = require('./Parser.js');
const { 
	SparrowAnimation, RatAnimation,
	RaccoonAnimation, PigeonAnimation, 
	FalconAnimation,
} = require('./AnimalAnimations.js');
const Electrode = require('./Electrode.js');

async function main() {
	const resolume = new Osc.Client('127.0.0.1', 7000);
	
	
	const SparrowElectrode = new Electrode(
		5, () => SparrowAnimation.Play(resolume, time => SparrowElectrode.Block(time))
	);
	const RatElectrode = new Electrode(
		1, () => RatAnimation.Play(resolume, time => RatElectrode.Block(time))
	)
	const RaccoonElectrode = new Electrode(
		2, () => RaccoonAnimation.Play(resolume, time => RaccoonElectrode.Block(time))
	)
	const PigeonElectrode = new Electrode(
		4, () => PigeonAnimation.Play(resolume, time => PigeonElectrode.Block(time))
	)
	const FalconElectrode = new Electrode(
		3, () => FalconAnimation.Play(resolume, time => FalconElectrode.Block(time))
	)
	
	
	const touchBoard = await TouchBoard();
	const parser = touchBoard.pipe(new Parser());
	
	parser.on('data', (data) => {
		console.log(data);
		SparrowElectrode.Update(data);
		RatElectrode.Update(data);
		RaccoonElectrode.Update(data);
		PigeonElectrode.Update(data);
		FalconElectrode.Update(data);
	});
}


main();
