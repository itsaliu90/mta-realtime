//Application Requirements

var express = require('express')
var http = require('http')
var ProtoBuf = require('protobufjs')
var _ = require('underscore')

//API Configuration

var options = {
	host: 'datamine.mta.info',
	path: '/mta_esi.php?key=7aae2644bbaa198a716929cbdf99d2f3&feed_id=1'
}

//Fetch the data

var currentLine = "2"
var mtaData = '';
var transit = ProtoBuf.loadProtoFile("nyct-subway.proto.txt").build("transit_realtime");

var callback = function(response) {
	var data = [];
	response.on('data', function (chunk) {
		data.push(chunk);
	});

	response.on('end', function () {
		data = Buffer.concat(data);
		var msg = transit.FeedMessage.decode(data);
		var tripData = msg.entity;

		filteredTripData = _.filter(tripData, function(tripData) {
			if (tripData.trip_update) {
				return (tripData.trip_update.trip.route_id == currentLine);
			}
		})

		console.log("Number of trains currently running on " + currentLine + " line is " + filteredTripData.length);
		mtaData = filteredTripData;
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