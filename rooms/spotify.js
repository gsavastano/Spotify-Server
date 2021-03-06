var events = require('events');

module.exports = function(args){
	return new Spotify(args);
};

function Spotify(args){
	var that = this;

	that.permissions = args.main.permissions;
	that.sio = args.main.sio;
	that.client = args.main.client;
	that.cache = args.main.cache;
	that.token = args.token;
	that.namespace = args.namespace;
	that.numerOfSlaves = 0;

	that.event = new events.EventEmitter();

	that.initialize();
}

Spotify.prototype.initialize = function() {
	var that = this,
		sockets = that.sio.sockets;

	that.sio.of(that.namespace)
		.authorization(function (handshakeData, callback) {
			callback(null, ( handshakeData.query.token === that.token ));
		})
		.on('connection', function(socket){
			console.log('connected as slave');
			that.event.emit('connected');
			that.numerOfSlaves++;

			// Automatical emits on changes to states. The message is expected
			// to contain { changedProperty: newValue }
			socket.on('change', function(changed){
				// Cache it
				that.cache.set(changed);

				// Emit so the world may know
				that.event.emit('change', changed);
			});

			// Ability to set admin password
			socket.on('auth', function(token){
				if( token ){
					that.permissions.enable(token);
				}
				else {
					that.permissions.disable();
				}
			});

			socket.on('disconnect', function(){
				that.cache.clear();
				that.event.emit('disconnected');
				that.numerOfSlaves--;
			});
		});
};

Spotify.prototype.refresh = function() {
	var that = this;

	that.sio.of(that.namespace).emit('refresh');
};

Spotify.prototype.do = function(command) {
	var that = this,
		sockets = that.sio.sockets,
		i;

	// Ability to send multiple commands
	if( !Array.isArray(command) ){
		command = [command];
	}

	// Ask spotify to execute the command(s)
	for( i = command.length; i--; ){
		that.sio.of(that.namespace).emit('do', command[i]);
	}
};

Spotify.prototype.die = function() {
	var that = this;
	// Make sure no socket listeners are still hanging around
	delete that.sio.namespaces[that.namespace];
};