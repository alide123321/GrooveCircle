const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// route for moving to song match queue
router.get('/', async (req, res) => {
	const { albumid } = req.headers;

	// check if userid and songid are provided
	if (!albumid) {
		return res.status(400).json({
			errmsg: 'userid and albumid are required',
		});
	}

	const queues = database.collection('albumQueue');

	// Check if song is already in queue
	const existingEntry = await queues.findOne({ albumID: albumid });

	// send response
	res.status(200).json({
		queue: existingEntry,
	});
});

module.exports = router;
