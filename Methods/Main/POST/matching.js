const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const { database } = require('../../../dbClient');
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

	// check if user is already in a queue
	let userinfo = await fetch(`http://localhost:${process.env.PORT}/User`, GetfetchOptions);
	if (!userinfo.ok) return res.status(404).send('issue with fetching user');
	userinfo = (await userinfo.json()).user;

	if (userinfo.isInQueue === true) return res.status(409).send('User is already in a queue');
	const users = database.collection('users');
	await users.updateOne({ 'spotify_info.id': userid }, { $set: { isInQueue: true } });

	// get the current song the user is listening to
	let currSong = await fetch(`http://localhost:${process.env.PORT}/CurrentListingTo`, GetfetchOptions);
	if (!currSong.ok) return res.status(404).send('issue with fetching current song');
	currSong = (await currSong.json()).currentListeningTo;

	// fetch options for adding and removing user from queue
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

	// logic for when a match is found
	async function matched(matchQueue) {
		await new Promise((resolve) => setTimeout(resolve, 6 * 1000)); // after 6 seconds, remove the user from the queue too allow for other users to be matched

		fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);
		fetch(`http://localhost:${process.env.PORT}/leaveMatching`, DeletefetchOptions);

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

	let loop = true;

	// add user to queue
	async function addToQueue() {
		let addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addTo${state}Queue`, PostfetchOptions);
		if (!addToQueueResponse.ok) {
			console.log(addToQueueResponse);
			res.status(404).send(`issue with adding user to ${state} queue`);
			fetch(`http://localhost:${process.env.PORT}/leaveMatching`, DeletefetchOptions);
			loop = false;
			return false;
		}
		return true;
	}

	for (let i = 0; i < queueNames.length - 1; i++) {
		state = queueNames[i];
		if (!(await addToQueue())) return;
		await checkMatch(userid, state, currSong).then((match) => {
			if (match === 409) {
				loop = false;
				i = queueNames.length;
				return res.status(409).send('User left the queue');
			} else if (match) {
				loop = false;
				i = queueNames.length;
				return matched(match);
			}
		});

		fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);
	}

	if (loop) {
		state = queueNames[queueNames.length - 1];
		if (!(await addToQueue())) return;
	}

	while (loop) {
		await checkMatch(userid, state, currSong).then((match) => {
			if (match === 409) {
				loop = false;
				fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);
				return res.status(409).send('User left the queue');
			} else if (match) {
				loop = false;
				return matched(match);
			}
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
		// check if user is already in a queue
		let userinfo = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions);
		if (!userinfo.ok) return res.status(404).send('issue with fetching user');
		userinfo = (await userinfo.json()).user;

		if (userinfo.isInQueue === false) {
			return 409;
		}
		// check if a match is found
		const Queue = await fetch(`http://localhost:${process.env.PORT}/${state}Queue`, fetchOptions).then((res) =>
			res.json()
		);

		if (Queue.queue && Queue.queue.userids.length >= 3) return Queue.queue;
		await new Promise((resolve) => setTimeout(resolve, checkEvery * 1000));
	}

	return false;
}

module.exports = router;
