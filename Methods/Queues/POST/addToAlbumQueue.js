const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// POST route for moving to song match queue
router.post('/', async (req, res) => {
	const { userid, albumid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !albumid) {
		return res.status(400).json({
			errmsg: 'userid and albumid are required',
		});
	}

	const queues = database.collection('AlbumQueue');

	const fetchOptions = {
		method: 'GET',
		headers: {
			albumid,
		},
	};

	// Check if user is already in queue
	const existingEntry = await fetch(`http://localhost:${process.env.PORT}/AlbumQueue`, fetchOptions).then((response) =>
		response.json()
	);

	if (!existingEntry || !existingEntry.queue) {
		await queues.insertOne({
			albumID: albumid,
			userids: [userid],
		});

		return res.status(200).json({
			message: `user with ID ${userid} added to Album queue for song ${albumid}`,
		});
	}

	// if user is already in queue, send error
	if (existingEntry.queue.userids.includes(userid)) {
		return res.status(400).json({
			errmsg: `User ${userid} is already in queue for album ${albumid}`,
		});
	}

	// Add user to song queue
	await queues.updateOne({ albumID: albumid }, { $push: { userids: userid } });

	// send response
	res.status(200).json({
		message: `user with ID ${userid} added to album queue for album ${albumid}`,
	});
});

module.exports = router;
