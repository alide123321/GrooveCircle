const express = require('express');
const fetch = require('node-fetch');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const { database } = require('../../../dbClient');

const app = express();
app.use(cookieParser());
const router = express.Router();

router.get('/', async (req, res) => {
	const users = database.collection('users');
	let { userid, refresh_token } = req.query;

	if (!userid || !refresh_token) {
		return res.status(400).json({
			errmsg: 'userid and refresh_token are required',
		});
	}

	const authOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' +
				Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
		},
		body: querystring.stringify({
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		}),
	};

	let post = await fetch('https://accounts.spotify.com/api/token', authOptions)
		.then((response) => response.json())
		.then((body) => {
			if (body.access_token) {
				const { access_token } = body;
				users.updateOne(
					{ 'spotify_info.refresh_token': refresh_token },
					{ $set: { 'spotify_info.access_token': access_token } }
				);
				res.clearCookie('access_token');
				res.cookie('access_token', access_token, { maxAge: 60 * 60000, httpOnly: false });

				res.send({
					access_token: access_token,
					refresh_token: refresh_token,
				});
			}
		})
		.catch((error) => {
			console.error('Error during token refresh:', error);
		});
});

module.exports = router;
