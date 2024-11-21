const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();

app.use(cookieParser());

router.delete('/', (req, res) => {
	// clear cookies related to authentication
	res.clearCookie('access_token');
	res.clearCookie('refresh_token');
	res.clearCookie('spotify_id');

	// destroy session
	req.session.destroy((err) => {
		if (err) {
			console.error('Session destruction error:', err); // logs error
			return res.status(500).json({ message: 'Failed to log out' });
		}
	});

	return res.status(200).json({ message: 'Successfully logged out' });
});

module.exports = router;
