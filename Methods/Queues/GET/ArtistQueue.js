const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// GET route for moving to song match queue
router.get('/', async (req, res) => {
	const { artistid } = req.headers;

	// check if userid and songid are provided
	if (!artistid) {
		return res.status(400).json({
			errmsg: 'userid and artistid are required',
		});
	}

	const queues = database.collection('ArtistQueue');

	// Check if song is already in queue
	const existingEntry = await queues.findOne({ artistID: artistid });

	// send response
	res.status(200).json({
		queue: existingEntry,
	});
});

module.exports = router;
