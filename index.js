var express = require('express');
var request = require('request'); // not in the example
var app = express();

// Wit.ai
var wit = require('node-wit').Wit;

// IMPORTANT!!! PARSE BODY INTO JSON
var bodyParser = require('body-parser')
// adding parser into express
app.use(bodyParser.json());
// The port to listen to
app.listen(process.env.PORT || 3000)

app.get("/hello", function(request, response) {
  response.send("world");
});

// Validation for the messenger app to use this webhook
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
    // handle callback
    console.log("Event:", event.type)
    if (event.postback) {
      text = JSON.stringify(event.postback);
      handleText(sender, text, token);
      continue;
    }

    if (event.message && event.message.text) {
      handleText(event.message.text)
    }
  }
  res.sendStatus(200);
});


function handleText(text) {
  // Keyword to generate generic
  if (text.toLowerCase() == 'matrix')
    fetch(text);
    return sendGenericMessage(sender);

  answer = ANSWERS[text]
  if (answer == undefined)
    answer = "'" + text + "' habe ich leider nicht verstanden..."
  sendTextMessage(sender, answer);
}

// for message handling
function sendTextMessage(senderId, text) {
  messageData = { text: text }

  sendMessage(senderId, messageData)
}

function fetch(query) {
  jQuery.get("http://www.moviepilot.de/api/search?q=" + query + "&type=suggest&gamespilot=false", function(response) {
    console.log(response)
  });
}

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Matrix",
          "subtitle": "Super Awesome Movie",
          "image_url": "http://assets.cdn.moviepilot.de/files/c50861b75e2e12f24dd0f5a0320ddababe58413708040e128b0cd9966890/fill/168/240/NEU_-_Matrix.jpg",
          "buttons": [{
            "type": "web_url",
            "url": "http://www.moviepilot.de/movies/matrix",
            "title": "Link zum Film"
          }, {
            "type": "postback",
            "title": "Find ich nicht so dolle!",
            "payload": "Du magst den nicht? Welchen Film magst du dann?",
          }],
        }]
      }
    }
  };
  sendMessage(sender, messageData)
}

var token = "EAAZAw0OQTw80BAGKvPiaToib0stOKB1CuznVXLOw0gjRUQ2b7PD4DA23EWWZCuX8rZAOKps1cs2XQt4ZBWuoKNcIwLO35n7wVEbt2mrJKa0ZA7lSZCvn9bniqR7BGA6ut0rffTCZCwJ3sW4CeEmBYDZAmOuyWyr0Vlsqw1Gx4FmNygZDZD";

function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id: senderId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

ANSWERS = {
  "Hallo": "Hallöchen :)",
  "Wie geht es dir?": "Spitzenmäßig! Und dir?",
  "Gut": "Toll! Ich mag Filme. Welcher ist dein Lieblingsfilm?"
}


