const fs = require('fs');
const http = require('http');
const pg = require('pg-promise')();
const db= pg('postgres://saramuntean@localhost:5432/db_phonebook');

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

let getContacts = (req, res, matches) => {
    console.log("hello")
   db.query('SELECT * FROM phonebook;')
   .then((results) => {res.end(JSON.stringify(results))});
}

let getContact = (req, res, matches) => {
    let id = matches[0];
    db.one(`SELECT * from phonebook WHERE id = ${id};`)
    .then((results) => {res.end(JSON.stringify(results))});
}

let deleteContact = (req, res, matches) => {
    let id = matches[0];
    db.query(`DELETE from phonebook WHERE id = ${id};`)
    .then((results) => {res.end('This contact has been deleted')});
};

let createContact = (req, res, matches) => {
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

let notFound = (req, res, matches) => {
    res.end('404 URL Not Found');
}

let routes = [
    {
        method: 'GET',
        url: /^\/contacts\/([0-9]+)$/,
        run: getContact
    },
    {
        method: 'DELETE',
        url: /^\/contacts\/([0-9]+)$/,
        run: deleteContact
    },
    {
        method: 'POST',
        url: /^\/contacts\/?$/,
        run: createContact
    },
    {
        method: 'GET',
        url: /^\/contacts\/?$/,
        run: getContacts
    },
    {
        method: 'GET',
        url: /^.*$/,
        run: notFound
    }
];

let server = http.createServer((req, res) => {
    let file = 'frontend/' + req.url.slice(1);
    console.log(file);
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            for (route of routes) {
                if (route.url.test(req.url) && route.method === req.method) {
                    let matches = route.url.exec(req.url);
                    route.run(req, res, matches.slice(1));
                    break
                };
            }
        } else {
            res.end(data);
        }
    });
});

server.listen(3002);
