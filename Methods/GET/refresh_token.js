const express = require("express");
const fetch = require("node-fetch");
const querystring = require("querystring");
const router = express.Router();

router.get("/", (req, res) => {
  let refresh_token = req.query.refresh_token;
  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  };

  fetch("https://accounts.spotify.com/api/token", authOptions)
    .then((response) => response.json())
    .then((body) => {
      if (body.access_token) {
        const { access_token, refresh_token } = body;
        res.send({
          access_token: access_token,
          refresh_token: refresh_token,
        });
      }
    })
    .catch((error) => {
      console.error("Error during token refresh:", error);
    });
});

module.exports = router;
