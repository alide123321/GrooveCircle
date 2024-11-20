const express = require('express');
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid) {
		return res.status(400).json({
			errmsg: 'userid is required',
		});
	}

	console.log('userid:', userid);

	const users = database.collection('users');
	let user = await users.findOne({ 'spotify_info.id': userid });

	if (!user) {
		return res.status(404).json({
			errmsg: 'User not found',
		});
	}

	let time = Number(new Date(Date.now()).getTime());

	if (user.spotify_info.access_token_expiration <= time) {
		console.log('refreshing token');
		console.log('time:', time);
		console.log('user.spotify_info.access_token_expiration:', user.spotify_info.access_token_expiration);
		const fetchOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		const response = await fetch(
			`http://localhost:${process.env.PORT}/refresh_token?userid=${userid}&refresh_token=${user.spotify_info.refresh_token}`,
			fetchOptions
		);

		if (!response.ok) {
			return res.status(500).json({
				errmsg: 'Error refreshing token',
			});
		}

		const body = await response.json();

		users.updateOne(
			{ 'spotify_info.id': userid },
			{
				$set: {
					'spotify_info.access_token': body.access_token,
					'spotify_info.access_token_expiration': time,
				},
			}
		);

		user.spotify_info.access_token = body.access_token;
		user.spotify_info.access_token_expiration = time;

		if (req.cookies.spotify_id && userid === req.cookies.spotify_id) {
			res.cookie('access_token', body.access_token, { maxAge: body.expires_in * 1000, httpOnly: false });
			res.cookie('refresh_token', body.refresh_token, { maxAge: body.expires_in * 1000, httpOnly: false });
			res.cookie('spotify_id', user.spotify_info.id, { maxAge: body.expires_in * 1000, httpOnly: false });
		}
	}

	res.status(200).json({
		user: user,
	});
});

module.exports = router;
