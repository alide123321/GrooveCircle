const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();

app.use(cookieParser());

router.post('/', async (req, res) => {
	const { userid } = req.headers;
	let state = 'Song';

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
	let DeletefetchOptions = {
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
		// Remove the queue from the database

		for (let i = 0; i < 5; i++) {
			DeletefetchOptions.headers.userid = matchQueue.userids[i];
			fetch(`http://localhost:${process.env.PORT}/removeFrom${state}Queue`, DeletefetchOptions);
		}

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

	let addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToSongQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) {
		console.log(addToQueueResponse);
		return res.status(404).send('issue with adding user to song queue');
	}

	let match = await checkMatch(userid, state, currSong);
	if (match) return matched(match);

	state = 'Album';

	fetch(`http://localhost:${process.env.PORT}/removeFromSongQueue`, DeletefetchOptions);

	addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToAlbumQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) {
		console.log(addToQueueResponse);
		return res.status(404).send('issue with adding user to album queue');
	}

	match = await checkMatch(userid, state, currSong);
	if (match) return matched(match);

	state = 'Artist';

	fetch(`http://localhost:${process.env.PORT}/removeFromAlbumQueue`, DeletefetchOptions);

	addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToArtistQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) return res.status(404).send('issue with adding user to artist queue');

	while (!match) {
		match = await checkMatch(userid, state, currSong);
	}

	return matched(match);
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

		if (Queue.queue && Queue.queue.userids.length >= 5) return Queue.queue;
		await new Promise((resolve) => setTimeout(resolve, checkEvery * 1000));
	}

	return false;
}

module.exports = router;
