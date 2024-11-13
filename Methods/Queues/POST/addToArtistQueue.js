const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// POST route for moving to song match queue
router.post('/', async (req, res) => {
	const { userid, artistid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !artistid) {
		return res.status(400).json({
			errmsg: 'userid and artistid are required',
		});
	}

	const queues = database.collection('ArtistQueue');

	const fetchOptions = {
		method: 'GET',
		headers: {
			artistid,
		},
	};

	// Check if song is already in queue
	const existingEntry = await fetch(`http://localhost:${process.env.PORT}/ArtistQueue`, fetchOptions).then((response) =>
		response.json()
	);

	if (!existingEntry || !existingEntry.queue) {
		await queues.insertOne({
			artistID: artistid,
			userids: [userid],
		});

		return res.status(200).json({
			message: `user with ID ${userid} added to artsit queue for artsit ${artistid}`,
		});
	}

	// if user is already in queue, send error
	if (existingEntry.queue.userids.includes(userid)) {
		return res.status(400).json({
			errmsg: `User ${userid} is already in queue for artsit ${artistid}`,
		});
	}

	// Add user to song queue
	await queues.updateOne({ artistID: artistid }, { $push: { userids: userid } });

	// send response
	res.status(200).json({
		message: `user with ID ${userid} added to artist queue for artsit ${artistid}`,
	});
});

module.exports = router;
