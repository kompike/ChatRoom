define(function(require) {
		
	var Chat = require('./chat');
	
	var EventBus = require('./eventbus');
	
	var UserDTO = require('./dto/userDTO');
	
	var ChatDTO = require('./dto/chatDTO');
	
	var UserService = require('./userservice');
	
	var ChatService = require('./chatservice');
	
	var StorageService = require('./storageservice');
	
	var storageService = new StorageService();	
	
	var eventBus = new EventBus();

	var chat = new Chat("chat_1", eventBus, new UserService(eventBus, storageService));
	
	chat.initChat();
});	