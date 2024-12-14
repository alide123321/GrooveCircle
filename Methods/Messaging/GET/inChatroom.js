const express = require('express');
const { database } = require('../../../dbClient');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid) return res.status(400).json({ errmsg: 'Chatroom ID is required' });

	const chatroomCollection = database.collection('chatrooms');
	const chatroom = await chatroomCollection.findOne({ participants: { $in: [userid] } });

	if (!chatroom?._id) return res.status(404).json({ errmsg: 'User is not in a chatroom ' });

	res.status(200).json({
		chatroomId: chatroom._id,
	});
});

module.exports = router;
