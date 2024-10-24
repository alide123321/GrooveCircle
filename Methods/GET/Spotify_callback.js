const express = require("express");
const fetch = require('node-fetch');
const crypto = require("crypto");
const querystring = require("querystring");
const router = express.Router();

router.get("/", (req, res) => {
  let stateKey = process.env.SPOTIFY_STATE_KEY;
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: querystring.stringify({
        code: code,
        redirect_uri: `http://localhost:${process.env.PORT}/${process.env.SPOTIFY_REDIRECT_URI}`,
        grant_type: 'authorization_code'
      })
    };
    
    fetch('https://accounts.spotify.com/api/token', authOptions)
      .then(response => response.json())
      .then(body => {
        if (body.access_token) {
          const { access_token, refresh_token } = body;
          const options = {
            headers: { 'Authorization': 'Bearer ' + access_token }
          };
    
          fetch('https://api.spotify.com/v1/me', options)
            .then(response => response.json())
            .then(body => {
              console.log(body);

              // store access token and refresh token in session
              req.session.access_token = access_token;
              req.session.refresh_token = refresh_token;
    
              // Redirect logic (replace res.redirect with your logic)
              res.redirect('/#' + querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));
            })
            .catch(error => {
              console.error('Error fetching user data:', error);
              res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
            });
        } else {
          console.error('Error getting access token:', body.error);
          res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
        }
      })
      .catch(error => {
        console.error('Error during authentication:', error);
        res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
      });
  }
});

module.exports = router;
