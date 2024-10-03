var client_id = '67a6758cfada41d28467aa64afd8e33f';
var client_secret = "2c02395edd8149e79d407ae13fd193bd";
var redirect_uri = 'http://localhost:8888/callback';

const express = require('express');
var app = express();

app.get('/login', function(req, res) {

  //var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: "1234567890123456"
    }));
});

var port = 8888;
app.listen(port, function() {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
  }

  console.log(authOptions);
});