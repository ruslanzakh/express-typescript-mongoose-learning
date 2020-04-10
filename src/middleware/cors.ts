import Cors, { CorsOptionsDelegate } from 'cors';

const whitelist = [
	'http://localhost:3000',
	'https://localhost:3443',
];

const corcOptionsDelegate: CorsOptionsDelegate = (req, callback) => {
	let corsOptions;
	const Origin = req.header('Origin');
	if(Origin && whitelist.indexOf(Origin) !== -1) {
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}

	callback(null, corsOptions);
}

export const cors = Cors();
export const corsWithOptions = Cors(corcOptionsDelegate);

