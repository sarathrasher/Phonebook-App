const fs = require('fs');
const http = require('http');
const pg = require('pg-promise')();
const db= pg('postgres://saramuntean@localhost:5432/db_phonebook');
const express = require('express');

// Node phonebook app

let readBody = (req, callback) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      callback(body);
    });
  };

let getContacts = (req, res) => {
    console.log("hello")
   db.query('SELECT * FROM phonebook;')
   .then((results) => {res.end(JSON.stringify(results))});
}

let getContact = (req, res) => {
    let id = req.params.id
    db.one(`SELECT * from phonebook WHERE id = ${id};`)
    .then((results) => {res.end(JSON.stringify(results))});
}

let deleteContact = (req, res) => {
    let id = req.params.id
    db.query(`DELETE from phonebook WHERE id = ${id};`)
    .then((results) => {res.end('This contact has been deleted')});
};

let createContact = (req, res) => {
    readBody(req, (body) => {
        let newContact = JSON.parse(body);
        db.one(`
        INSERT INTO phonebook (name, number)
        VALUES
            ('${newContact.name}', '${newContact.number}')
            returning *;`)
            .then((results) => {res.end(JSON.stringify(results))});
    });
};

let notFound = (req, res) => {
    res.end('404 URL Not Found');
}

let getHomepage = (req, res) => {
    let file = 'frontend/' + req.params.id;
     console.log(file);
     fs.readFile(`${file}`, 'utf8', (err, data) => {                 res.end(data);
    });
};

let server = express();

server.get('/contacts', getContacts)
server.post('/contacts', createContact);
server.get('/contacts/:id', getContact);
server.delete('/contacts/:id', deleteContact);
server.get('/:id', getHomepage)

server.listen(3002);
