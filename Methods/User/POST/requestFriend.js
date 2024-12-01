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

	let fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: friendid,
		},
	};

	// Fetch friend data

	let friend_response = await fetch(`http://localhost:${process.env.PORT}/FriendRequests`, fetchOptions);
	if (!friend_response.ok) return res.status(404).json({ errmsg: 'issue with finding friends FriendRequests list' });
	friend_response = await friend_response.json();

	if (friend_response.pending_friends_list.includes(userid))
		return res.status(400).json({ errmsg: `You already have a pending request with this user` });

	fetchOptions.headers.userid = userid;
	let response = await fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions);
	if (!response.ok) return res.status(404).json({ errmsg: 'issue with finding Users friends list' });
	response = await response.json();

	if (response.friendsList.includes(friendid))
		return res.status(400).json({ errmsg: `You are already friends with this user` });

	response = await fetch(`http://localhost:${process.env.PORT}/FriendRequests`, fetchOptions);
	if (!response.ok) return res.status(404).json({ errmsg: 'issue with finding Users FriendRequests list' });
	response = await response.json();
	console.log(response.pending_friends_list);

	if (response.pending_friends_list.includes(friendid)) {
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
		console.log('deleting pending friend request');
		fetch(`http://localhost:${process.env.PORT}/removePendingFriend`, DeletefetchOptions);
		let addFriendRes = await fetch(`http://localhost:${process.env.PORT}/addfriend`, PostFetchOptions);
		if (!addFriendRes.ok) return res.status(404).json({ errmsg: 'issue with adding friend' });
		addFriendRes = await addFriendRes.json();

		return addFriendRes.message;
	}
	const users = database.collection('users');

	await users.updateOne({ 'spotify_info.id': friendid }, { $push: { pending_friends_list: userid } });

	res.status(200).json({ message: `User with ID '${userid}' requested to be friends with '${friendid}'` });
});

module.exports = router;
