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


/////////////// FACBOOKSTUFF ///////////////
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
    console.log("Event:", event)
    if (event.message && event.message.text) {
      handleText(event.message.text)
    }
  }
  res.sendStatus(200);
});


function handleText(text) {
  // Keyword to generate generic
  var found = false
  if (text.toLowerCase().match(/suche/)) {
    array = text.split(' ')
    array.shift()
    console.log("QUERY", array.join(' '))
    fetch(array.join(' '));
  } else {
    answer = ANSWERS[text]
    if (answer == undefined)
      answer = "Das habe ich leider nicht verstanden... Meintest du: Suche " + text + "?"
    sendTextMessage(sender, answer);
  }
}

// for message handling
function sendTextMessage(senderId, text) {
  messageData = { text: text }

  sendMessage(senderId, messageData)
}

function sendGenericMessage(sender, items) {

  var elements = []

  items.forEach( function(item, index) {
    elements.push({
      "title": item.title,
      "subtitle": item.info,
      "image_url": item.image,
      "buttons": [{
        "type": "web_url",
        "url": item.url,
        "title": "Link zum Treffer"
      }]
    })
  })

  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
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

/////////////// MOVIEPILOT ///////////////
function fetch(query) {
  request({
    url: "http://www.moviepilot.de/api/search?q=" + query + "&type=suggest&gamespilot=false",
    method: 'GET'
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    body = JSON.parse(body)

    if (body.length == 0) {
      sendTextMessage(sender, 'Leider habe ich heute kein Ergebnis für dich... *trauriges Wuff*');
    } else {
      sendTextMessage(sender, 'Das habe ich für dich gefunden! *aufgeregtes Wuff*');
      sendGenericMessage(sender, body);
    }
  });
}

ANSWERS = {
  "Hallo": "Hallöchen :)",
  "Wer bist du?": "Ich bin der *unglaubliche* Moviebot! Ich finde Filme, Serien und berühmte Persönlichkeiten für dich! Sage einfach `Suche Matrix` und du wirst sehen :D",
  "Wie geht es dir?": "Spitzenmäßig! Und dir?",
  "Gut": "Toll! Ich mag Filme. Welcher ist dein Lieblingsfilm?",
  "Was kannst du?": "Ich gebe die Information zu Filmen, Serien und berühmten Persönlichkeiten. Sage einfach: `Suche filmname`, also z.B. `Suche Matrix`. Dann versuche ich Filme, Serien und Personen für dich zu finden."
}


