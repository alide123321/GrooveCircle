const express = require('express');
const crypto = require('crypto');
const querystring = require('querystring');
const router = express.Router();

router.get('/', function (req, res) {
	// generate random state key
	const state = crypto.randomBytes(60).toString('hex').slice(0, 16);
	// store state key in cookie
	res.cookie(process.env.SPOTIFY_STATE_KEY, state);
	const scope =
		'user-read-private user-read-email user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative playlist-read-private user-read-playback-position user-top-read user-read-recently-played user-library-read';

	// redirect to spotify login page
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope: scope,
				//redirect_uri: `http://localhost:${process.env.PORT}/${process.env.SPOTIFY_REDIRECT_URI}`,
				redirect_uri: `https://vjc32q5d-${process.env.PORT}.use.devtunnels.ms/${process.env.SPOTIFY_REDIRECT_URI}`,
				state: state,
			})
	);
});

module.exports = router;
