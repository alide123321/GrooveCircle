const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');

// POST route for moving to song match queue
router.post('/', async (req, res) => {
	const { userid, songid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !songid) {
		return res.status(400).json({
			errmsg: 'userid and songid are required',
		});
	}

	const queues = database.collection('songQueue');

	let fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			songid: songid,
		},
	};

	const existingEntry = await fetch(`http://localhost:${process.env.PORT}/SongQueue`, fetchOptions).then((response) =>
		response.json()
	);

	if (!existingEntry || !existingEntry.queue) {
		await queues.insertOne({
			songID: songid,
			userids: [userid],
		});

		return res.status(200).json({
			message: `user with ID ${userid} added to song queue for song ${songid}`,
		});
	}

	// if user is already in queue, send error
	if (existingEntry.queue.userids.includes(userid)) {
		return res.status(400).json({
			errmsg: `User ${userid} is already in queue for song ${songid}`,
		});
	}

	// Add user to song queue
	await queues.updateOne({ songID: songid }, { $push: { userids: userid } });

	// send response
	res.status(200).json({
		message: `user with ID ${userid} added to song queue for song ${songid}`,
	});
});

module.exports = router;
