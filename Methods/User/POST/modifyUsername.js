const express = require('express');
const { database } = require('../../../dbClient');
const router = express.Router();

// POST route for modifying a user
router.post('/', async (req, res) => {
	const { userid, newusername } = req.headers;

	// Logic for modifying the user
	if (!userid || !newusername)
		return res.status(400).json({
			errmsg: 'userid and new username are required',
		});

	const users = database.collection('users');
	const changed = await users.updateOne({ 'spotify_info.id': userid }, { $set: { username: newusername } });

	if (!changed)
		return res.status(404).json({
			errmsg: `User with ID ${userid} not found`,
		});

	res.status(200).send(`User with ID ${userid} modified to have username ${newusername}.`);
});

module.exports = router;
