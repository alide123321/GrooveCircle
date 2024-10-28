const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  console.log("logout");
  // clear cookies related to authentication
  res.clearCookie(process.env.SPOTIFY_STATE_KEY);
  res.clearCookie("spotifyAuthToken");
  
  // destroy session 
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err); // logs error
      return res.status(500).json({ message: "Failed to log out" });
    }

    // redirect to home page
    res.redirect("/");
  });
});

module.exports = router;

