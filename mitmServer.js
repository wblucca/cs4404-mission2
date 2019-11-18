// Author
// William Lucca

'use strict';

const dgram = require('dgram');

// Create the UDP server
const server = dgram.createSocket('udp4');

// Address of Bombast's DNS server to forward to
const bombastDNS = '10.4.18.1';
// DNS port number
const PORT = 53;

// List of other ISPs to redirect
const otherISPs = ['berizon', 'atb'];
// Bombast's domain name
const bombastDomain = 'bombast';

// Callback for handling messages
server.on('message', function(msg, rinfo) {
    console.log('Message from ' + rinfo.address + ':' + rinfo.port);
    
    // Check for other ISPs
    for (var i = 0; i < otherISPs.length; i++) {
        if (msg.toString().includes(otherISPs[i])) {
            // Send a modified request to DNS server that asks for bombast.com
            forwardModifiedRequest(msg);
        }
    }

    // Forward to DNS
    forwardRequest(msg);
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

// Start the server listening for UDP messages (DNS queries)
server.bind(PORT);

const forwardRequest = function(msg) {
    // Start UDP message sending client
    const client = dgram.createSocket('udp4');

    console.log('Forwarding message to ' + bombastDNS + ':' + PORT + ':\n' + msg.toString());

    // Send the message, close on completion
    client.send(msg, 0, msg.length, PORT, bombastDNS, function(err) {
        client.close();
    });
}

const forwardModifiedRequest = function(msg) {
    // Replace other ISP domain with bombast
    for (var i = 0; i < otherISPs.length; i++) {
        let n = msg.indexOf(otherISPs[i]);
        if (n != -1) {
            msg = msg.slice(0, n) + bombastDomain + msg.slice(n + bombastDomain.length);
            console.log(otherISPs[i] + ' changed to ' + bombastDomain + ' in request');
        }
    }

    // Forward the bombast.com request
    forwardRequest(msg);
}
