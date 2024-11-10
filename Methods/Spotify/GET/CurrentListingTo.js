const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req, res) => {
	const { userid } = req.headers;

	if (!userid)
		return res.status(400).json({
			errmsg: 'userid and token are required',
		});

	const fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions)
		.then((response) => response.json())
		.then((body) => {
			if (!body.user || !body.user.spotify_info.access_token) throw new Error('User not found');

			const authOptions = {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${body.user.spotify_info.access_token}`,
				},
			};

			fetch('https://api.spotify.com/v1/me/player/currently-playing', authOptions)
				.then((response) => response.json())
				.then((body) => {
					if (!body || !body.is_playing) throw new Error('No song is currently playing');

					const currentListeningTo = {
						songName: body.item.name,
						songId: body.item.id,
						artist: body.item.artists[0].name,
						artistId: body.item.artists[0].id,
						album: body.item.album.name,
						albumId: body.item.album.id,
						albumArt: {
							url: body.item.album.images[0].url,
							height: body.item.album.images[0].height,
							width: body.item.album.images[0].width,
						},
					};

					return res.status(200).json({
						currentListeningTo: currentListeningTo,
					});
				})
				.catch((error) => {
					console.error('Error fetching current listening to:', error);
					return res.status(404).json({
						isPlaying: false,
						errmsg: error.message || 'An error occurred',
					});
				});
		})
		.catch((error) => {
			console.error('Error fetching user:', error);
			return res.status(404).json({
				isPlaying: false,
				errmsg: error.message || 'An error occurred',
			});
		});
});

module.exports = router;
