const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const { database } = require('../../../dbClient');

// POST route for adding a friend
router.post('/', async (req, res) => {
    const users = database.collection('users');
    const { userid, friendid } = req.headers;

    if (!userid || !friendid)
        return res.status(400).send({
            errmsg: "userid and friendid are required"
        });

    if (userid === friendid)
        return res.status(400).send({
            errmsg: "User cannot add themselves as a friend"
        }); 

    let fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userid: userid
        },
        
    };
        
    // Fetch user and friend data
    try {
        const response = await fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions);
        const body = await response.json();
        
        // Check if user exists
        if(!body.friendsList)
            throw new Error("User not found");

        // Fetch friend data
        fetchOptions.headers.userid = friendid;
        const friend_response = await fetch(`http://localhost:${process.env.PORT}/Friends`, fetchOptions);
        const friend_body = await friend_response.json();

        // Check if friend exists
        if(!friend_body.friendsList)
            throw new Error("Friend not found");

        // Add friend to user's friends list
        if(!body.friendsList.includes(friendid))
            users.updateOne({"spotify_info.id" : userid }, { $push: { friends_list: friendid } });
        
        /* Temporarily disabled since this is currently a one-way relationship (following)

        // Add user to friend's friends list
        if(!friend_body.friendsList.includes(userid))
            users.updateOne({"spotify_info.id" : friendid }, { $push: { friends_list: userid } });
        */

        res.status(200).json({ message: `User with ID '${userid}' added '${friendid}' as a friend`});

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(404).send({
            errmsg: "Error fetching user: \n" + error
        });
    } 
});

module.exports = router;