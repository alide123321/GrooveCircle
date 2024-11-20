const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();

app.use(cookieParser());

router.post('/', async (req, res) => {
	const { userid } = req.headers;
	const queueNames = ['Song', 'Album', 'Artist'];
	let state = queueNames[0];

	if (!userid) return res.status(400).send('Missing userid');

	const GetfetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
		},
	};

	let currSong = await fetch(`http://localhost:${process.env.PORT}/CurrentListingTo`, GetfetchOptions);
	if (!currSong.ok) return res.status(404).send('issue with fetching current song');
	currSong = (await currSong.json()).currentListeningTo;

	const PostfetchOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
			songid: currSong.songId,
			artistid: currSong.artistId,
			albumid: currSong.albumId,
		},
	};
	const DeletefetchOptions = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
			songid: currSong.songId,
			artistid: currSong.artistId,
			albumid: currSong.albumId,
		},
	};

	async function matched(matchQueue) {
		// Remove the user from the Queue

		await new Promise((resolve) => setTimeout(resolve, 6 * 1000)); // after 6 seconds, remove the user from the queue

		fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);

		// create Chatroom and return the chatroom id
		const CreateChatroomfetchOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userids: matchQueue.userids }),
		};

		const Chatroom = await fetch(
			`http://localhost:${process.env.PORT}/createChatroom`,
			CreateChatroomfetchOptions
		).then((response) => response.json());

		if (!Chatroom.chatroomId) return res.status(404).send('issue with creating chatroom');
		return res.status(200).send({ msg: 'Match found', chatroomId: `${Chatroom.chatroomId}` });
	}

	async function addToQueue() {
		let addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addTo${state}Queue`, PostfetchOptions);
		if (!addToQueueResponse.ok) {
			console.log(addToQueueResponse);
			res.status(404).send(`issue with adding user to ${state} queue`);
			return false;
		}
		return true;
	}

	async function removeFromQueue() {
		fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);
	}

	for (let i = 0; i < queueNames.length; i++) {
		state = queueNames[i];
		if (!(await addToQueue())) return;
		await checkMatch(userid, state, currSong).then((match) => {
			if (match) return matched(match);
		});

		if (i !== 2) removeFromQueue();
	}

	while (true) {
		await checkMatch(userid, state, currSong).then((match) => {
			if (match) return matched(match);
		});
	}
});

async function checkMatch(userid, state, currSong) {
	const fetchOptions = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			userid: userid,
			songid: currSong.songId,
			artistid: currSong.artistId,
			albumid: currSong.albumId,
		},
	};

	const queueLength = 60; // in seconds
	const checkEvery = 5; // in seconds

	for (let i = 0; i < queueLength; i += checkEvery) {
		const Queue = await fetch(`http://localhost:${process.env.PORT}/${state}Queue`, fetchOptions).then((res) =>
			res.json()
		);

		if (Queue.queue && Queue.queue.userids.length >= 3) return Queue.queue;
		await new Promise((resolve) => setTimeout(resolve, checkEvery * 1000));
	}

	return false;
}

module.exports = router;
