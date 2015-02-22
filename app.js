//Application requirements

var express = require('express')
var http = require('http')
var ProtoBuf = require('protobufjs')
var _ = require('underscore')

//Require config options.
var options = require('./config').options

//Fetch the data

var currentLine = "2"
var mtaData = '';
var transit = ProtoBuf.loadProtoFile("nyct-subway.proto.txt").build("transit_realtime");

var pollMTA = function(response) {
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

//Long polling code

setInterval(function () {
	http.request(options, pollMTA).end();
	console.log("Request made!");
}, 5000);

//Run the server

var app = express()

app.get('/', function(req, res) {
	res.send("MTA Train Status");
})

var server = app.listen(3000);