var 
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io'),
// Interfaces
	spotify = require('./spotify_interface'),
	osascript = require('./spotify_osascript'),
// Other private vars
	auth,
	allowedLevels = 9;


function App(args){
	var that = this;

	that.useAuth = false;
	that.app = args.express();
	that.server = args.server.createServer(that.app);
	that.sio = args.socket.listen(that.server);
	that.osascript = args.osascript;
	that.port = args.port;

	that._cache = {};

	that.start();
}

App.prototype.start = function() {
	var that = this;

	that.route();
	that.httpListen();
	that.connectToSpotify();
	that.socketsListen();
};

App.prototype.route = function() {
	var that = this;

	// Make a basic templating method accessible. Better templating will come later
	that.app.use(httpResponse);

	// Check if user is allowed to perform the request
	that.app.use(authorization);


	//Routing

	that.app.get('/', function(req, res){
		res.sendfile(__dirname + '/index.html');
	});

	that.app.get('/play', function(req, res){
		that.spotify.play(res.httpResponse);
	});

	that.app.get('/play/:uri/:context?', function(req, res){
		if( req.params.context ){
			that.spotify.playUri(req.params.uri, req.params.context, res.httpResponse);
		}
		else {
			that.spotify.playUri(req.params.uri, res.httpResponse);
		}
	});

	that.app.get('/next', function(req, res){
		that.spotify.next(res.httpResponse);
	});

	that.app.get('/prev', function(req, res){
		that.spotify.prev(res.httpResponse);
	});

	that.app.get('/get/:property', function(req, res){
		that.spotify.get(req.params.property, res.httpResponse);
	});

	that.app.get('/set/:property/:value', function(req, res){
		that.spotify.set(req.params.property, req.params.value, res.httpResponse);
	});

	that.app.get('/current', function(req, res){
		that.spotify.get('current', res.httpResponse);
	});

	that.app.get('/auth/:token/:level', function(req, res){
		if( that.useAuth ){
			auth = req.params.token;
			allowedLevels = req.params.level;
			res.httpResponse(200, 'Permissions updated!');
		}
		else {
			res.httpResponse(403, 'You require more vespene gas (authorization is disabled).');
		}
	});
};

App.prototype.httpListen = function() {
	var that = this,
		port = that.port;

	that.server.listen(port);
	console.info('Listening on port %s', port);
};

App.prototype.connectToSpotify = function() {
	var that = this;

	that.spotify = spotify();

	if( process.platform === 'darwin' ){
		that.osascript = that.osascript(that.spotify);
	}
};

App.prototype.socketsListen = function() {
	var that = this,
		sockets = that.sio.sockets,
		spotify = that.spotify;

	that.sio.of('client').on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('disconnect', function (data) {
			console.log('disconnect', data);
		});
	});

	spotify.event.on('set', function(data){
		var property;

		// Extract setted property
		for( property in data ){
			break;
		}

		// Tell everyone only if there's actually a difference
		if( that._cache[property] !== data[property] ){
			sockets.in('client').emit(that._cache[property] = data[property]);
		}
	});

	spotify.event.on('new track', function(data){
		sockets.in('client').emit('new track', data);
	});
};

/* Private functions */

function httpResponse(req, res, next){
	res.httpResponse = function(status, message){
		res.contentType('text/plain');
		res.send(status, message);
	};
	next();
}

function authorization(req, res, next){
	var level = 0,
		i,
		routes = app.app.routes.get,
		path;

	for( i in routes ){
		if( req.path.match(routes[i].regexp) ){
			path = routes[i].path;
		}
	}

	switch( path ){
		case '/':
			level = 0;
		break;
		case '/current':
			level = 1;
		break;
		case '/get/:property':
			level = 2;
		break;
		case '/next':
		case '/prev':
		case '/play':
			level = 3;
		break;
		case '/play/:uri':
			level = 4;
		break;
		case '/set/:property/:value':
			level = 5;
		break;
		case 'auth/:token/:level':
			level = 10;
		break;
	}

	if( level <= allowedLevels || req.query.token === auth ){
		next();
	}
	else {
		res.httpResponse(401, 'You shall not pass!');
	}
}


// Wohoo

var app = new App({
	express: express,
	server: server,
	port: 3000,
	socket: socket,
	osascript: osascript
});