const express = require('express');
const router = express.Router();
router.use(express.json());
const { database } = require('../../../dbClient');

// POST route for creating a user
router.post('/', (req, res) => {
	// get user to link with spotify api
	//link with datebase and reuturn user id

	const users = database.collection('users');

	const user = users
		.insertOne({
			friends_list: [],
			pending_friends_list: [],
			message_list: [],
			blocked_list: [],
			activitie_list: [],
			username: req.body.username,
			isInQueue: false,
			spotify_info: {
				id: req.body.id,
				refresh_token: req.body.refresh_token,
				access_token: req.body.access_token,
				access_token_expiration: Number(req.body.access_token_expiration),
				email: req.body.email,
				profile_image: req.body.profile_image,
				Country: req.body.Country,
			},
		})
		.catch((error) => {
			console.error('Error inserting user:', error);
			res.status(500).send('Error inserting user');
		});

	res.status(200).send('User created successfully');
});

module.exports = router;
