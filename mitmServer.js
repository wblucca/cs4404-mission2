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
const otherISPs = ["berizon.com", "atb.com"];
// Bombast's domain name
const bombastDomain = 'bombast.com';

// Callback for handling messages
server.on('message', function(msg, rinfo) {
    console.log('Message from ' + rinfo.address + ':' + rinfo.port);
    
    // Check for other ISPs
    for (const otherISP in otherISPs) {
        if (msg.toString().includes(otherISP)) {
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

    // Send the message, close on completion
    client.send(msg, PORT, bombastDNS, function(err) {
        client.close();
    });

    console.log('Forwarded query to ' + bombastDNS + ':' + PORT);
}

const forwardModifiedRequest = function(msg) {
    // Replace other ISP domain with bombast.com
    for (const otherISP in otherISPs) {
        msg = msg.replace(otherISP, bombastDomain);
        console.log(otherISP + ' changed to ' + bombastDomain + ' in request');
    }

    // Forward the bombast.com request
    forwardRequest(msg);
}
