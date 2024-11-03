const express = require('express');
const router = express.Router();
const { database } = require('../../dbClient');

router.delete('/', async (req, res) => {
    console.log('Query params:', req.query); // log query params
    const spotifyId = req.query.id; 

    // check if userID is provided
    if (!spotifyId) {
        return res.status(400).json({
            errmsg: 'spotify Id is required'
        });
    }

    try {
        const users = database.collection('users');
        
        // check if user exists 
        const existingUser = await users.findOne({ 'spotify_info.id': spotifyId });

        if (!existingUser) {
            return res.status(400).json({
                errmsg: `User with ID ${spotifyId} does not exist`
            });
        }

        // delete user from database
        await users.deleteOne({ 'spotify_info.id': spotifyId });
        // log deletion
        console.log(`User with username ${existingUser.username} deleted`);

        // send response
        res.status(200).json({
            userID: "deleted"
        });
    } catch (err) {
        return res.status(500).json({
            errmsg: 'Error deleting user'
        });
    }
});

module.exports = router;