var app = require('./app');
var config = require("./app/config/config");
var PORT = process.env.PORT || config.port;

app.listen(PORT, function () {
    console.log('Listening on port ', PORT)
});