var express = require('express')
var http = require('http')
var ProtoBuf = require('protobufjs')

//Fetch data from MTA

var options = {
	host: 'datamine.mta.info',
	path: '/mta_esi.php?key=7aae2644bbaa198a716929cbdf99d2f3&feed_id=1'
}

var mtaData = '';

var callback = function(response) {
	var data = [];
	response.on('data', function (chunk) {
		data.push(chunk);
	});

	response.on('end', function () {
		data = Buffer.concat(data);
		var msg = transit.FeedMessage.decode(data);
		console.log(msg);
	});
}

//Proto work
var transit = ProtoBuf.loadProtoFile("nyct-subway.proto.txt").build("transit_realtime");

//Run the server

var app = express()

app.get('/', function(req, res) {

	function TimeoutHandler() {
		res.send("Hello");
	}

	http.request(options, callback).end();
	setTimeout(TimeoutHandler, 1000);
})

var server = app.listen(3000);