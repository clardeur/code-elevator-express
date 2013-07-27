
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var currentFloor = 0
var nextCommand = 'NOTHING'
var currentDirection = 'UP'
var nextCalls = []
var nextGos = []

routes.reset = function(req, res) {
	res.send("200 OK");
}

routes.nextCommand = function(req, res) {
	console.log('PREV ', nextCommand)

	console.log('Current floor : ', currentFloor)

	var isCurrentFloorHasACall = _.indexOf(nextCalls, currentFloor.toString()) !== -1
	var isCurrentFloorHasAGo = _.indexOf(nextGos, currentFloor.toString()) !== -1

	if (nextCommand === 'OPEN') {
		nextCommand = 'CLOSE'
	} else if ((isCurrentFloorHasACall || isCurrentFloorHasAGo)) {
		if (isCurrentFloorHasACall) nextCalls.splice(_.indexOf(nextCalls, currentFloor.toString()), 1)
		if (isCurrentFloorHasAGo) nextGos.splice(_.indexOf(nextGos, currentFloor.toString()), 1)
		nextCommand = 'OPEN'
	} else {
		if (currentFloor === 5) currentDirection = 'DOWN'
		if (currentFloor === 0) currentDirection = 'UP'
		nextCommand = currentDirection
	}

	if (nextCommand === 'UP') currentFloor++
	if (nextCommand === 'DOWN') currentFloor--

	console.log('NEXT ', nextCommand)	
	res.send(nextCommand)
}

routes.call = function(req, res) {
	var atFloor = req.query.atFloor
	if (_.indexOf(nextCalls, atFloor) === -1) nextCalls.push(atFloor)
	console.log('Next calls floor : ', nextCalls)
	res.send("200");
}

routes.go = function(req, res) {
	var floorToGo = req.query.floorToGo
	if (_.indexOf(nextGos, floorToGo) === -1) nextGos.push(floorToGo)
	console.log('Next floor to go : ', nextGos)
	res.send("200");
}

routes.userHasEntered = function(req, res) {
	res.send("200")
}

routes.userHasExited = function(req, res) {
	res.send("200")
}

app.get('/', routes.index);
app.get('/reset', routes.reset);
app.get('/nextCommand', routes.nextCommand);
app.get('/call', routes.call);
app.get("/go", routes.go);
app.get("/userHasEntered", routes.userHasEntered);
app.get("/userHasExited", routes.userHasExited);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
