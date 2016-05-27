var express = require('express');
var request = require('request'); // not in the example
var app = express();

// IMPORTANT!!! PARSE BODY INTO JSON
var bodyParser = require('body-parser')
// adding parser into express
app.use(bodyParser.json());

app.get("/hello", function(request, response) {
  console.log(request)
  response.send("world");
});

// Authentication
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'psst_this_top_secret') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// recive messages and resent >> Here was a typo in the exampe
app.post('/webhook', function (req, res) {
  // Here we expect json >> so we need a parser (see on top)
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      sendTextMessage(sender, "ECHO: "+ text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

var token = "EAAZAw0OQTw80BAGKvPiaToib0stOKB1CuznVXLOw0gjRUQ2b7PD4DA23EWWZCuX8rZAOKps1cs2XQt4ZBWuoKNcIwLO35n7wVEbt2mrJKa0ZA7lSZCvn9bniqR7BGA6ut0rffTCZCwJ3sW4CeEmBYDZAmOuyWyr0Vlsqw1Gx4FmNygZDZD";

// for message handling
function sendTextMessage(senderId, text) {
  console.log(text)
  messageData = { text: text }

  // not working > WHY????
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id: senderId},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.listen(process.env.PORT || 3000)
