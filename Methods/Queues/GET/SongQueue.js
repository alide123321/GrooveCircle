const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// GET route for moving to song match queue
router.get('/', async (req, res) => {
	const { songid } = req.headers;

	// check if userid and songid are provided
	if (!songid) {
		return res.status(400).json({
			errmsg: 'userid and songid are required',
		});
	}

	const queues = database.collection('SongQueue');

	// Check if song is already in queue
	const existingEntry = await queues.findOne({ songID: songid });

	// send response
	res.status(200).json({
		queue: existingEntry,
	});
});

module.exports = router;
