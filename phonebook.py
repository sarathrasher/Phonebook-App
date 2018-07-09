def print_instructions():
    print "~~~~~~~Phonebook~~~~~~~~"
    print "1. Look up entry." 
    print "2. Set an entry ."
    print "3. Delete an entry." 
    print "4. List all entries." 
    print "5. Quit"

def find_entry(phonebook):
    name = raw_input("Who would you like to look up?\n")
    if name in phonebook:
        print "Phone number: %s" %phonebook[name]
    else:
        print "No entry found for %s" %name
    return phonebook

def set_entry(phonebook):
    name = raw_input("Please input a name for the entry.\n")
    number = raw_input("Please enter the person's telephone number.\n")
    phonebook[name] = number
    print "Entry stored for %s" %name
    return phonebook

def delete_entry(phonebook):
    name = raw_input("What name would you like to delete?\n")
    if name in phonebook:
        del phonebook[name]
        print "Deleted entry for %s" %name
    else:
        print "%s not found in phonebook.\n"%name
    return phonebook

def list_entries(phonebook):
    for entry in phonebook:
        print "Found entry for %s: %s." %(entry, phonebook[entry])
    return phonebook

def bye(phonebook):
    print "You have exited the program."
    return False

def do_phonebook(phonebook):
    print_instructions()
    command = raw_input("What would you like to do (1-5)?\n")
    command_list = {
        "1": find_entry,
        "2": set_entry,
        "3": delete_entry,
        "4": list_entries,
        "5": bye
    }
    while command != "5":
        if command in command_list:
            command_list[command](phonebook)
        elif command != 5:
            print "Please input a number from 1-5.\n"
    print "You have exited the program."


phonebook = {}
do_phonebook(phonebook)


