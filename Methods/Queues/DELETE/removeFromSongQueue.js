const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// GET route for moving to song match queue
router.delete('/', async (req, res) => {
	const { userid, songid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !songid) {
		return res.status(400).json({
			errmsg: 'userid and songid are required',
		});
	}

	const queues = database.collection('SongQueue');

	await queues.updateOne({ songID: songid }, { $pull: { userids: userid } });

	res.status(200).json({
		message: `user with ID ${userid} removed from song queue for song ${songid}`,
	});

	queues.findOne({ songID: songid }).then((result) => {
		if (result?.userids?.length === 0) {
			const fetchOptions = {
				method: 'DELETE',
				headers: {
					queueid: result._id,
					state: 'Song',
				},
			};
			fetch(`http://localhost:${process.env.PORT}/removeQueuefromDB`, fetchOptions);
		}
	});
});

module.exports = router;
