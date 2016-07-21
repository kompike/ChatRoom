var StorageService = require('../scripts/service/storageservice');
var ChatService = require('../scripts/service/chatservice');
var UserService = require('../scripts/service/userservice');
var EventBus = require('../scripts/eventbus');
var events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('Testing chat creation', function(){
	
	it('Testing chat creation', function(){	

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		
		eventBus.subscribe(events.CHAT_CREATED, function(chatList) {
			delivered = (chatList.length === 1);
		});
		
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		var chatId = chatService.onChatAdded(chat);
		
		var createdChat = chatService.getChatByName('Chat');
		var chatList = chatService.getAllChats();
		var firstChatFromList = chatList[0];
		
		test
			.bool(delivered)
				.isTrue()
			.string(createdChat.getOwner())
				.isEqualTo('User')
			.string(chatId)
				.isEqualTo('chat_0')
			.array(chatList)
				.isNotEmpty()
				.hasLength(1)
			.object(firstChatFromList)
				.is(createdChat);
	});
	
	it('Testing already existing chat', function(){		

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = 'Chat already exists';
		var isChatCreated = false;
		
		eventBus.subscribe(events.CHAT_CREATED, function(chatList) {
			isChatCreated = (chatList.length === 1);
		});
		
		eventBus.subscribe(events.CHAT_CREATION_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		chatService.onChatAdded(chat);
		
		var chatList = chatService.getAllChats();
		
		test
			.bool(isChatCreated)
				.isTrue()
			.bool(delivered)
				.isFalse()
			.array(chatList)
				.isNotEmpty()
				.hasLength(1);
				
		chatService.onChatAdded(chat);
		
		var createdChat = chatService.getChatByName('Chat');
		
		test
			.bool(isChatCreated)
				.isTrue()
			.bool(delivered)
				.isTrue()
			.array(chatList)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Testing empty chat name', function(){

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = 'Chat name must be filled';
		
		eventBus.subscribe(events.CHAT_CREATION_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		var chat = {
			'name' : '',
			'owner' : 'User'
		};
		
		chatService.onChatAdded(chat);
		
		var createdChat = chatService.getChatByName(chat.name);
		var chatList = chatService.getAllChats();
		
		test
			.bool(delivered)
				.isTrue()
			.array(chatList)
				.isEmpty()
			.value(createdChat)
				.isNull();
	});	
});

describe('Testing user joining', function(){
	
	it('User successfully joined', function(){
	
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		var chatService = new ChatService(eventBus, storage);
			
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chat.name);
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
			
		userService.onUserAdded(user);
		
		var createdUser = userService.getUserByNickname(user.nickname);
		
		var expectedChat = {
			chatName : 'Chat',
			chatId : 'chat_0'
		};
		
		var userJoined = false;
		
		eventBus.subscribe(events.USER_JOINED, function(chatData) {
			userJoined = (expectedChat.chatName === chatData.chatName && expectedChat.chatId === chatData.id);
		});
		
		chatService.onUserJoined({'chatName' : chat.name, 'user' : createdUser});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userJoined)
				.isTrue()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Failed joining chat', function(){
	
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		var chatService = new ChatService(eventBus, storage);
			
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chat.name);
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
			
		userService.onUserAdded(user);
		
		var createdUser = userService.getUserByNickname(user.nickname);
		
		var delivered = false;
		var expectedMessage = 'You already joined this chat';
				
		var expectedChat = {
			chatName : 'Chat',
			chatId : 'chat_0'
		};
		var userJoined = false;
		
		eventBus.subscribe(events.USER_JOINED, function(chatData) {
			userJoined = (expectedChat.chatName === chatData.chatName && expectedChat.chatId === chatData.id);
		});
		
		eventBus.subscribe(events.USER_JOINING_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		chatService.onUserJoined({'chatName' : chat.name, 'user' : createdUser});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userJoined)
				.isTrue()
			.bool(delivered)
				.isFalse()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
		
		chatService.onUserJoined({'chatName' : chat.name, 'user' : createdUser});
		
		test
			.bool(delivered)
				.isTrue()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
	});
});

describe('Testing user leaving chat', function(){
	
	it('User successfully leaved', function(){
	
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		var chatService = new ChatService(eventBus, storage);
			
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chat.name);
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
			
		userService.onUserAdded(user);
		
		var createdUser = userService.getUserByNickname(user.nickname);
		
		var userLeaved = false;
		
		eventBus.subscribe(events.CHAT_LEAVED, function(id) {
			userLeaved = (chatId === id);
		});
		
		chatService.onUserJoined({'chatName' : chat.name, 'user' : createdUser});
		
		chatService.onUserLeaved({'chatId' : chatId, 'user' : createdUser});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userLeaved)
				.isTrue()
			.array(joinedUsers)
				.isEmpty();
	});
	
	it('Failed leaving chat', function(){
	
		var storage = new StorageService();
		var userService = new UserService(eventBus, storage);
		var chatService = new ChatService(eventBus, storage);
			
		var chat = {
			'name' : 'Chat',
			'owner' : 'User'
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chat.name);
		
		var user = {
			"nickname":"User", 
			"password":"password", 
			"repeatPassword":"password"
		};
			
		userService.onUserAdded(user);
		
		var createdUser = userService.getUserByNickname(user.nickname);
		
		var delivered = false;
		var expectedMessage = 'You already leaved this chat';
		
		eventBus.subscribe(events.USER_LEAVING_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		chatService.onUserJoined({'chatName' : chat.name, 'user' : createdUser});
		
		chatService.onUserLeaved({'chatId' : chatId, 'user' : createdUser});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(delivered)
				.isFalse()
			.array(joinedUsers)
				.isEmpty();
		
		chatService.onUserLeaved({'chatId' : chatId, 'user' : createdUser});
		
		test
			.bool(delivered)
				.isTrue();
	});
});