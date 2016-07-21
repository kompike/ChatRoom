if (typeof define !== 'function') {
    var ChatDTO = require('../dto/chatDTO');
    var MessageDTO = require('../dto/messageDTO');
	var events = require('../events');
	var errorMessages = require('../errormessages');
}

var ChatService = function(eventBus, storageService) {
			
	var _chatCollection = 'chat';
	
	var _addChat = function(chat) {
		
		var newChatId = null;
		var chatList = _getAllChats();
		var chatName = chat.name.trim();
		if (typeof chatList === 'undefined') {
			storageService.createCollection(_chatCollection);			
		}
		if (_checkIfChatExists(chatName)) {
			eventBus.post(events.CHAT_CREATION_FAILED, errorMessages.CHAT_ALREADY_EXISTS);			
		} else if (chatName === '') {
			eventBus.post(events.CHAT_CREATION_FAILED, errorMessages.CHATNAME_MUST_BE_FILLED);
		} else {
			var chatDTO = new ChatDTO(chatName, chat.owner, new Array(), new Array());
			newChatId = storageService.addItem(_chatCollection, chatDTO);
			var chatList = _getAllChats();
			eventBus.post(events.CHAT_CREATED, chatList);
		}
		
		return newChatId;
	}
		
	var _onChatAdded = function(chat) {
		return _addChat(chat);
	}
		
	var _onUserJoined = function(chatData) {
		var chat = _getChatByName(chatData.chatName);
		var userList = chat.getUsers();
		var user = chatData.user;
		if (userList.indexOf(user) > -1) {
			eventBus.post(events.USER_JOINING_FAILED, errorMessages.USER_ALREADY_JOINED);
		} else {
			chat.addUser(user);
			eventBus.post(events.USER_JOINED, {'id':chat.getId(), 'chatName':chat.getName(), 'messages' : chat.getMessages()});					
		}
	}
		
	var _onUserLeaved = function(chatData) {
		var chat = _getChatById(chatData.chatId);
		var user = chatData.user;
		var index = chat.getUsers().indexOf(user);
		if (index < 0) {
			eventBus.post(events.USER_LEAVING_FAILED, errorMessages.USER_ALREADY_LEAVED);
		} else {
			chat.getUsers().splice(index, 1);
			eventBus.post(events.CHAT_LEAVED, chat.getId());					
		}
	}
		
	var _onMessageAdded = function(messageData) {	
		var message = messageData.message.trim();
		if (message === '') {
			var errorMessage = {
				'message' : errorMessages.EMPTY_MESSAGE_NOT_ALLOWED,
				'chatId' : messageData.chatId
			};
			eventBus.post(events.MESSAGE_ADDING_FAILED, errorMessage);
		} else {
			var chat = _getChatById(messageData.chatId);
			chat.addMessage(new MessageDTO(messageData.user, message, messageData.color));
			eventBus.post(events.MESSAGE_ADDED, {'id' : messageData.chatId, 'messages': chat.getMessages()});
		}
	}
	
	var _checkIfChatExists = function(chatName) {
		return storageService.findItemByName(_chatCollection, chatName) !== null;
	}
	
	var _getChatByName = function(chatName) {
		var chat = storageService.findItemByName(_chatCollection, chatName);
		return chat;
	}
	
	var _getChatById = function(chatId) {
		var chat = storageService.findItemById(_chatCollection, chatId);
		return chat;
	}
	
	var _getAllChats = function() {
		if (typeof storageService.findAll(_chatCollection) === 'undefined') {
			storageService.createCollection(_chatCollection);
		}			
		var chatList = storageService.findAll(_chatCollection);
		return chatList;
	}
	
	return {
		'onChatAdded' : _onChatAdded,
		'onMessageAdded' : _onMessageAdded,
		'onUserJoined' : _onUserJoined, 
		'onUserLeaved' : _onUserLeaved, 
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