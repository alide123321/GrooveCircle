const express = require('express');
const fetch = require('node-fetch');
const { database } = require('../../../dbClient');
const router = express.Router();

router.get('/', async (req, res) => {
    const { userid } = req.headers;

    if (!userid) return res.status(400).send('Missing userid');

    const fetchOptions = {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json', 
            userid: userid, 
        }
    }

    let userinfo = await fetch(`http://localhost:${process.env.PORT}/User`, fetchOptions); 
    if (!userinfo.ok) return res.status(404).send('issue with fetching user'); 
    userinfo = (await userinfo.json()).user; 

    if (userinfo.isInQueue === false) {
        return res.status(208).json({ message: 'User is not in a queue', isInQueue: false }); 
    }

    res.status(200).json({ message: 'User is in a queue', isInQueue: true }); 
}); 

module.exports = router; 