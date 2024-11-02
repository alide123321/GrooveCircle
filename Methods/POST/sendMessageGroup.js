const express = require('express');
const router = express.Router();

router.use(express.json());

// POST route for sending a message
router.post('/', (req, res) => {
    const { userid, chatroomid } = req.headers;
    const  messageContent  = req.body.messageContent;

    if (!userid || !chatroomid || !messageContent) 
        return res.status(400).json({
            errmsg: 'userid, chatroomid, and message are required'
        });
       
    res.status(200).send(`User with ID ${userid} sent message to chatroom id [${chatroomid}]: "${messageContent}"`);
});

module.exports = router;
