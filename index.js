var express = require('express');
var app = express();

validationToken = 'psst_this_top_secret'
app.set('port', (process.env.PORT || 5000));

// athentication
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === validationToken) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

// app.use(express.static(__dirname + '/public'));

// // views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });


