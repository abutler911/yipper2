const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();

const db = monk(
	process.env.MONGO_URI ||
		'mongodb+srv://abutler911:abutler911@yipper-db.fg8vf.mongodb.net/<dbname>?retryWrites=true&w=majority'
);
const yips = db.get('yips');
const filter = new Filter();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json('Yipper!🐶');
});

app.get('/yips', (req, res) => {
	yips.find().then((yips) => {
		res.json(yips);
	});
});

function isValidYip(yip) {
	return yip.name && yip.name.toString().trim() !== ' ' && yip.content && yip.content.toString().trim() !== ' ';
}

app.use(
	rateLimit({
		windowMs: 5 * 1000,
		max: 1
	})
);

app.post('/yips', (req, res) => {
	if (isValidYip(req.body)) {
		//insert into DB
		const yip = {
			name: filter.clean(req.body.name.toString()),
			content: filter.clean(req.body.content.toString()),
			created: new Date()
		};
		yips.insert(yip).then((createdYip) => {
			res.json(createdYip);
		});
	} else {
		res.status(422);
		res.json({
			message: 'Hey! Name and content required!'
		});
	}
	// console.log(req.body);
});

app.listen(5000, () => {
	console.log('Listening on https://localhost:5000');
});
