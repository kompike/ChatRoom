var errorMessages = {
	
	USER_ALREADY_EXISTS : 'User already exists',
	EMPTY_FIELDS_NOT_ALLOWED : 'All fields must be filled',
	PASSWORDS_NOT_EQUAL : 'Passwords must be equal',
	INCORRECT_CREDENTIALS : 'Incorrect login / password',
	
	CHAT_ALREADY_EXISTS : 'Chat already exists',
	CHATNAME_MUST_BE_FILLED : 'Chat name must be filled',
	
	USER_ALREADY_JOINED : 'You already joined this chat',
	USER_ALREADY_LEFT : 'You already left this chat',
	
	EMPTY_MESSAGE_NOT_ALLOWED : 'You can not post empty message'
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return errorMessages;
});