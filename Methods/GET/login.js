const express = require("express");
const crypto = require("crypto");
const querystring = require("querystring");
const router = express.Router();

router.get("/", (req, res) => {
  var state = crypto.randomBytes(60).toString('hex').slice(0, 16);
  var scope = "user-read-private user-read-email";

  res.cookie(process.env.SPOTIFY_STATE_KEY, state);

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: `http://localhost:${process.env.PORT}/${process.env.SPOTIFY_REDIRECT_URI}`,
        state: state,
      })
  );
});

module.exports = router;
