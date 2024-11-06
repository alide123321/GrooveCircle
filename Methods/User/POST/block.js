const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { database } = require("../../../dbClient");

// POST route for blocking a user
router.post("/", async (req, res) => {
  const users = database.collection("users");
  const { userid, blockid } = req.headers;

  if (!userid || !blockid)
    return res.status(400).send({
      errmsg: "userid and blockid are required",
    });

  if (userid === blockid)
    return res.status(400).send({
      errmsg: "User cannot block themselves",
    });

    let fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        userid: blockid,
      },
    };

    fetch( `http://localhost:${process.env.PORT}/User`, fetchOptions)
    .then((response) => response.json())
    .then((blocked_body) => {
        if (!blocked_body.user)
            throw new Error("Blocked user not found");

        fetchOptions.headers.userid = userid;

        fetch(`http://localhost:${process.env.PORT}/Blocked`, fetchOptions)
        .then((response) => response.json())
        .then((body) => {
            if (!body.blockedlist) 
                throw new Error("User not found");

            if (body.blockedlist.includes(blockid)) return;

            users.updateOne({ "spotify_info.id": userid },{ $push: { blocked_list: blockid }});

        })
    }).catch((error) => {
        console.error("Error fetching user:", error);
        return res.status(404).json({
            errmsg: error.message || "An error occurred",
        });
    });

    if (res.headersSent) return;

    res.status(200).send("User blocked successfully");

});

module.exports = router;
