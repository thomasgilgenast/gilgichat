// Require dependencies
var app = require('http').createServer(handler);
var fs = require('fs');
var io = require('socket.io').listen(app);
 
// creating the server ( localhost:8000 )
app.listen(process.env.PORT || 8000);
 
// on server started we can load our client.html page
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

// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on( 'connection', function ( socket ) {
  // set nickname
  socket.on('set nickname', function (nickname) {
    // Save a variable 'nickname'
    socket.set('nickname', nickname, function () {
      // make a message
      var connected_msg = nickname + ' is now connected.';
      // tell the log
      console.log(connected_msg);
      // tell everyone else
      io.sockets.volatile.emit('broadcast_msg', connected_msg);
    });
  });

  // when a new message is sent
  socket.on('emit_msg', function (msg) {
    // Get the variable 'nickname'
    socket.get('nickname', function (err, nickname) {
      console.log('Chat message by', nickname);
      io.sockets.volatile.emit( 'broadcast_msg' , nickname + ': ' + msg );
    });
  });
});