const express = require("express");
const cookieParser = require('cookie-parser');
const fetch = require("node-fetch");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const querystring = require("querystring");
const router = express.Router();
const createUser = require("../POST/createUser");

const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_DB_USER)}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`; // for testCluster1
const client = new MongoClient(uri);

const app = express();

app.use(cookieParser());

router.get("/", (req, res) => {
  let stateKey = process.env.SPOTIFY_STATE_KEY;
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
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
        code: code,
        redirect_uri: `http://localhost:${process.env.PORT}/${process.env.SPOTIFY_REDIRECT_URI}`,
        grant_type: "authorization_code",
      }),
    };

    fetch("https://accounts.spotify.com/api/token", authOptions)
      .then((response) => response.json())
      .then((body) => {
        if (body.access_token) {
          const { access_token, refresh_token } = body;
          const options = {
            headers: { Authorization: "Bearer " + access_token },
          };

          fetch("https://api.spotify.com/v1/me", options)
            .then((response) => response.json())
            .then((body) => {
              // Store user data in session | 15 minutes | httpsOnly means you can access cookies on the client-side
              console.log("User data:", body);
              const database = client.db('groovecircle');
              const users = database.collection('users');

              users.findOne({ "spotify_info.id": body.id })
                .then(user => {
                  if (!user) {
                    axios.post('http://localhost:3000/createUser', { // Call createUser POST method
                      username: 'YOUR MOTHER',
                      headers: {
                      'Content-Type': 'application/json'
                    }}) 
                      .then(response => {
                        console.log("User created:", response);
                      })
                      .catch(error => {
                        console.error("Error creating user:", error);
                      }); 
                  } else {
                    user.spotify_info.refresh_token = refresh_token;
                    users.updateOne({ "spotify_info.id": body.id }, { $set: { "spotify_info.refresh_token": refresh_token } });
                  }
                  res.cookie("access_token", access_token, { maxAge: 15 * 60000, httpOnly: false }); 
                  res.cookie("refresh_token", refresh_token, { maxAge: 15 * 60000, httpOnly: false });
                  
                  // Redirect logic (replace res.redirect with your logic)
                  res.redirect("/#");
                })
                .catch(error => {
                  console.error("Error findings user:", error);
                  res.redirect("/#" + querystring.stringify({ error: "invalid_token" }));
                });
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              res.redirect(
                "/#" + querystring.stringify({ error: "invalid_token" })
              );
            });
        } else {
          console.error("Error getting access token:", body.error);
          res.redirect(
            "/#" + querystring.stringify({ error: "invalid_token" })
          );
        }
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
        res.redirect("/#" + querystring.stringify({ error: "invalid_token" }));
      });
  }
});

module.exports = router;
