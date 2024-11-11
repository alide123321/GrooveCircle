const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();

app.use(cookieParser());

router.post('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid) return res.status(400).send('No user id');
});

module.exports = router;
