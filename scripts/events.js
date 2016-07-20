var EventType = {
	
	registrationFailed : 'REGISTRATION_FAILED', 
	newUserAdded : 'NEW_USER_ADDED',
	userRegistered : 'USER_REGISTERED',
	userLoggedIn : 'USER_LOGGED_IN',
	loginFailed : 'LOGIN_FAILED',
	login : 'LOGIN',
	chatCreation: 'CHAT_CREATION',
	chatCreationFailed : 'CHAT_CREATION_FAILED',
	chatListUpdated : 'CHAT_LIST_UPDATED',
	joinChat : 'JOIN_CHAT',
	onUserJoined: 'ON_USER_JOINED',
	onMessageAdded: 'ON_MESSAGE_ADDED',
	messageAddingFailed: 'MESSAGE_ADDING_FAILED',
	onChatCreated: 'CHAT_CREATED',
	messageListCreated: 'MESSAGE_LIST_CREATED',
	messageAdded: 'MESSAGE_ADDED'
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return EventType;
});