const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

router.use(express.json());

//POST route for creating a chatroom
router.post('/', async (req, res) => {
	const { userids } = req.body;

	if (!userids || !Array.isArray(userids) || userids.length !== 3) {
		return res.status(400).json({
			errmsg: 'userids is required, must be an array, and contain exactly 3 user IDs',
		});
	}

	try {
		//loops through each user ID and fetch user data from the internal service
		for (const id of userids) {
			const response = await fetch(`http://localhost:3000/user`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json', userid: id },
			});

			if (!response.ok) {
				return res.status(404).json({
					errmsg: `User with ID ${id} not found or error fetching user data`,
				});
			}
		}

		const chatroomsCollection = database.collection('chatrooms');

		//this is to check if a chatroom already exists with the same participants
		const existingChatroom = await chatroomsCollection.findOne({
			participants: { $all: userids },
		});

		if (existingChatroom)
			return res.status(200).json({
				message: `Chatroom created successfully.`,
				chatroomId: existingChatroom._id,
			});

		//this is to create a new chatroom with the retrieved user data
		const chatroom = {
			participants: userids,
			messages: [], //empty array of objects (this is how we want it stored, not like before)
			Chatroom: true,
			created_at: new Date(),
		};

		const result = await chatroomsCollection.insertOne(chatroom);

		res.status(200).json({
			message: `Chatroom created successfully.`,
			chatroomId: result.insertedId,
		});

		await new Promise((resolve) => setTimeout(resolve, 300 * 1000)); // after 300 seconds (5 mins), delete the chatroom
		chatroomsCollection.deleteOne({ _id: result.insertedId });
	} catch (error) {
		console.error('Error creating chatroom:', error);
		res.status(500).json({
			errmsg: `Error creating chatroom: ${error.message}`,
		});
	}
});

module.exports = router;
