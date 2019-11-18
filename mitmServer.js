// Author
// William Lucca

'use strict';

const dgram = require('dgram');

// Create the UDP server
const server = dgram.createSocket('udp4');

// Callback for handling messages
server.on('message', function(msg, rinfo) {
  console.log('Message from ' + rinfo.address + ':' + rinfo.port);
});

// Callback for printing potential errors
server.on('error', function(err) {
  console.log('Server error:\n' + err.stack);
});

// Callback to print server port when the server starts listening
server.on('listening', function() {
  const address = server.address();
  console.log('Meddler server listening on port ' + address.port);
});

// Start the server listening for UDP messages
server.bind(53);
