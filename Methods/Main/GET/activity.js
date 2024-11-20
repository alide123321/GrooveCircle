const express = require('express');
const router = express.Router();
const path = require('path');
const requireAuth = require('../../../auth');
const fetch = require('node-fetch');

router.use(requireAuth);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/activity.html'));
});

router.get('/track/:trackId', async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; 
    const trackId = req.params.trackId; 

     const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
     });

     if (!response.ok) {
      throw new Error('Failed to fetch track from Spotify');
     }

     const trackData = await response.json();
     res.json(trackData)
  } catch (error) {
    console.error('Error fetching track:', error); 
    res.status(500).json({ error: 'Failed to fetch track from Spotify' });
  }
});

module.exports = router;