const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render(path.join(__dirname, 'public', 'index.html'));
});

module.exports = router;
