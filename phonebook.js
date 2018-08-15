var rl = require('readline');
var fs = require('fs');

var getInput = function (question, callBack) {
    var readLineInterface = rl.createInterface ({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    readLineInterface.question(question + '\n', function(input) {
        readLineInterface.close();
        callBack(null, input);
    });
};

var addContact = function (phonebook, callback) {
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

var entryToString = function (phonebook, name) {
    var entryString = `Name: ${name} \nNumber: ${phonebook[name]}`
    return entryString
};

var deleteContact = function (phonebook, callback) {
    getInput('Enter the name of the contact you would like to delete.', function (err, name) {
        if (err) {
            console.log('There was an error in deleting this file');
        } else {
            delete phonebook[name];
            callback();
        }
    });
}

var lookUpContact = function (phonebook, callback) {
    getInput('Enter a name you would like to search for. \n', function (err, name) {
        if (phonebook[name]) {
            console.log(entryToString(phonebook, phonebook[name]));
        }
        callback();
    });
};

var listAllEntries = function (phonebook, callback) {
    var phonebookKeys = Object.keys(phonebook);
    for (var i = 0; i < phonebookKeys.length; i++) {
        var entry = entryToString(phonebook, phonebookKeys[i])
        console.log(entry);
    }
    callback();
};

var printInstructions = function () {
    console.log('~~~~~~~Phonebook~~~~~~');
    console.log('1. Look up a contact.');
    console.log('2. Add a contact.');
    console.log('3. Delete a contact.');
    console.log('4. List all contacts.');
    console.log('5. Quit this application.')
}

var runPhonebook = function (phonebook, fileName) {
    printInstructions();
    var menuObject = {
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

var getPhonebook = function () {
    getInput('Enter the phonebook file name. \n', function (err, fileName) {
        if (err) {
            console.log('Please enter a valid file name.');
        } else {
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (err) {
                    console.log('This is not a valid file name.');
                } else {
                    var phonebook = JSON.parse(data)
                    runPhonebook(phonebook, fileName);
                }
            });
        }
    })
};
    
getPhonebook();
