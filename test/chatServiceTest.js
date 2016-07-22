var StorageService = require('../scripts/service/storageservice');
var ChatService = require('../scripts/service/chatservice');
var UserDTO = require('../scripts/dto/userDTO');
var EventBus = require('../scripts/eventbus');
var events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('Chat service should', function(){
	
	it('Create new chat', function(){	

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var chatName = 'Chat';
		var owner = 'User';
		
		eventBus.subscribe(events.CHAT_LIST_UPDATED, function(chatList) {
			delivered = (chatList.length === 1);
		});
		
		var chat = {
			'chatName' : chatName,
			'owner' : owner
		};
		
		var chatId = chatService.onChatAdded(chat);
		
		var createdChat = chatService.getChatByName(chatName);
		var chatList = chatService.getAllChats();
		var firstChatFromList = chatList[0];
		
		test
			.bool(delivered)
				.isTrue()
			.string(createdChat.getOwner())
				.isEqualTo(owner)
			.string(chatId)
				.isEqualTo('chat_0')
			.array(chatList)
				.isNotEmpty()
				.hasLength(1)
			.object(firstChatFromList)
				.is(createdChat);
	});
	
	it('Avoid creating already existing chat', function(){		

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = 'Chat already exists';
		var isChatCreated = false;
		var chatName = 'Chat';
		
		eventBus.subscribe(events.CHAT_LIST_UPDATED, function(chatList) {
			isChatCreated = (chatList.length === 1);
		});
		
		eventBus.subscribe(events.CHAT_CREATION_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		var chat = {
			'chatName' : chatName,
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
		
		test
			.bool(isChatCreated)
				.isTrue()
			.bool(delivered)
				.isTrue()
			.array(chatList)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Trim chat name while creating new chat', function(){		

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = 'Chat already exists';
		var isChatCreated = false;
		var chatName = 'Chat';
		var chatNameWithWhitespaces = '   Chat  ';
		var owner = 'User';
		
		eventBus.subscribe(events.CHAT_LIST_UPDATED, function(chatList) {
			isChatCreated = (chatList.length === 1);
		});
		
		eventBus.subscribe(events.CHAT_CREATION_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		var chat = {
			'chatName' : chatName,
			'owner' : owner
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
		
		var newChat = {
			'chatName' : chatNameWithWhitespaces,
			'owner' : owner
		};
				
		chatService.onChatAdded(newChat);
		
		test
			.bool(isChatCreated)
				.isTrue()
			.bool(delivered)
				.isTrue()
			.array(chatList)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Avoid creating chat with empty name', function(){

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = 'Chat name must be filled';
		
		eventBus.subscribe(events.CHAT_CREATION_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		var chat = {
			'chatName' : '',
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
	
	it('Join user to chat', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
				
		var user = new UserDTO(nickname, 'password');
				
		var userJoined = false;
		
		eventBus.subscribe(events.USER_JOINED_CHAT, function(chatData) {
			userJoined = (chatName === chatData.chatName && chatId === chatData.chatId);
		});
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : user});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userJoined)
				.isTrue()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Avoid joining already joined user', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
				
		var user = new UserDTO(nickname, 'password');
		
		var delivered = false;
		var expectedMessage = 'You already joined this chat';
			
		var userJoined = false;
		
		eventBus.subscribe(events.USER_JOINED_CHAT, function(chatData) {
			userJoined = (chatName === chatData.chatName && chatId === chatData.chatId);
		});
		
		eventBus.subscribe(events.CHAT_JOINING_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : user});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userJoined)
				.isTrue()
			.bool(delivered)
				.isFalse()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : user});
		
		test
			.bool(delivered)
				.isTrue()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Let user successfully leave chat', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
				
		var user = new UserDTO(nickname, 'password');
		
		var userLeaved = false;
		
		eventBus.subscribe(events.USER_LEFT_CHAT, function(id) {
			userLeaved = (chatId === id);
		});
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : user});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(userLeaved)
				.isFalse()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
		
		chatService.onUserLeft({'chatId' : chatId, 'user' : user});
		
		test
			.bool(userLeaved)
				.isTrue()
			.array(joinedUsers)
				.isEmpty();
	});
	
	it('Avoid user leave chat he already left', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
				
		var user = new UserDTO(nickname, 'password');
		
		var delivered = false;
		var expectedMessage = 'You already left this chat';
		
		eventBus.subscribe(events.CHAT_LEAVING_FAILED, function(message) {
			delivered = (message === expectedMessage);
		});
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : user});
		
		var joinedUsers = createdChat.getUsers();
		
		test
			.bool(delivered)
				.isFalse()
			.array(joinedUsers)
				.isNotEmpty()
				.hasLength(1);
		
		chatService.onUserLeft({'chatId' : chatId, 'user' : user});
		
		test
			.bool(delivered)
				.isFalse()
			.array(joinedUsers)
				.isEmpty();
		
		chatService.onUserLeft({'chatId' : chatId, 'user' : user});
		
		test
			.bool(delivered)
				.isTrue()
			.array(joinedUsers)
				.isEmpty();
	});
	
	it('Add new messages', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : nickname});
		
		var messageCreated = false;
		var expectedMessageData = {'chatId' : chatId, 'messages': createdChat.getMessages()}
		
		eventBus.subscribe(events.MESSAGE_ADDED, function(messageData) {
			messageCreated = (messageData.chatId === expectedMessageData.chatId);
		});
		
		var messageInfo = {
			'message' : 'Hello',
			'chatId' : chatId,
			'user' : nickname
		};
		
		chatService.onMessageAdded(messageInfo);
		
		test
			.bool(messageCreated)
				.isTrue()
			.array(createdChat.getMessages())
				.isNotEmpty()
				.hasLength(1);
	});
	
	it('Avoid adding empty message', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
		
		chatService.onUserJoined({'chatName' : chatName, 'user' : nickname});
		
		var messageCreationFailed = false;
		var expectedErrorData = {
			'message' : 'You can not post empty message',
			'chatId' : chatId
		};
		
		eventBus.subscribe(events.MESSAGE_ADDING_FAILED, function(messageData) {
			messageCreationFailed = (messageData.message === expectedErrorData.message && messageData.chatId === expectedErrorData.chatId);
		});
		
		var messageInfo = {
			'message' : '',
			'chatId' : chatId,
			'user' : nickname
		};
		
		chatService.onMessageAdded(messageInfo);
		
		test
			.bool(messageCreationFailed)
				.isTrue()
			.array(createdChat.getMessages())
				.isEmpty();
	});
	
	it('Avoid post messages by not joined user', function(){
	
		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		var chatName = 'Chat';
		var nickname = 'User';
			
		var chat = {
			'chatName' : chatName,
			'owner' : nickname
		};
		
		var chatId = chatService.onChatAdded(chat);
		var createdChat = chatService.getChatByName(chatName);
		
		var messageCreationFailed = false;
		
		var expectedErrorData = {
			'message' : 'You can not post messages to the chat you are not joined',
			'chatId' : chatId
		};
		
		eventBus.subscribe(events.MESSAGE_ADDING_FAILED, function(messageData) {
			messageCreationFailed = (messageData.message === expectedErrorData.message && messageData.chatId === expectedErrorData.chatId);
		});
		
		var messageInfo = {
			'message' : 'Hello',
			'chatId' : chatId,
			'user' : nickname
		};
		
		chatService.onMessageAdded(messageInfo);
		
		test
			.bool(messageCreationFailed)
				.isTrue()
			.array(createdChat.getMessages())
				.isEmpty();
	});
});