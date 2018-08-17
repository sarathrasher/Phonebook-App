const fs = require('fs');
const http = require('http');

// Node phonebook app

let checkContact = (contactName, phonebookObject) => {
    let phonebookKeys = Object.keys(phonebookObject);
    for (let i = 0; i < phonebookKeys.length; i++) {
        if (contactName === phonebookKeys[i]) {
            return JSON.stringify(phonebookObject[phonebookKeys[i]]);
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

let getContacts = (req, res, phonebook, phonebookObject) => {
    res.end(phonebook);
}

let getContact = (req, res, phonebook, phonebookObject) => {
    let id = req.url.slice('/contacts/'.length);
    console.log();
    res.end(JSON.stringify(phonebookObject[id]));
}

let deleteContact = (req, res, phonebook, phonebookObject) => {
    let id = req.url.slice('/contacts/'.length)
    delete phonebookObject[id];
    writeFile(phonebookObject, (err) => {
        res.end('Your contact has been deleted');
    });
}

let createContact = (req, res, phonebook, phonebookObject) => {
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

let notFound = (req, res, phonebook, phonebookObject) => {
    res.end('404 Contact Not Found');
}

let routes = [
    {
        method: 'GET',
        url: /^\/contacts\/[0-9]+$/,
        run: getContact
    },
    {
        method: 'DELETE',
        url: /^\/contacts\/[0-9]+$/,
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
        for (route of routes)
        if (route.url.test(req.url) && route.method === req.method) {
            route.run(req, res, phonebook, phonebookObject);
            break
        }
    });
});

server.listen(3002);
