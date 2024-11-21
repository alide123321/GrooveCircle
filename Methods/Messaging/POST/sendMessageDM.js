const express = require('express');
const { database } = require('../../../dbClient');
const router = express.Router();

router.use(express.json());

//fetch conversation history
router.get('/history', async (req, res) => {
    const { userid, friendid } = req.headers;

    if (!userid || !friendid) {
        return res.status(400).json({
            errmsg: 'userid and friendid are required'
        });
    }

    try {
        const messages = await database.collection('messages').findOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]
        });

        if (!messages) {
            return res.status(404).json({ errmsg: 'No conversation history found.' });
        }

        //sort messages by timestamp 
        const sortedMessages = messages.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.status(200).json({
            conversation: sortedMessages
        });
    } catch (error) {
        console.error('Error fetching message history:', error);
        res.status(500).json({
            errmsg: 'Failed to fetch conversation history.'
        });
    }
});

// Send a message
router.post('/send', async (req, res) => {
    const { userid, friendid } = req.headers;
    const { messageContent } = req.body;

    if (!userid || !friendid || !messageContent) {
        return res.status(400).json({
            errmsg: 'userid, friendid, and messageContent are required'
        });
    }

    try {
        const messagesCollection = database.collection('messages');
        const existingConversation = await messagesCollection.findOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]
        });

        const newMessage = {
            message: messageContent,
            sender: userid,
            timestamp: new Date()//added timestamp for messages
        };

        if (existingConversation) {
            //update existing conversation
            await messagesCollection.updateOne(
                {
                    $or: [
                        { participants: [userid, friendid] },
                        { participants: [friendid, userid] }
                    ]
                },
                { $push: { messages: newMessage } }
            );
        } else {
            //creates new conversation
            const newConversation = {
                participants: [userid, friendid],
                messages: [newMessage],
                Chatroom: false
            };
            await messagesCollection.insertOne(newConversation);
        }

        res.status(200).json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            errmsg: 'Failed to send message.'
        });
    }
});

//delete a conversation (if needed in the future)
router.delete('/delete', async (req, res) => {
    const { userid, friendid } = req.headers;

    if (!userid || !friendid) {
        return res.status(400).json({
            errmsg: 'userid and friendid are required'
        });
    }

    try {
        const result = await database.collection('messages').deleteOne({
            $or: [
                { participants: [userid, friendid] },
                { participants: [friendid, userid] }
            ]
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ errmsg: 'No conversation found to delete.' });
        }

        res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({
            errmsg: 'Failed to delete conversation.'
        });
    }
});

module.exports = router;
