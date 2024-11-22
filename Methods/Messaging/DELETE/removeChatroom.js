const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');
const { ObjectId } = require('mongodb');

router.use(express.json());

//POST route for creating a chatroom
router.delete('/', async (req, res) => {
	let { chatroomid } = req.headers;

	if (!chatroomid) {
		return res.status(400).json({
			errmsg: 'chatroomid is required',
		});
	}
	try {
		chatroomid = new ObjectId(chatroomid);
		const chatroomsCollection = database.collection('chatrooms');
		const user = database.collection('users');

		const chatroom = await chatroomsCollection.findOne({ _id: chatroomid });
		const userids = chatroom.participants;

		chatroomsCollection.deleteOne({ _id: chatroomid });
		userids.forEach(async (userid) => {
			user.updateOne({ 'spotify_info.id': userid }, { $pull: { message_list: chatroomid } });
		});

		return res.status(200).json({
			message: `Chatroom removed successfully.`,
		});
	} catch (error) {
		console.log('3');
		console.log(error);
		return res.status(500).json({
			errmsg: 'Internal server error',
		});
	}
});

module.exports = router;
