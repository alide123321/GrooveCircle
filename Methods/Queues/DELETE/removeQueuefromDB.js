const express = require('express');
const router = express.Router();
const { database } = require('../../../dbClient');
const { ObjectId } = require('mongodb');

// GET route for moving to song match queue
router.delete('/', async (req, res) => {
	const { queueid, state } = req.headers;

	// check if userid and songid are provided
	if (!queueid || !state) {
		return res.status(400).json({
			errmsg: 'queueid and state are required',
		});
	}

	const queues = database.collection(`${state}Queue`);
	try {
		new ObjectId(queueid);
	} catch (error) {
		return res.status(400).json({
			errmsg: 'queueid must be a 24 character hex string, 12 byte Uint8Array, or an integer',
		});
	}
	await queues.deleteOne({ _id: new ObjectId(queueid) });

	res.status(200).json({
		message: `queue with ID ${queueid} removed from ${state} queue`,
	});
});

module.exports = router;
