// Require dependencies
var app = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io').listen(app);
 
// creating the server ( localhost:8000 )
app.listen(process.env.PORT || 8000);

// configure io to work with heroku
io.configure(function () {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
});
 
// server client.html
function handler ( request, response ) {
    fs.readFile( __dirname + '/client.html' ,
    function ( err, data ) {
        if ( err ) {
            console.log( err );
            response.writeHead(500);
            return response.end( 'Error loading client.html' );
        }
        response.writeHead( 200 );
        response.end( data );
    });
}

// listen for new connections
io.sockets.on( 'connection', function ( socket ) {
    // listen for set nickname
    socket.on('set nickname', function ( nickname ) {
        // Save a variable 'nickname' local to this socket
        socket.set('nickname', nickname, function () {
            // make a message
            var connected_msg = '<em>' + nickname + ' has connected</em>';
            // tell the log
            console.log(connected_msg);
            // tell everyone else
            io.sockets.volatile.emit('broadcast_msg', connected_msg);
        });
    });

    // listen for new messages
    socket.on('emit_msg', function ( msg ) {
        // Get the variable 'nickname'
        socket.get('nickname', function ( err, nickname ) {
            // log the message
            console.log('Chat message by', nickname);
            // broadcast the message to everyone
            io.sockets.volatile.emit('broadcast_msg' , nickname + ': ' + msg);
        });
    });

    // on disconnect
    socket.on('disconnect', function() {
	socket.get('nickname', function ( err, nickname ) {
	    // log the disconnect
	    console.log('Disconnect', nickname);
	    // make a message to send to everyone
	    var disconnected_msg = '<em>' + nickname + ' has disconnected</em>';
	    // send to everyone
	    io.sockets.volatile.emit('broadcast_msg', disconnected_msg);
	});
    });
});