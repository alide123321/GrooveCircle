const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// delete route for removing a friend
router.delete('/', async (req, res) => {
	const users = database.collection('users');
	const { userid, friendid } = req.headers;

	if (!userid || !friendid)
		return res.status(400).send({
			errmsg: 'userid and friendid are required',
		});

	if (userid === friendid)
		return res.status(400).send({
			errmsg: 'User cannot add themselves as a friend',
		});

	let fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	let response = await fetch(`http://localhost:${process.env.PORT}/user`, fetchOptions);
	if (response.status !== 200) {
		return res.status(404).send({
			errmsg: 'User not found',
		});
	}

	fetchOptions.headers.userid = friendid;
	response = await fetch(`http://localhost:${process.env.PORT}/user`, fetchOptions);
	if (response.status !== 200) {
		return res.status(404).send({
			errmsg: 'User not found',
		});
	}

	await users.updateOne({ 'spotify_info.id': userid }, { $pull: { friends_list: friendid } });

	res.status(200).send(`User with ID \'${userid}\' removed \'${friendid}\' as a friend`);
});

module.exports = router;
