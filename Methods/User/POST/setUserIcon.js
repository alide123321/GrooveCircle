const express = require('express');
const router = express.Router();
router.use(express.json());
const { database } = require('../../../dbClient');

// POST route for creating a user
router.post('/', async (req, res) => {
	// get user to link with spotify api
	//link with datebase and reuturn user id
	const { userid } = req.headers;
	const { icon } = req.body;

	if (!userid || !icon)
		return res.status(400).send({
			errmsg: 'userid and icon are required',
		});

	const users = database.collection('users');
	await users.updateOne({ 'spotify_info.id': userid }, { $set: { 'spotify_info.profile_image': icon } });

	res.status(200).send('UserIcon changed sucsessfully successfully');
});

module.exports = router;
