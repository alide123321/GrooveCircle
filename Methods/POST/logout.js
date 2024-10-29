const express = require("express");
const cookieParser = require('cookie-parser');
const router = express.Router();

const app = express();

app.use(cookieParser());


router.post("/", (req, res) => {
  // clear cookies related to authentication
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

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

