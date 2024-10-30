const express = require('express');
const router = express.Router();
router.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${encodeURIComponent(process.env.MONGO_DB_USER)}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@testcluster1.yoy0t.mongodb.net/?retryWrites=true&w=majority&appName=testCluster1`; // for testCluster1
const client = new MongoClient(uri);


// POST route for creating a user
router.post('/', (req, res) => {

    // get user to link with spotify api
    //link with datebase and reuturn user id

    const database = client.db('groovecircle');
    const users = database.collection('users');

    const user = users.insertOne({
        friends_list: [],
        message_list: [],
        username: req.body.username,
        spotify_info: {
          id: req.body.id,
          refresh_token: req.body.refresh_token,
          access_token: req.body.access_token,
          email: req.body.email,
          profile_image: req.body.profile_image,
          Country: req.body.country,
          
        }
      }).then(result => {
        console.log("User inserted:", result.insertedId);
      })
      .catch(error => {
        console.error("Error inserting user:", error);
        res.status(500).send("Error inserting user");
      });


    res.status(200).send(`User with ID ${user._id} created.`);
});




module.exports = router;