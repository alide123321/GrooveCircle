const express = require('express');
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
	const { chatroomid } = req.headers;

	if (!chatroomid) {
		return res.status(400).json({ error: 'Chatroom ID is required' });
	}

	try {
		const chatroomCollection = database.collection('chatrooms');
		const chatroom = await chatroomCollection.findOne({
			_id: new ObjectId(chatroomid),
		});

		if (!chatroom) {
			return res.status(404).json({ error: 'Chatroom not found' });
		}

		res.status(200).json({
			messages: chatroom.messages || [],
		});
	} catch (error) {
		console.error('Error fetching chatroom:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});
// New endpoint to retrieve participants for a group chat
router.get('/members', async (req, res) => {
	const { chatroomid } = req.headers;

	if (!chatroomid) {
		return res.status(400).json({ error: 'Chatroom ID is required' });
	}

	try {
		const chatroomCollection = database.collection('chatrooms');
		const chatroom = await chatroomCollection.findOne({
			_id: new ObjectId(chatroomid),
		});

		if (!chatroom || !chatroom.participants) {
			return res.status(404).json({ error: 'Chatroom not found or no participants available' });
		}

		// Retrieve detailed participant info
		const participantDetails = await Promise.all(
			chatroom.participants.map(async (participantId) => {
				try {
					const fetchOptions = {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							userid: participantId,
						},
					};

					let response = await fetch(`http://localhost:${process.env.PORT}/Username`, fetchOptions);
					if (!response.ok) {
						throw new Error('Failed to fetch username');
					}
					response = await response.json();
					let username = response.username;

					response = await fetch(`http://localhost:${process.env.PORT}/UserIcon`, fetchOptions);
					if (!response.ok) {
						throw new Error('Failed to fetch userIcon');
					}
					response = await response.json();

					return {
						userid: participantId,
						username: username ? username : 'Unknown User',
						userIcon: response.userIcon,
					};
				} catch (err) {
					console.error(`Error fetching user info for participant: ${participantId}`, err);
					return {
						userid: participantId,
						username: 'Unknown User',
					};
				}
			})
		);

		res.status(200).json({ members: participantDetails });
	} catch (error) {
		console.error('Error fetching participants:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;
