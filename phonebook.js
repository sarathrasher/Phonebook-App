const rl = require('readline');
const fs = require('fs');
const http = require('http');

let writeFile = function (phonebookObject, callback) {
    fs.writeFile('phonebook.txt', JSON.stringify(phonebookObject), callback);
};

let generateId = function() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
}

let checkContact = function (contactName, phonebookObject) {
    let phonebookKeys = Object.keys(phonebookObject);
    for (let i = 0; i < phonebookKeys.length; i++) {
        if (contactName === phonebookKeys[i]) {
            return JSON.stringify(phonebookObject[phonebookKeys[i]]);
        } else {
            return 'Contact not found';
        }
    }
}

// Helper to read the body
// sent to you by the browser/Postman
let readBody = function(req, callback) {
    let body = '';
    req.on('data', function(chunk) {
      body += chunk.toString();
    });
    req.on('end', function() {
      callback(body);
    });
  };

let server = http.createServer(function (req, res) {
    fs.readFile('phonebook.txt', 'utf8', function(err, data) {
        let phonebook = data;
        let phonebookObject = JSON.parse(data);
        if (req.url === '/contacts' && req.method === 'GET') {
            res.end(phonebook);
        } else if (req.url.startsWith('/contacts/') && req.method === 'GET') {
            let id = req.url.slice('/contacts/'.length);
            let message = checkContact(id, phonebookObject);
            console.log(message);
            res.end(message);
        } else if (req.url.startsWith('/contacts/') && req.method === 'DELETE') {
            let id = req.url.slice('/contacts/'.length)
            delete phonebookObject[id];
            writeFile(phonebookObject, function(err) {
                    res.end('Your contact has been deleted');
            });
        } else if (req.url === '/contacts' && req.method === 'POST') {
            let id = generateId();
            readBody(req, function(body) {
                let newContact = JSON.parse(body);
                newContact.id = id;
                phonebookObject[id] = newContact;
                console.log(phonebookObject);
                writeFile(phonebookObject, function (err) {
                    res.end(JSON.stringify(newContact))
                });
            });
        } 
        // else if (req.url === '/contacts' && req.method === 'PUT') {

        // }
    });
});
 

let getInput = function (question, callBack) {
    let readLineInterface = rl.createInterface ({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    readLineInterface.question(question + '\n', function(input) {
        readLineInterface.close();
        callBack(null, input);
    });
};

let addContact = function (phonebook, callback) {
    getInput('Enter the name you would like to add. \n', function (err, name) {
        if (err) {
            console.log('Oops! Something went wrong.');
            callback();
        } else {
            getInput('Enter the phone number you would like to add. \n', function (err, phoneNumber) {
                if (err) {
                    console.log('Please enter a valid phone number.');
                } else {
                    phonebook[name] = phoneNumber;
                    console.log(`You have added an entry for ${name}.`);
                    callback();
                }
            });
        } 
    });
};

let entryToString = function (phonebook, name) {
    let entryString = `Name: ${name} \nNumber: ${phonebook[name]}`
    return entryString
};

let deleteContact = function (phonebook, callback) {
    getInput('Enter the name of the contact you would like to delete.', function (err, name) {
        if (err) {
            console.log('There was an error in deleting this file');
        } else {
            delete phonebook[name];
            callback();
        }
    });
}

let lookUpContact = function (phonebook, callback) {
    getInput('Enter a name you would like to search for. \n', function (err, name) {
        if (phonebook[name]) {
            console.log(entryToString(phonebook, phonebook[name]));
        } 
        callback();
    });
};

let listAllEntries = function (phonebook, callback) {
    let phonebookKeys = Object.keys(phonebook);
    for (let i = 0; i < phonebookKeys.length; i++) {
        let entry = entryToString(phonebook, phonebookKeys[i])
        console.log(entry);
    }
    callback();
};

let printInstructions = function () {
    console.log('~~~~~~~Phonebook~~~~~~');
    console.log('1. Look up a contact.');
    console.log('2. Add a contact.');
    console.log('3. Delete a contact.');
    console.log('4. List all contacts.');
    console.log('5. Quit this application.')
}

let runPhonebook = function (phonebook, fileName) {
    printInstructions();
    let menuObject = {
        1: lookUpContact,
        2: addContact,
        3: deleteContact,
        4: listAllEntries,
    };
    getInput('Enter a command. \n', function(err, input) {
        if (input != 5) {
            if (menuObject[input]) {
                menuObject[input](phonebook, function () {
                    runPhonebook(phonebook, fileName);
                });
            } else {
                console.log('Invalid input.')
            }
        } else {
            fs.writeFile(`${fileName}`, JSON.stringify(phonebook), function (err) {
                if (err) {
                    console.log('Error in writing file.');
                } 
            })
            console.log('Goodbye.')
        }
    });
};

let getPhonebook = function () {
    getInput('Enter the phonebook file name. \n', function (err, fileName) {
        if (err) {
            console.log('Please enter a valid file name.');
        } else {
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (err) {
                    console.log('This is not a valid file name.');
                } else {
                    let phonebook = JSON.parse(data)
                    runPhonebook(phonebook, fileName);
                }
            });
        }
    })
};
    
getPhonebook();

server.listen(3002);
