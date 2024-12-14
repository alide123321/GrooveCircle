const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// POST route for adding a friend
router.post('/', async (req, res) => {
	const { userid, friendid } = req.headers;

	if (!userid || !friendid)
		return res.status(400).send({
			errmsg: 'userid and friendid are required',
		});

	if (userid === friendid)
		return res.status(400).send({
			errmsg: 'User cannot add themselves as a friend',
		});

	let GetfetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};
	let PostFetchOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
			friendid: friendid,
		},
	};
	let DeletefetchOptions = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
			friendid: friendid,
		},
	};

	let response = await fetch(`http://localhost:${process.env.PORT}/FriendRequests`, GetfetchOptions);
	if (!response.ok) return res.status(404).json({ errmsg: 'issue with Users pending friends list' });
	response = await response.json();

	if (!response?.pending_friends_list?.includes(friendid))
		return res.status(400).json({ errmsg: `You do not have a pending request with this user` });

	response = await fetch(`http://localhost:${process.env.PORT}/Friends`, GetfetchOptions);
	if (!response.ok) return res.status(404).json({ errmsg: 'issue with finding Users friends list' });
	response = await response.json();

	if (response?.friends_list?.includes(friendid))
		return res.status(400).json({ errmsg: `You are already friends with this user` });

	fetch(`http://localhost:${process.env.PORT}/removePendingFriend`, DeletefetchOptions);
	let finalRes = await fetch(`http://localhost:${process.env.PORT}/addFriend`, PostFetchOptions);
	if (!finalRes.ok) return res.status(404).json({ errmsg: 'issue with adding friend' });
	finalRes = await finalRes.json();

	res.status(200).json({ message: finalRes.message });
});

module.exports = router;
