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
		var chatName = chat.chatName.trim();
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
			eventBus.post(events.CHAT_LIST_UPDATED, chatList);
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
			eventBus.post(events.CHAT_JOINING_FAILED, errorMessages.USER_ALREADY_JOINED);
		} else {
			chat.addUser(user);
			eventBus.post(events.USER_JOINED_CHAT, {'chatId':chat.getId(), 'chatName':chat.getName(), 'messages' : chat.getMessages()});					
		}
	}
		
	var _onUserLeft = function(chatData) {
		var chat = _getChatById(chatData.chatId);
		var user = chatData.user;
		var index = chat.getUsers().indexOf(user);
		if (index < 0) {
			eventBus.post(events.CHAT_LEAVING_FAILED, errorMessages.USER_ALREADY_LEFT);
		} else {
			chat.getUsers().splice(index, 1);
			eventBus.post(events.USER_LEFT_CHAT, chat.getId());					
		}
	}
		
	var _onMessageAdded = function(messageData) {	
		var message = messageData.message;
		var chatId = messageData.chatId;
		var chat = _getChatById(chatId);
		var userList = chat.getUsers();
		var user = messageData.user;
		if (userList.indexOf(user) < 0) {
			var errorMessage = {
				'message' : errorMessages.USER_IS_NOT_JOINED_TO_CURRENT_CHAT,
				'chatId' : chatId
			};
			eventBus.post(events.MESSAGE_ADDING_FAILED, errorMessage);
		} else {
			if (message.trim() === '') {
				var errorMessage = {
					'message' : errorMessages.EMPTY_MESSAGE_NOT_ALLOWED,
					'chatId' : chatId
				};
				eventBus.post(events.MESSAGE_ADDING_FAILED, errorMessage);
			} else {
				chat.addMessage(new MessageDTO(user, message, messageData.color));
				eventBus.post(events.MESSAGE_ADDED, {'chatId' : chatId, 'messages': chat.getMessages()});				
			}
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
		'onUserLeft' : _onUserLeft, 
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