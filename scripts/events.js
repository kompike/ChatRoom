var EventType = {
	
	registrationFailed : 'REGISTRATION_FAILED', 
	newUserAdded : 'NEW_USER_ADDED',
	userRegistered : 'USER_REGISTERED',
	userLoggedIn : 'USER_LOGGED_IN',
	loginFailed : 'LOGIN_FAILED',
	login : 'LOGIN',
	chatCreation: 'CHAT_CREATION',
	chatCreationFailed : 'CHAT_CREATION_FAILED',
	newChatCreated : 'NEW_CHAT_CREATED',
	joinChat : 'JOIN_CHAT'
}

define(function() {
	return EventType;
});