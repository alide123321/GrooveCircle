const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

//
router.delete('/', async (req, res) => {
	const { userid, albumid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !albumid) {
		return res.status(400).json({
			errmsg: 'userid and albumid are required',
		});
	}

	const queues = database.collection('albumQueue');

	// Check if song is already in queue
	await queues.updateOne({ albumID: albumid }, { $pull: { userids: userid } });

	res.status(200).json({
		message: `user with ID ${userid} removed from album queue for album ${albumid}`,
	});
});

module.exports = router;
