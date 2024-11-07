const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');

// delete route for unblocking a user
router.delete('/', async (req, res) => {
	const users = database.collection('users');
	const { userid, blockedid } = req.headers;

	if (!userid || !blockedid)
		return res.status(400).send({
			errmsg: 'userid and blockedid are required',
		});

	if (userid === blockedid)
		return res.status(400).send({
			errmsg: 'User cannot unblock themselves',
		});

	let fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	let response = await fetch(`http://localhost:${process.env.PORT}/Blocked`, fetchOptions).then((response) =>
		response.json()
	);

	if (!response.blockedlist)
		return res.status(404).send({
			errmsg: 'User not found',
		});

	users.updateOne({ 'spotify_info.id': userid }, { $pull: { blocked_list: blockedid } });

	res.status(200).send(`User with ID \'${userid}\' unblocked user with ID \'${blockedid}\'`);
});

module.exports = router;
