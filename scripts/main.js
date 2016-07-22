define(function(require) {
		
	var Chat = require('./chat');
	
	var EventBus = require('./eventbus');
	
	var Events = require('./events');
	
	var ErrorMessages = require('./errormessages');
	
	var UserDTO = require('./dto/userDTO');
	
	var ChatDTO = require('./dto/chatDTO');
	
	var MessageDTO = require('./dto/messageDTO');
	
	var UserService = require('./service/userservice');
	
	var ChatService = require('./service/chatservice');
	
	var StorageService = require('./service/storageservice');
	
	var storageService = new StorageService();	
	
	var eventBus = new EventBus();

	var chat = new Chat("chatroom", eventBus, new UserService(eventBus, storageService), new ChatService(eventBus, storageService));
	
	chat.initChat();
});	