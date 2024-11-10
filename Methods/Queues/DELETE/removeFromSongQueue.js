const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

// GET route for moving to song match queue
router.get('/', async (req, res) => {
	const { userid, songid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !songid) {
		return res.status(400).json({
			errmsg: 'userid and songid are required',
		});
	}

	const queues = database.collection('songQueue');

	await queues.updateOne({ songID: artistid }, { $pull: { userids: userid } });

	res.status(200).json({
		message: `user with ID ${userid} removed from artist queue for artist ${artistid}`,
	});
});

module.exports = router;