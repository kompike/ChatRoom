if (typeof define !== 'function') {
    var ChatDTO = require('../dto/chatDTO');
    var MessageDTO = require('../dto/messageDTO');
	var EventType = require('../events');
}

var ChatService = function(eventBus, storageService) {
		
	var _chatCollection = 'chats';
	
	var _addChat = function(chat) {
		
		var chatList = _getAllChats();
		if (typeof chatList === 'undefined') {
			storageService.createCollection(_chatCollection);			
		}		
		if (_checkIfChatExists(chat)) {
			eventBus.post(EventType.chatCreationFailed, "Chat already exists");			
		} else if (chat.name.trim() === '') {
			eventBus.post(EventType.chatCreationFailed, "Chat name must be filled");
		} else {
			var chatDTO = new ChatDTO(chat.name, chat.owner, new Array(), new Array());
			storageService.addItem(_chatCollection, chatDTO);				
			var chatList = _getAllChats();
			eventBus.post(EventType.chatListUpdated, chatList);
		}		
	}
		
	var _onChatAdded = function(chat) {
		_addChat(chat);
	}
		
	var _onUserJoined = function(chatData) {
		var chat = _getChatByName(chatData.chatName);
		chat.addUser(chatData.user);		
	}
		
	var _onMessageListCreated = function(chatName) {
		var chat = _getChatByName(chatName);
		var messageList = chat.getMessages();
		var messageData = {
			'messageList' : messageList,
			'chatName' : chatName
		};
		eventBus.post(EventType.messageListCreated, messageData);
	}
		
	var _onMessageAdded = function(messageData) {	
		var message = messageData.message;
		if (message.trim() === '') {
			var errorData = {
				'errorMessage': 'You can not post empty message',
				'chatName' : messageData.chatName
			};
			eventBus.post(EventType.messageAddingFailed, errorData);
		} else {
			var chat = _getChatByName(messageData.chatName);
			var author = messageData.user;
			var messageDTO = new MessageDTO(author, message);
			chat.addMessage(messageDTO);
			var messageInfo = {
				'message' : messageDTO,
				'chatName' : messageData.chatName
			};
			eventBus.post(EventType.messageAdded, messageInfo);
		}
	}
	
	var _checkIfChatExists = function(chat) {
		return storageService.findItemByName(_chatCollection, chat.name) !== null;
	}
	
	var _getChatByName = function(chatName) {
		var chat = storageService.findItemByName(_chatCollection, chatName);
		return chat;
	}
	
	var _getAllChats = function() {
		console.log('Looking for all available chats...');
		if (typeof storageService.findAll(_chatCollection) === 'undefined') {
			storageService.createCollection(_chatCollection);
		}			
		var chatList = storageService.findAll(_chatCollection);
		return chatList;
	}
	
	return {
		'onChatAdded' : _onChatAdded,
		'onMessageAdded' : _onMessageAdded,
		'onMessageListCreated' : _onMessageListCreated,
		'onUserJoined' : _onUserJoined, 
		'getAllChats' : _getAllChats,
		'getChatByName' : _getChatByName		
	};	
}

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
	return ChatService;
});