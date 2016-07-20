var StorageService = require('../scripts/service/storageservice');
var ChatService = require('../scripts/service/chatservice');
var EventBus = require('../scripts/eventbus');
var EventType = require('../scripts/events');

var test = require('unit.js');

//

describe('Testing chat creation', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var chatService = new ChatService(eventBus, storage);
	
	var delivered = false;
	
	eventBus.subscribe(EventType.chatListUpdated, function(chatList) {
		delivered = (chatList.length === 1);
	});
	
	var chat = {
		'name' : 'Chat',
		'owner' : 'User'
	};
	
	chatService.onChatAdded(chat);
	
	it('Testing chat creation', function(){		
		test
			.bool(delivered)
				.isTrue();
	});	
});

describe('Testing already existing chat', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var chatService = new ChatService(eventBus, storage);
	
	var delivered = false;
	var expectedMessage = 'Chat already exists';
	var chatCreated = false;
	
	eventBus.subscribe(EventType.chatListUpdated, function(chatList) {
		chatCreated = (chatList.length === 1);
	});
	
	eventBus.subscribe(EventType.chatCreationFailed, function(message) {
		delivered = (message === expectedMessage);
	});
	
	var chat = {
		'name' : 'Chat',
		'owner' : 'User'
	};
	
	chatService.onChatAdded(chat);
	chatService.onChatAdded(chat);
	
	it('Testing already existing chat', function(){		
		test
			.bool(chatCreated)
				.isTrue()
			.bool(delivered)
				.isTrue();
	});	
});

describe('Testing empty chat name', function(){
	
	var eventBus = new EventBus();

	var storage = new StorageService();
	var chatService = new ChatService(eventBus, storage);
	
	var delivered = false;
	var expectedMessage = 'Chat name must be filled';
	
	eventBus.subscribe(EventType.chatCreationFailed, function(message) {
		delivered = (message === expectedMessage);
	});
	
	var chat = {
		'name' : '',
		'owner' : 'User'
	};
	
	chatService.onChatAdded(chat);
	
	it('Testing empty chat name', function(){		
		test
			.bool(delivered)
				.isTrue();
	});	
});