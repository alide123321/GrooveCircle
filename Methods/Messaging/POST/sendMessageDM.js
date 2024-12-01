const express = require('express');
const fetch = require('node-fetch');
const { database } = require('../../../dbClient'); 
const router = express.Router();

router.use(express.json());

// POST route for sending a message
router.post('/', async (req, res) => {
    const { userid, friendid } = req.headers;
    const { messageContent } = req.body;

    //validate input
    if (!userid || !friendid || !messageContent) {
        return res.status(400).json({
            errmsg: 'userid, friendid, and messageContent are required',
        });
    }

    const fetchOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            userid,
        },
    };

    try {
        //fetch user information
        const userResponse = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions);
        const body = await userResponse.json();

        if (!body.user) {
            throw new Error('User not found');
        }

        if (!body.user.friends_list.includes(friendid)) {
            throw new Error('User is not friends with the provided friendid');
        }

        const messagesCollection = database.collection('messages');
        const messageToInsert = {
            messages: [
                {
                    message: messageContent,
                    sender: userid,
                    timestamp: new Date(), //timestamp to the message
                },
            ],
            participants: [userid, friendid],
            Chatroom: false,
        };

        //check if a conversation already exists
        const existingConversation = await messagesCollection.findOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] },
            ],
        });

        if (existingConversation) {
            // update existing conversation with the new message
            await messagesCollection.updateOne(
                {
                    $or: [
                        { participants: [userid, friendid] },
                        { participants: [friendid, userid] },
                    ],
                },
                { $push: { messages: messageToInsert.messages[0] } } //push the new message
            );
        } else {
            //create a new conversation
            const insertResult = await messagesCollection.insertOne(messageToInsert);

            //update users' message_list with the new conversation ID
            const usersCollection = database.collection('users');
            await usersCollection.updateOne(
                { 'spotify_info.id': userid },
                { $push: { message_list: insertResult.insertedId } }
            );
            await usersCollection.updateOne(
                { 'spotify_info.id': friendid },
                { $push: { message_list: insertResult.insertedId } }
            );
        }

        res.status(200).send(`User with ID ${userid} sent message to ${friendid}: "${messageContent}"`);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            errmsg: error.message || 'An error occurred while sending the message.',
        });
    }
});

module.exports = router;
