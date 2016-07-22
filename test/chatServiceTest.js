var StorageService = require('../scripts/service/storageservice');
var ChatService = require('../scripts/service/chatservice');
var ErrorMessages = require('../scripts/errorMessages');
var UserDTO = require('../scripts/dto/userDTO');
var EventBus = require('../scripts/eventbus');
var Events = require('../scripts/events');

var eventBus = new EventBus();

var test = require('unit.js');

/* TESTS */

describe('Chat service should', function(){
	
	it('allow to create new chat', function(){	

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var chatName = 'Chat';
		var owner = 'User';
		
		eventBus.subscribe(Events.CHAT_LIST_UPDATED, function(chatList) {
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
	
	it('prohibit creation of already existing chat', function(){		

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = ErrorMessages.CHAT_ALREADY_EXISTS;
		var isChatCreated = false;
		var chatName = 'Chat';
		
		eventBus.subscribe(Events.CHAT_LIST_UPDATED, function(chatList) {
			isChatCreated = (chatList.length === 1);
		});
		
		eventBus.subscribe(Events.CHAT_CREATION_FAILED, function(message) {
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
	
	it('trim chat name while creating new chat', function(){		

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = ErrorMessages.CHAT_ALREADY_EXISTS;
		var isChatCreated = false;
		var chatName = 'Chat';
		var chatNameWithWhitespaces = '   Chat  ';
		var owner = 'User';
		
		eventBus.subscribe(Events.CHAT_LIST_UPDATED, function(chatList) {
			isChatCreated = (chatList.length === 1);
		});
		
		eventBus.subscribe(Events.CHAT_CREATION_FAILED, function(message) {
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
	
	it('prohibit creation of chat with empty name', function(){

		var storage = new StorageService();
		var chatService = new ChatService(eventBus, storage);
		
		var delivered = false;
		var expectedMessage = ErrorMessages.CHATNAME_MUST_BE_FILLED;
		
		eventBus.subscribe(Events.CHAT_CREATION_FAILED, function(message) {
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
	
	it('allow user to join the chat', function(){
	
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
		
		eventBus.subscribe(Events.USER_JOINED_CHAT, function(chatData) {
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
	
	it('prohibit user to join the chat he already joined', function(){
	
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
		var expectedMessage = ErrorMessages.USER_ALREADY_JOINED;
			
		var userJoined = false;
		
		eventBus.subscribe(Events.USER_JOINED_CHAT, function(chatData) {
			userJoined = (chatName === chatData.chatName && chatId === chatData.chatId);
		});
		
		eventBus.subscribe(Events.CHAT_JOINING_FAILED, function(message) {
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
	
	it('allow user to leave chat', function(){
	
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
		
		eventBus.subscribe(Events.USER_LEFT_CHAT, function(id) {
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
	
	it('prohibit user to leave the chat he already left', function(){
	
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
		var expectedMessage = ErrorMessages.USER_ALREADY_LEFT;
		
		eventBus.subscribe(Events.CHAT_LEAVING_FAILED, function(message) {
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
	
	it('allow user to add new messages', function(){
	
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
		
		eventBus.subscribe(Events.MESSAGE_ADDED, function(messageData) {
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
	
	it('prohibit user to add empty message', function(){
	
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
			'message' : ErrorMessages.EMPTY_MESSAGE_NOT_ALLOWED,
			'chatId' : chatId
		};
		
		eventBus.subscribe(Events.MESSAGE_ADDING_FAILED, function(messageData) {
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
	
	it('prohibit user to post messages in the chat he does not joined', function(){
	
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
			'message' : ErrorMessages.USER_IS_NOT_JOINED_TO_CURRENT_CHAT,
			'chatId' : chatId
		};
		
		eventBus.subscribe(Events.MESSAGE_ADDING_FAILED, function(messageData) {
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