const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const pagesDir = path.join(__dirname, 'pages');
const port = 3000;
const ip = '192.168.31.245';

app.get("/", function(request, response) {
    // response.send(welcome.html);
    response.sendFile(path.join(pagesDir, 'welcome.html'));
}); 
app.get("/about", function(request, response) {
    // response.send(welcome.html);
    response.sendFile(path.join(pagesDir, 'about.html'));
});
app.get("/contacts", function(request, response) {
    // response.send(welcome.html);
    response.sendFile(path.join(pagesDir, 'contacts.html'));
});
app.listen(port, ip);

