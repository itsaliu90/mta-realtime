//Application requirements
var express = require('express')
var morgan = require('morgan')
var http = require('http')
var swig = require('swig')
var socketio = require('socket.io')
var ProtoBuf = require('protobufjs')
var _ = require('underscore')

var app = express()
app.use(morgan('dev'))

//Use Swig to render HTML
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

swig.setDefaults({ cache: false });

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
		var decodedFeedMessage = transit.FeedMessage.decode(data);
		var tripData = decodedFeedMessage.entity;

		filteredTripData = _.filter(tripData, function(tripData) {
			if (tripData.trip_update) {
				return (tripData.trip_update.trip.route_id == currentLine);
			}
		})

		

		io.emit('update', "Received data!");
		console.log("Number of trains currently running on " + currentLine + " line is " + filteredTripData.length);
		mtaData = filteredTripData;
	});
}

//Long polling code	
setInterval(function () {
	http.request(options, pollMTA).end();
	console.log("Poll request made at " + Date.now());
}, 5000);

//Routes
app.get('/', function(req, res) {
	res.render("index");
})

//Run the server
var server = app.listen(3000);
var io = socketio.listen(server);