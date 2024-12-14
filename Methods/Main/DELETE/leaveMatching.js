const express = require('express');
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');
const router = express.Router();

router.delete('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid) return res.status(400).send('Missing userid');

	// refactored to use getMatching endpoint
	const matchingResponse = await fetch(`http://localhost:${process.env.PORT}/getMatching`, {
        headers: { userid }
    });

	// If user is not in queue (208) or there's an error fetching user (404)
    if (matchingResponse.status === 208) {
        return res.status(208).send('User is already not in a queue');
    }
    if (matchingResponse.status === 404) {
        return res.status(404).send('issue with fetching user');
    }

	// If user is in queue (200), remove them from queue
	const users = database.collection('users');
	await users.updateOne({ 'spotify_info.id': userid }, { $set: { isInQueue: false } });

	res.status(200).send('User left matching successfully');
});

module.exports = router;
