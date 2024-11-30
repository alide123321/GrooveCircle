const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid)
		return res.status(400).json({
			errmsg: 'userid is required',
		});

	let fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	let userinfo = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions);
	if (!userinfo.ok)
		return res.status(404).json({
			errmsg: 'User not found',
		});

	userinfo = (await userinfo.json()).user;

	let response = await fetch('https://api.spotify.com/v1/users/' + userid, {
		headers: {
			Authorization: 'Bearer ' + userinfo.spotify_info.access_token,
		},
	});
	if (response.ok) {
		response = await response.json();
		if (userinfo.spotify_info.profile_image !== response.images[0]?.url) {
			userinfo.spotify_info.profile_image = response.images[0]?.url;
			fetchOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					userid: userid,
				},
				body: JSON.stringify({
					icon: response.images[0]?.url,
				}),
			};

			fetch(`http://localhost:${process.env.PORT}/setUserIcon`, fetchOptions);
		}
	}

	res.status(200).json({
		userIcon: userinfo.spotify_info.profile_image || '/images/default-profile.png',
	});
});

module.exports = router;
