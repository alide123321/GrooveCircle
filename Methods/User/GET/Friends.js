const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const app = express();
app.use(express.json());

router.get('/', async (req, res) => {
	const { userid } = req.headers;

	if (!userid)
		return res.status(400).json({
			errmsg: 'userid is required',
		});

	const fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	let userInfo = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions).then((response) =>
		response.json()
	);

	if (!userInfo.user || !userInfo.user.friends_list)
		return res.status(404).json({
			errmsg: 'User not found',
		});

	res.status(200).json({
		friendsList: userInfo.user.friends_list,
	});
});

// NEW: Endpoint for retrieving participants in a group chat (Groove Page)
router.get('/participants', async (req, res) => {
	const { chatroomid, userid } = req.headers;

	if (!chatroomid || !userid) {
		return res.status(400).json({
			errmsg: 'chatroomid and userid are required',
		});
	}

	try {
		const fetchOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				chatroomid: chatroomid,
			},
		};

		const chatroomInfo = await fetch(`http://localhost:${process.env.PORT}/chatroom`, fetchOptions).then((response) =>
			response.json()
		);

		if (!chatroomInfo || !chatroomInfo.participants) {
			return res.status(404).json({
				errmsg: 'Chatroom not found',
			});
		}

		// Filter out the requesting user from participants list
		const otherParticipants = chatroomInfo.participants.filter((participant) => participant !== userid);

		const participantsDetails = await Promise.all(
			otherParticipants.map(async (participantId) => {
				const userInfo = await fetch(`http://localhost:${process.env.PORT}/Username`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						userid: participantId,
					},
				}).then((res) => res.json());

				return {
					id: participantId,
					username: userInfo.username || participantId,
				};
			})
		);

		res.status(200).json({ participants: participantsDetails });
	} catch (error) {
		console.error('Error fetching participants:', error);
		res.status(500).json({
			errmsg: 'Error retrieving participants',
		});
	}
});

module.exports = router;
