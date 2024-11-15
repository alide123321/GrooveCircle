const express = require('express');
const router = express.Router();
router.use(express.json());
const { database } = require("../../../dbClient");


// POST route for posting an activity
router.post('/', async (req, res) => {
    try {
        const { userid, song_id, activity_type, timestamp } = req.body;

        // validate fields 
        if (!userid || !song_id || !activity_type || !timestamp) {
            return res.status(400).json({
                error: "Missing some required activity field"
            })
        }
        // insert activity into database
        const activitys = database.collection('activitys');
        await activitys.insertOne({
            userid,
            song_id,
            activity_type,
            timestamp,
            reactions: [],
            likes: 0, 
        }); 

        res.status(200).send("Activity posted successfully");
    } catch (error) {
        console.error("Error posting activity:", error);
        res.status(500).send("Error posting activity");
    }
});

module.exports = router;