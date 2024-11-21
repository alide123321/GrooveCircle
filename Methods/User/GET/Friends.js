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

module.exports = router;
