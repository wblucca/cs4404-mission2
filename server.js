// Author
// William Lucca

'use strict';

const http = require('http');
const fs = require('fs');

// Port to host server on
const PORT = 80;

// Path of HTML file to use for the server's main webpage
if (process.argv.length < 3) {
    // No file specified, end program
    console.log('Please specify an HTML page to use for the website.\n');
    process.exit(1);
} else {
    var htmlPage = process.argv[2];
}

// Create the server instance with a callback that handles HTTP requests
var server = http.createServer(function (request, response) {
    // Switch on their URL request to give client the appropriate file
    switch (request.url){
        case '/':
            // No specific filepath requested, respond with 'index.html'
            sendFile(response, htmlPage);
            break;
        default:
            // File requested, respond with file at the given path
            sendFile(response, request.url.substring(1));
    }
    
    // Log the request
    const ip = req.socket.localAddress;
    const port = req.socket.localPort;
    console.log('Request from IP address ${ip} on port ${port}.');
});

/**
 * Read the given file, write it to the HTTP response body, and send it back
 * to the requester
 * @param {http.ServerResponse} response Response to write data to and send out
 * @param {String} filename Path to the file to read for the response body
 */
const sendFile = function(response, filename) {
    // Start reading the file, the callback function is called when done
    fs.readFile(filename, function(err, data) {
        // Check if it found the file
        if (err) {
            // Can't find file, respond with 404
            response.writeHead(404);
            response.end('404: File not found');
        }
        else {
            // Create http response with file and OK status
            response.writeHead(200);
            response.write(data);
            response.end();
        }
    });
};

// Start the server listening on the given port
server.listen(PORT);

// Print out which port the server is being hosted on
console.log('Hosting server on ' + PORT);
