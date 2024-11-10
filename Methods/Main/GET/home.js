const express = require('express');
const router = express.Router();
const path = require('path');
const requireAuth = require('../../../auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/home.html'));
});

module.exports = router;