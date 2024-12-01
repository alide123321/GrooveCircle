const express = require('express');
const fetch = require('node-fetch');
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

	const queues = database.collection('AlbumQueue');

	// Check if song is already in queue
	await queues.updateOne({ albumID: albumid }, { $pull: { userids: userid } });

	res.status(200).json({
		message: `user with ID ${userid} removed from album queue for album ${albumid}`,
	});

	queues.findOne({ albumID: albumid }).then((result) => {
		if (result?.userids?.length === 0) {
			const fetchOptions = {
				method: 'DELETE',
				headers: {
					queueid: result._id,
					state: 'Album',
				},
			};
			fetch(`http://localhost:${process.env.PORT}/removeQueuefromDB`, fetchOptions);
		}
	});
});

module.exports = router;
