const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// POST route for adding a friend
router.post('/', async (req, res) => {
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

	const response = await fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions);
	if (!response.ok) return res.status(404).json({ errmsg: 'issue with finding Users friends list' });
	const body = await response.json();

	// Fetch friend data
	fetchOptions.headers.userid = friendid;
	const friend_response = await fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions);
	if (!friend_response.ok) return res.status(404).json({ errmsg: 'issue with finding friend friends list' });
	const friend_body = await friend_response.json();

	// Add friend to user's friends list
	if (!body.friendsList.includes(friendid))
		users.updateOne({ 'spotify_info.id': userid }, { $push: { friends_list: friendid } });

	// Add user to friend's friends list
	if (!friend_body.friendsList.includes(userid))
		users.updateOne({ 'spotify_info.id': friendid }, { $push: { friends_list: userid } });

	res.status(200).json({ message: `User with ID '${userid}' added '${friendid}' as a friend` });
});

module.exports = router;
