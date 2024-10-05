const express = require('express');
const router = express.Router();

router.use(express.json());

// POST route for sending a message
router.post('/', (req, res) => {
    const { userID, friendID } = req.query;
    const  messageContent  = req.body.messageContent;

    if (!userID || !friendID || !messageContent) 
        return res.status(400).json({
            errmsg: 'userID, friendID, and message are required'
        });
       
    res.status(200).send(`User with ID ${userID} sent message to ${friendID}: "${messageContent}"`);
});

module.exports = router;
