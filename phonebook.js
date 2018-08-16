const rl = require('readline');
const fs = require('fs');
const http = require('http');

let writeFile = (phonebookObject, callback) => {
    fs.writeFile('phonebook.txt', JSON.stringify(phonebookObject), callback);
};

let generateId = () => {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString()
}

let checkContact = (contactName, phonebookObject) => {
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
let readBody = (req, callback) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      callback(body);
    });
  };

let server = http.createServer((req, res) => {
    fs.readFile('phonebook.txt', 'utf8', (err, data) => {
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
            writeFile(phonebookObject, (err) => {
                    res.end('Your contact has been deleted');
            });
        } else if (req.url === '/contacts' && req.method === 'POST') {
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
        } 
        // else if (req.url === '/contacts' && req.method === 'PUT') {

        // }
    });
});
 

let getInput = (question, callBack) => {
    let readLineInterface = rl.createInterface ({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    readLineInterface.question(question + '\n', (input) => {
        readLineInterface.close();
        callBack(null, input);
    });
};

let addContact = (phonebook, callback) => {
    getInput('Enter the name you would like to add. \n', (err, name) => {
        if (err) {
            console.log('Oops! Something went wrong.');
            callback();
        } else {
            getInput('Enter the phone number you would like to add. \n', (err, phoneNumber) => {
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

let entryToString = (phonebook, name) => {
    let entryString = `Name: ${name} \nNumber: ${phonebook[name]}`
    return entryString
};

let deleteContact = (phonebook, callback) => {
    getInput('Enter the name of the contact you would like to delete.', (err, name) => {
        if (err) {
            console.log('There was an error in deleting this file');
        } else {
            delete phonebook[name];
            callback();
        }
    });
}

let lookUpContact = (phonebook, callback) => {
    getInput('Enter a name you would like to search for. \n', (err, name) => {
        if (phonebook[name]) {
            console.log(entryToString(phonebook, phonebook[name]));
        } 
        callback();
    });
};

let listAllEntries = (phonebook, callback) => {
    let phonebookKeys = Object.keys(phonebook);
    for (let i = 0; i < phonebookKeys.length; i++) {
        let entry = entryToString(phonebook, phonebookKeys[i])
        console.log(entry);
    }
    callback();
};

let printInstructions = () => {
    console.log('~~~~~~~Phonebook~~~~~~');
    console.log('1. Look up a contact.');
    console.log('2. Add a contact.');
    console.log('3. Delete a contact.');
    console.log('4. List all contacts.');
    console.log('5. Quit this application.')
}

let runPhonebook = (phonebook, fileName) => {
    printInstructions();
    let menuObject = {
        1: lookUpContact,
        2: addContact,
        3: deleteContact,
        4: listAllEntries,
    };
    getInput('Enter a command. \n', (err, input) => {
        if (input != 5) {
            if (menuObject[input]) {
                menuObject[input](phonebook, () => {
                    runPhonebook(phonebook, fileName);
                });
            } else {
                console.log('Invalid input.')
            }
        } else {
            fs.writeFile(`${fileName}`, JSON.stringify(phonebook), (err) => {
                if (err) {
                    console.log('Error in writing file.');
                } 
            })
            console.log('Goodbye.')
        }
    });
};

let getPhonebook = () => {
    getInput('Enter the phonebook file name. \n', (err, fileName) => {
        if (err) {
            console.log('Please enter a valid file name.');
        } else {
            fs.readFile(fileName, 'utf8', (err, data) => {
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
