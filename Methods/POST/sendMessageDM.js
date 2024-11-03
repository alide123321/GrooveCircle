const express = require('express');
const fetch = require('node-fetch');
const {database} = require('../../dbClient');
const router = express.Router();

router.use(express.json());

// POST route for sending a message
router.post('/', (req, res) => {
    const { userid, friendid } = req.headers;
    const  messageContent  = req.body.messageContent;

    if (!userid || !friendid || !messageContent) 
        return res.status(400).json({
            errmsg: 'userid, friendid, and message are required'
        });

    let fetchOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            userid: userid
        }
    };

    fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions)
    .then(response => response.json())
    .then(async body => {
        if (!body.user)
            throw new Error('User not found');

        if(!body.user.friends_list.includes(friendid))
            throw new Error('User is not friends with friendid');

        let messageToInsert = {
            messages: [messageContent],
            participants: [userid, friendid],
            Chatroom: false
        }
        let messages = database.collection('messages');

        let exists = await messages.findOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]
        });

        if(exists) {

            messages.updateOne({$or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]}, {$push: {messages: messageContent}});

        } else {

            messages.insertOne(messageToInsert).then(result => {
                let user = database.collection('users');
                user.updateOne({"spotify_info.id": userid}, {$push: {message_list: result.insertedId}});
                user.updateOne({"spotify_info.id": friendid}, {$push: {message_list: result.insertedId}});
            });
        }

        res.status(200).send(`User with ID ${userid} sent message to ${friendid}: "${messageContent}"`);
    }).catch(error => {
        console.error('Error fetching user:', error);
        return res.status(404).json({
            errmsg: error.message || 'An error occurred'
        });
    });
});

module.exports = router;
