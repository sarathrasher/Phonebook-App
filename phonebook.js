const fs = require('fs');
const http = require('http');

// Node phonebook app

let checkContact = (contactName, phonebookObject) => {
    let phonebookKeys = Object.keys(phonebookObject);
    for (let i = 0; i < phonebookKeys.length; i++) {
        if (contactName === phonebookKeys[i]) {
            return JSON.stringify(phonebookObject[phonebookKeys[i]]);
        } else {
            return '404 Contact Not Found.'
        }
    }
};

let writeFile = (phonebookObject, callback) => {
    fs.writeFile('phonebook.txt', JSON.stringify(phonebookObject), callback);
};

let generateId = () => { return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString() };

let readBody = (req, callback) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      callback(body);
    });
  };

let getContacts = (req, res, phonebook, phonebookObject, matches) => {
    res.end(phonebook);
}

let getContact = (req, res, phonebook, phonebookObject, matches) => {
    let id = matches[0];
    var message = checkContact(id, phonebookObject);
    res.end(message);
}

let deleteContact = (req, res, phonebook, phonebookObject, matches) => {
    let id = matches[0];
    delete phonebookObject[id];
    writeFile(phonebookObject, (err) => {
        res.end('Your contact has been deleted');
    });
}

let createContact = (req, res, phonebook, phonebookObject, matches) => {
    let id = generateId();
    readBody(req, (body) => {
        let newContact = JSON.parse(body);
        newContact.id = id;
        phonebookObject[id] = newContact;
        console.log(phonebookObject);
        writeFile(phonebookObject, (err) => {
            res.end(JSON.stringify(newContact))
        });
    });
};

let notFound = (req, res, phonebook, phonebookObject, matches) => {
    res.end('404 Contact Not Found');
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
    fs.readFile('phonebook.txt', 'utf8', (err, data) => {
        let phonebook = data;
        let phonebookObject = JSON.parse(data);
        for (route of routes) {
            if (route.url.test(req.url) && route.method === req.method) {
                let matches = route.url.exec(req.url);
                route.run(req, res, phonebook, phonebookObject, matches.slice(1));
                break
            }
        }   
    });
});

server.listen(3002);
