define(function(require) {
		
	var Chat = require('./chat');
	
	var EventBus = require('./eventbus');
	
	var UserService = require('./userservice');
	
	var UserStorage = require('./userstorage');
	
	var userStorage = new UserStorage();	
	
	var eventBus = new EventBus();

	var chat = new Chat("chat_1", eventBus, new UserService(eventBus, userStorage));
	
	chat.initChat();
});	