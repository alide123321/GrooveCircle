const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');

router.delete('/', async (req, res) => {
	const { userid, artistid } = req.headers;

	// check if userid and songid are provided
	if (!userid || !artistid) {
		return res.status(400).json({
			errmsg: 'userid and artistid are required',
		});
	}

	const queues = database.collection('artistQueue');

	await queues.updateOne({ artistID: artistid }, { $pull: { userids: userid } });

	res.status(200).json({
		message: `user with ID ${userid} removed from artist queue for artist ${artistid}`,
	});
});

module.exports = router;
