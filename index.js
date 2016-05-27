var express = require('express');
var app = express();

app.get("/hello", function(request, response) {
  console.log(request)
  response.send("world");
});

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'psst_this_top_secret') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.listen(process.env.PORT)
