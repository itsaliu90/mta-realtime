var express = require('express')
var http = require('http')

//Fetch data from MTA

var options = {
	host: 'datamine.mta.info',
	path: '/mta_esi.php?key=7aae2644bbaa198a716929cbdf99d2f3&feed_id=1'
}

var mtaData = '';

var callback = function(response) {
	var str = '';
	response.on('data', function (chunk) {
		str += chunk;
	});

	response.on('end', function () {
		console.log(str);
		mtaData = str;
	});
}

//Run the server

var app = express()

app.get('/', function(req, res) {

	function TimeoutHandler() {
		res.send(mtaData);
	}

	http.request(options, callback).end();
	setTimeout(TimeoutHandler, 1000);
})

var server = app.listen(3000);