const express = require('express');
const router = express.Router();

// POST route for creating a user
router.post('/', (req, res) => {

    // get user to link with spotify api
    //link with datebase and reuturn user id

    let userID = 12345;
    res.status(200).send(`User with ID ${userID} created.`);
});



module.exports = router;