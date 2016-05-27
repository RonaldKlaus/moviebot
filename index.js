var express = require('express');
var app = express();

app.get("/", function(request, response) {
  "HELLO !";
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
