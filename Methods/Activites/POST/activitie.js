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
        const users = database.collection('users');
        
        // insert activity and get Id 
        const result = await activitys.insertOne({
            userid,
            song_id,
            activity_type,
            timestamp,
            reactions: [],
            likes: 0, 
        });

        const activityId = result.insertedId;
        
        const user = await users.findOne({ "spotify_info.id": userid });
        
        if (!user) {
            throw new Error('User not found');
        }

        // update user's activitie_list array with the new activity's id
        const updateResult = await users.updateOne(
            { "spotify_info.id": userid },
            { $push: { activitie_list: activityId } }
        );

        // validate if update to activitie_list was successful
        if (updateResult.modifiedCount === 0) {
            throw new Error('Failed to update user activitie_list');
        }

        // validate if user was found and update was successful
        if (updateResult.modifiedCount === 0) {
            throw new Error('User found but failed to update activitie_list');
        }

        res.status(200).send("Activity posted successfully");
    } catch (error) {
        console.error("Error posting activity:", error);
        res.status(500).send("Error posting activity");
    }
});

module.exports = router;