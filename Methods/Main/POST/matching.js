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
	if (currSong.status !== 200) return res.status(404).send('issue with fetching current song');
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

	const addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToSongQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) {
		console.log(addToQueueResponse);
		return res.status(404).send('issue with adding user to song queue');
	}

	let match = await checkMatch(userid, state, currSong);
	if (match)
		return await res
			.status(200)
			.send({ msg: 'Match found', queueId: `${await matched(match, state, userid, currSong)}` });

	state = 'Album';

	fetch(`http://localhost:${process.env.PORT}/removeFromSongQueue`, DeletefetchOptions);

	addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToAlbumQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) {
		console.log(addToQueueResponse);
		return res.status(404).send('issue with adding user to album queue');
	}

	match = await checkMatch(userid, state, currSong);
	if (match)
		return res.status(200).send({ msg: 'Match found', queueId: `${await matched(match, state, userid, currSong)}` });

	state = 'Artist';

	fetch(`http://localhost:${process.env.PORT}/removeFromAlbumQueue`, DeletefetchOptions);

	addToQueueResponse = await fetch(`http://localhost:${process.env.PORT}/addToArtistQueue`, PostfetchOptions);
	if (!addToQueueResponse.ok) return res.status(404).send('issue with adding user to artist queue');

	while (!match) {
		match = await checkMatch(userid, state, currSong);
	}

	res.status(200).send({ msg: 'Match found', queueId: `${await matched(match, state, userid, currSong)}` });
});

async function matched(queue, state, userid, currSong) {
	//create chatroom and send response and other logic
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

	const Queue = await fetch(`http://localhost:${process.env.PORT}/${state}Queue`, fetchOptions).then((res) =>
		res.json()
	);
	console.log(Queue.queue._id);
	return Queue.queue._id;
}

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
	let initalTime = new Date().getTime();

	for (let i = new Date().getTime(); i < initalTime + 60000; ++i) {
		console.log('Checking for match...');

		const Queue = await fetch(`http://localhost:${process.env.PORT}/${state}Queue`, fetchOptions).then((res) =>
			res.json()
		);

		if (Queue.queue.userids.length >= 3) return Queue.queue;
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}

	return false;
}

module.exports = router;
