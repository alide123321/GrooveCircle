const express = require('express');
const router = express.Router();
const { database } = require("../../dbClient");
const { ObjectId } = require('mongodb');

// parsing json since headers in HTTP request can't send emojis
router.use(express.json());

// POST route for reacting to an activity
router.post('/', async (req, res) => {
    try {
        const { userid, activityid, emoji } = req.body;

        if (!userid || !activityid || !emoji) {
            return res.status(400).json({
                errmsg: 'userid, activityid, and emoji are required'
            });
        }

        const activitys = database.collection('activitys');
        
        // create reaction object 
        const reaction = {
            user_id: userid,
            emoji: emoji
        };

        // update activity reactions array
        // ObjectId is deprecated, using createFromHexString instead 
        const result = await activitys.updateOne(
            { _id: ObjectId.createFromHexString(activityid) }, 
            { $push: { reactions: reaction } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                errmsg: 'Activity not found'
            });
        }

        res.status(200).json({
            msg: 'Reaction added successfully',
            reaction: reaction
        });
        
    } catch (error) {
        console.error("Error reacting to activity:", error);
        res.status(500).json({
            errmsg: "Error reacting to activity"
        });
    }
});

module.exports = router;
